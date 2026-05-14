import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAudit, runAudit, isRateLimited } from '@/lib/auditService'
import { checkSpam, validateAuditUrl, checkHoneypot, getIp } from '@/lib/spamProtection'

export const maxDuration = 60

const SubmitSchema = z.object({
  url:            z.string().url('Please enter a valid URL'),
  recaptchaToken: z.string().min(1, 'Captcha is required'),
  honeypot:       z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { url, recaptchaToken, honeypot } = parsed.data

    // 1. Honeypot — silent bot block
    if (checkHoneypot(honeypot)) {
      return NextResponse.json({ auditId: 'blocked', status: 'pending' })
    }

    // 2. Spam protection
    const spamCheck = await checkSpam(req, {
      maxRequestsPerHour: Number(process.env.RATE_LIMIT_PER_IP) || 5,
      endpoint: 'audit',
    })

    if (spamCheck.blocked) {
      return NextResponse.json(
        { error: spamCheck.reason === 'Rate limit exceeded'
            ? 'Too many requests. You can audit up to 5 sites per hour. Please try again later.'
            : 'Request blocked. Please try again.' },
        { status: spamCheck.statusCode ?? 429 }
      )
    }

    // 3. URL validation
    const urlCheck = validateAuditUrl(url)
    if (urlCheck.blocked) {
      return NextResponse.json({ error: urlCheck.reason ?? 'Invalid URL' }, { status: 400 })
    }

    // 4. reCAPTCHA
    const captchaValid = await verifyRecaptcha(recaptchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // 5. Per-domain rate limit
    const ip = getIp(req)
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname.replace(/^www\./, '')

    const rateLimited = await isRateLimited(ip, domain)
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // 6. Create and run audit
    const audit = await createAudit(url, ip)
    runAudit(audit.id).catch((err: Error) => {
      console.error('Audit failed:', audit.id, err)
    })

    return NextResponse.json({ auditId: audit.id, status: 'pending' })

  } catch (err: any) {
    console.error('POST /api/audit error:', err?.message)
    return NextResponse.json(
      { error: 'Failed to start audit. Please try again.' },
      { status: 500 }
    )
  }
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY === 'placeholder') {
    return true
  }
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })
    const data = await res.json()
    return data.success === true && (data.score ?? 1) >= 0.5
  } catch {
    return false
  }
}
