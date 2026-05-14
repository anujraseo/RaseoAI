import { NextRequest } from 'next/server'
import { query } from './db'

// ============================================================
// SPAM PROTECTION LAYER
// Multiple checks: rate limit, IP block, URL validation,
// honeypot, request fingerprinting
// ============================================================

// Known spam/bot IP ranges and bad actors
const BLOCKED_IPS: string[] = [
  // Add specific IPs here if needed
]

// Suspicious user agents (bots, scrapers)
const BLOCKED_UA_PATTERNS = [
  'python-requests', 'curl/', 'wget/', 'scrapy', 'bot', 'crawler',
  'spider', 'scan', 'nikto', 'sqlmap', 'nmap', 'masscan',
]

// Disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'spam4.me', 'trashmail.com', 'trashmail.me',
  'dispostable.com', 'maildrop.cc', 'mintemail.com', 'spamgourmet.com',
  'tempr.email', 'discard.email', 'fakeinbox.com', 'mailnull.com',
]

export interface SpamCheckResult {
  blocked: boolean
  reason?: string
  statusCode?: number
}

// ============================================================
// Main spam check function
// ============================================================
export async function checkSpam(
  req: NextRequest,
  options: {
    checkRateLimit?: boolean
    maxRequestsPerHour?: number
    checkUserAgent?: boolean
    endpoint?: string
  } = {}
): Promise<SpamCheckResult> {

  const ip = getIp(req)
  const ua = req.headers.get('user-agent') ?? ''

  // 1. Check blocked IPs
  if (BLOCKED_IPS.includes(ip)) {
    return { blocked: true, reason: 'IP blocked', statusCode: 403 }
  }

  // 2. Check suspicious user agents
  if (options.checkUserAgent !== false) {
    const uaLower = ua.toLowerCase()
    const isSuspicious = BLOCKED_UA_PATTERNS.some(p => uaLower.includes(p))
    if (isSuspicious && !ua.includes('RaSEOTechBot')) {
      return { blocked: true, reason: 'Suspicious user agent', statusCode: 403 }
    }
  }

  // 3. Check missing headers (bots often skip these)
  const acceptHeader = req.headers.get('accept')
  if (!acceptHeader || acceptHeader === '*/*') {
    // Allow API calls but flag missing accept
    const referer = req.headers.get('referer')
    if (!referer && !ua.includes('Mozilla')) {
      return { blocked: true, reason: 'Missing browser headers', statusCode: 403 }
    }
  }

  // 4. Rate limiting
  if (options.checkRateLimit !== false) {
    const maxPerHour = options.maxRequestsPerHour ?? 10
    const endpoint = options.endpoint ?? 'general'
    const rateLimited = await checkRateLimit(ip, endpoint, maxPerHour)
    if (rateLimited) {
      return { blocked: true, reason: 'Rate limit exceeded', statusCode: 429 }
    }
  }

  return { blocked: false }
}

// ============================================================
// Rate limit check using DB
// ============================================================
async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxPerHour: number
): Promise<boolean> {
  try {
    const key = `${endpoint}:${ip}`
    const result = await query<any>(
      'SELECT check_rate_limit($1, $2, $3, $4) as limited',
      [key, endpoint, maxPerHour, '1 hour']
    )
    return result[0]?.limited ?? false
  } catch {
    return false // Don't block if DB check fails
  }
}

// ============================================================
// Validate URL — reject obvious spam/test URLs
// ============================================================
export function validateAuditUrl(url: string): SpamCheckResult {
  try {
    const parsed = new URL(url)

    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { blocked: true, reason: 'Invalid URL protocol' }
    }

    // Block localhost and private IPs
    const hostname = parsed.hostname.toLowerCase()
    const blockedHosts = [
      'localhost', '127.0.0.1', '0.0.0.0', '::1',
      '10.', '192.168.', '172.16.', '172.17.',
    ]
    if (blockedHosts.some(h => hostname.startsWith(h) || hostname === h)) {
      return { blocked: true, reason: 'Private/local URLs not allowed' }
    }

    // Block obviously fake domains
    if (hostname.length < 4 || !hostname.includes('.')) {
      return { blocked: true, reason: 'Invalid domain' }
    }

    // Block IP addresses as URLs
    const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
    if (ipPattern.test(hostname)) {
      return { blocked: true, reason: 'IP addresses not allowed as audit targets' }
    }

    return { blocked: false }
  } catch {
    return { blocked: true, reason: 'Malformed URL' }
  }
}

// ============================================================
// Validate email — reject disposable emails
// ============================================================
export function validateEmail(email: string): SpamCheckResult {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return { blocked: true, reason: 'Invalid email format' }
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { blocked: true, reason: 'Disposable email addresses not allowed' }
  }

  return { blocked: false }
}

// ============================================================
// Check honeypot field (invisible field bots fill in)
// ============================================================
export function checkHoneypot(honeypotValue: string | undefined): boolean {
  // If the honeypot field has any value, it's a bot
  return !!(honeypotValue && honeypotValue.trim().length > 0)
}

// ============================================================
// Extract real IP from request
// ============================================================
export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    req.headers.get('cf-connecting-ip') ?? // Cloudflare
    '0.0.0.0'
  )
}

// ============================================================
// Block an IP manually (call from admin)
// ============================================================
export async function blockIp(ip: string, reason: string): Promise<void> {
  await query(
    `INSERT INTO blocked_ips (ip_address, reason) 
     VALUES ($1, $2) 
     ON CONFLICT (ip_address) DO UPDATE SET reason = $2, updated_at = NOW()`,
    [ip, reason]
  )
}

// ============================================================
// Get spam stats for dashboard
// ============================================================
export async function getSpamStats(): Promise<any> {
  try {
    const [rateStats, recentBlocks] = await Promise.all([
      query<any>(`
        SELECT limit_type, SUM(request_count) as total_requests, COUNT(*) as unique_ips
        FROM rate_limits
        WHERE window_start > NOW() - INTERVAL '24 hours'
        GROUP BY limit_type
      `),
      query<any>(`
        SELECT identifier, request_count, window_start
        FROM rate_limits
        WHERE request_count > 10
        AND window_start > NOW() - INTERVAL '24 hours'
        ORDER BY request_count DESC
        LIMIT 10
      `),
    ])
    return { rateStats, recentBlocks }
  } catch {
    return { rateStats: [], recentBlocks: [] }
  }
}
