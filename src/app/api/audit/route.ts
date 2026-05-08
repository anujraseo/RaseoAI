import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAudit, runAudit, isRateLimited } from '@/lib/auditService'

const SubmitSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  recaptchaToken: z.string().min(1, 'Captcha is required'),
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

    const { url, recaptchaToken } = parsed.data

    const captchaValid = await verifyRecaptcha(recaptchaToken)
    if (!captchaValid) {
      return NextResponse.json(
        { error: 'Captcha verification failed. Please try again.' },
        { status: 400 }
      )
    }

    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp ? realIp : '0.0.0.0'

    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname.replace(/^www\./, '')

    const rateLimited = await isRateLimited(ip, domain)
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const audit = await createAudit(url, ip)

    runAudit(audit.id).catch((err: Error) => {
      console.error('Audit failed:', audit.id, err)
    })

    return NextResponse.json({
      auditId: audit.id,
      status: 'pending',
    })
   } catch (err: any) {
    console.error('POST /api/audit error FULL:', err?.message, err?.stack)
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
    return data.success === true
  } catch {
    return false
  }
}