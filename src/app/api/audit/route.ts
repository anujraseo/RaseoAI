cat > ~/Downloads/files/raseotech/src/app/api/audit/route.ts << 'ENDOFFILE'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAudit, isRateLimited } from '@/lib/auditService'
import { checkSpam, validateAuditUrl, checkHoneypot, getIp } from '@/lib/spamProtection'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const SubmitSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  recaptchaToken: z.string().min(1, 'Captcha is required'),
  honeypot: z.string().optional(),
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

    if (checkHoneypot(honeypot)) {
      return NextResponse.json({ auditId: 'blocked', status: 'pending' })
    }

    const urlCheck = validateAuditUrl(url)
    if (urlCheck.blocked) {
      return NextResponse.json({ error: urlCheck.reason ?? 'Invalid URL' }, { status: 400 })
    }

    const captchaValid = await verifyRecaptcha(recaptchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

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

    // Create audit record
    const audit = await createAudit(url, ip)

    // Trigger background processing via separate API call
    // This runs independently and won't timeout the response
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-seoaudit.com'
    fetch(`${baseUrl}/api/process-audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? 'internal123',
      },
      body: JSON.stringify({ auditId: audit.id }),
    }).catch(err => console.error('Background trigger error:', err.message))

    // Return immediately — don't wait for audit to complete
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
ENDOFFILE
echo "Audit route updated"