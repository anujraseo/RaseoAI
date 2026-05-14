import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const html = `<html><body>
      <h2>New Contact: ${name}</h2>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone || 'Not provided'}</p>
      <p><b>Subject:</b> ${subject || 'Not specified'}</p>
      <p><b>Message:</b> ${message}</p>
    </body></html>`

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? 'RaseoAI <onboarding@resend.dev>',
        to: 'hello@ai-seoaudit.com',
        reply_to: email,
        subject: `New Contact: ${subject || name} - RaseoAI`,
        html,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact error:', err.message)
    return NextResponse.json({ error: 'Failed to send.' }, { status: 500 })
  }
}
