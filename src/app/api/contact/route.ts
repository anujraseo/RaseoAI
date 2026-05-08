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

    // Verify reCAPTCHA (skip in dev)
    if (recaptchaToken && recaptchaToken !== 'dev_token' && process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== 'placeholder') {
      const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      })
      const captchaData = await captchaRes.json()
      if (!captchaData.success || captchaData.score < 0.5) {
        return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 })
      }
    }

    // Send email using Resend
    await sendContactEmail({ name, email, phone, subject, message })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact form error:', err.message)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}

async function sendContactEmail({
  name, email, phone, subject, message,
}: {
  name: string; email: string; phone?: string; subject?: string; message: string
}) {
  const TO = 'contact@raseotech.com'
  const FROM = process.env.EMAIL_FROM ?? 'RaseoAI <onboarding@resend.dev>'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="580" style="max-width:580px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a0e1a,#1e3a5f);border-radius:16px 16px 0 0;padding:28px 32px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="display:inline-block;width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:8px;text-align:center;line-height:32px;color:#fff;font-weight:800;font-size:14px;">R</div>
      <span style="color:#fff;font-size:18px;font-weight:700;vertical-align:middle;margin-left:8px;">Raseo<span style="color:#38bdf8;">AI</span></span>
    </div>
    <h2 style="color:#fff;font-size:20px;font-weight:700;margin:16px 0 4px;">New Contact Form Message</h2>
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Someone submitted the contact form on raseotech.com</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:28px 32px;">

    <table width="100%" style="margin-bottom:20px;">
      ${[
        ['Name', name],
        ['Email', email],
        ['Phone', phone || 'Not provided'],
        ['Subject', subject || 'Not specified'],
      ].map(([label, val]) => `
      <tr>
        <td style="font-size:12px;color:#888;padding:6px 0;width:100px;vertical-align:top;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">${label}</td>
        <td style="font-size:14px;color:#111;padding:6px 0;">${val}</td>
      </tr>`).join('')}
    </table>

    <div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:16px 18px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Message</div>
      <p style="font-size:14px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
    </div>

    <div style="display:flex;gap:10px;">
      <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">Reply to ${name}</a>
      ${phone ? `<a href="https://wa.me/${phone.replace(/\D/g, '')}" style="display:inline-block;background:#25D366;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">💬 WhatsApp</a>` : ''}
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:16px 32px;border-top:1px solid #e2e8f0;">
    <p style="font-size:11px;color:#aaa;margin:0;">This message was sent from the contact form at raseotech.com</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const provider = process.env.EMAIL_PROVIDER ?? 'resend'

  if (provider === 'resend') {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `📬 New Contact: ${subject || name} — RaseoAI`,
      html,
    })
    return
  }

  // SMTP fallback
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await transporter.sendMail({
    from: FROM, to: TO, replyTo: email,
    subject: `📬 New Contact: ${subject || name} — RaseoAI`,
    html,
  })
}
