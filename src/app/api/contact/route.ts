import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
  recaptchaToken: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    const { name, email, phone, subject, message, recaptchaToken } = parsed.data

    if (recaptchaToken && recaptchaToken !== 'dev_token' && process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== 'placeholder') {
      const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      })
      const d = await r.json()
      if (!d.success || d.score < 0.5) {
        return NextResponse.json({ error: 'Captcha failed.' }, { status: 400 })
      }
    }

    await sendEmail({ name, email, phone, subject, message })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact error:', err.message)
    return NextResponse.json({ error: 'Failed to send.' }, { status: 500 })
  }
}

async function sendEmail(data: {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}) {
  const TO = 'contact@raseotech.com'
  const FROM = process.env.EMAIL_FROM ?? 'RaseoAI <onboarding@resend.dev>'
  const SUBJ = `New Contact: ${data.subject || data.name} - RaseoAI`
  const html = `<html><body style="font-family:Arial;padding:20px;">
    <h2>New Contact from ${data.name}</h2>
    <p><b>Email:</b> ${data.email}</p>
    <p><b>Phone:</b> ${data.phone || 'Not provided'}</p>
    <p><b>Subject:</b> ${data.subject || 'Not specified'}</p>
    <p><b>Message:</b></p>
    <p style="background:#f5f5f5;padding:16px;border-radius:8px;">${data.message}</p>
    <a href="mailto:${data.email}" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reply to ${data.name}</a>
  </body></html>`

  if (process.env.EMAIL_PROVIDER !== 'smtp') {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: data.email,
      subject: SUBJ,
      html,
    })
    return
  }

  const nodemailer = await import('nodemailer')
  const t = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await t.sendMail({ from: FROM, to: TO, replyTo: data.email, subject: SUBJ, html })
}
