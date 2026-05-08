import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ContactSchema = z.object({
  name:           z.string().min(1),
  email:          z.string().email(),
  phone:          z.string().optional(),
  subject:        z.string().optional(),
  message:        z.string().min(1),
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
      const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      })
      const captchaData = await captchaRes.json()
      if (!captchaData.success || captchaData.score < 0.5) {
        return NextResponse.json({ error: 'Captcha verification failed.' }, { status: 400 })
      }
    }

    await sendContactEmail({ name, email, phone, subject, message })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact form error:', err.message)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}

async function sendContactEmail({ name, email, phone, subject, message }: {
  name: string; email: string; phone?: string; subject?: string; message: string
}) {
  const TO = 'contact@raseotech.com'
  const FROM = process.env.EMAIL_FROM ?? 'RaseoAI <onboarding@resend.dev>'
  const SUBJECT = `New Contact: ${subject || name} - RaseoAI`

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="560" style="max-width:560px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#0a0e1a,#1e3a5f);border-radius:16px 16px 0 0;padding:24px 28px;">
  <h2 style="color:#fff;font-size:20px;margin:0 0 4px;">New Contact Form Message</h2>
  <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">raseotech.com contact form</p>
</td></tr>
<tr><td style="background:#fff;padding:28px;">
  <table width="100%" style="margin-bottom:20px;border-collapse:collapse;">
    <tr><td style="font-size:11px;color:#888;padding:6px 0;width:80px;font-weight:700;text-transform:uppercase;">Name</td><td style="font-size:14px;color:#111;padding:6px 0;">${name}</td></tr>
    <tr><td style="font-size:11px;color:#888;padding:6px 0;font-weight:700;text-transform:uppercase;">Email</td><td style="font-size:14px;color:#111;padding:6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="font-size:11px;color:#888;padding:6px 0;font-weight:700;text-transform:uppercase;">Phone</td><td style="font-size:14px;color:#111;padding:6px 0;">${phone || 'Not provided'}</td></tr>
    <tr><td style="font-size:11px;color:#888;padding:6px 0;font-weight:700;text-transform:uppercase;">Subject</td><td style="font-size:14px;color:#111;padding:6px 0;">${subject || 'Not specified'}</td></tr>
  </table>
  <div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
    <div style="font-size:11px;font-weight:700;color:#3b82f6;margin-bottom:8px;text-transform:uppercase;">Message</div>
    <p style="font-size:14px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
  </div>
  <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">Reply to ${name}</a>
</td></tr>
<tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:14px 28px;border-top:1px solid #e2e8f0;">
  <p style="font-size:11px;color:#aaa;margin:0;">Sent from raseotech.com contact form</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`

  const provider = process.env.EMAIL_PROVIDER ?? 'resend'

  if (provider === 'resend') {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM,
      to: TO,
      reply_to: email,
      subject: SUBJECT,
      html,
    })
    return
  }

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.sendMail({
    from: FROM, to: TO, replyTo: email,
    subject: SUBJECT, html,
  })
}
