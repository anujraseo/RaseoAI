import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// Security Middleware
// Runs on every request — adds headers and blocks bad actors
// ============================================================

// Bot user agents to block at edge
const BOT_PATTERNS = [
  'python-requests', 'curl/', 'wget/', 'scrapy',
  'nikto', 'sqlmap', 'nmap', 'masscan', 'zgrab',
  'go-http-client', 'libwww-perl', 'php/',
]

// API routes that need protection
const PROTECTED_API_ROUTES = ['/api/audit', '/api/leads', '/api/contact']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua = req.headers.get('user-agent') ?? ''
  const uaLower = ua.toLowerCase()

  // 1. Block known bad bots on API routes
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    const isBot = BOT_PATTERNS.some(p => uaLower.includes(p))
    if (isBot) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Block requests with no user agent on API routes
    if (!ua && pathname === '/api/audit') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // 2. Add security headers to all responses
  const response = NextResponse.next()

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy (disable unnecessary browser features)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://*.supabase.co",
      "frame-src https://www.google.com",
    ].join('; ')
  )

  // HSTS (force HTTPS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
