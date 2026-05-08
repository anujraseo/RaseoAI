import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuditResult } from '@/lib/auditService'
import { AuditIssue, IssueSeverity } from '@/types'

// ============================================================
// POST /api/send-report
// Body: { auditId: string, email: string }
//
// Sends a branded HTML email with the audit summary.
// Uses Resend (recommended) or falls back to Nodemailer/SMTP.
// Install Resend: npm install resend
// ============================================================

const SendSchema = z.object({
  auditId: z.string().uuid(),
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { auditId, email } = parsed.data

    const result = await getAuditResult(auditId)
    if (!result || result.audit.status !== 'completed') {
      return NextResponse.json({ error: 'Audit not found or not completed' }, { status: 404 })
    }

    const { audit, issues, domain } = result
    const domainName = domain?.domain ?? new URL(audit.url).hostname

    const html = buildEmailHtml(audit, issues, domainName)
    const subject = `Your SEO Audit Report for ${domainName} — Score: ${audit.overall_score}/100`

    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ success: true, message: `Report sent to ${email}` })
  } catch (err: any) {
    console.error('send-report error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}

// ============================================================
// Email sending — Resend (primary) or SMTP fallback
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const provider = process.env.EMAIL_PROVIDER ?? 'resend'

  if (provider === 'resend') {
    // npm install resend
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'RaSEOTech <reports@raseotech.com>',
      to,
      subject,
      html,
    })
    return
  }

  // SMTP fallback (Nodemailer)
  // npm install nodemailer @types/nodemailer
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'RaSEOTech <reports@raseotech.com>',
    to,
    subject,
    html,
  })
}

// ============================================================
// HTML Email Template
// ============================================================

function buildEmailHtml(audit: any, issues: AuditIssue[], domain: string): string {
  const gradeColor = scoreColor(audit.overall_score)

  const topIssues = issues
    .filter(i => i.severity === 'critical' || i.severity === 'warning')
    .sort((a, b) => b.score_impact - a.score_impact)
    .slice(0, 5)

  const scanDate = new Date(audit.completed_at ?? audit.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const sevStyle: Record<IssueSeverity, { border: string; badge: string; text: string }> = {
    critical: { border: '#f5222d', badge: '#fff1f0', text: '#cf1322' },
    warning:  { border: '#faad14', badge: '#fffbe6', text: '#874d00' },
    info:     { border: '#1677ff', badge: '#e6f4ff', text: '#0958d9' },
    pass:     { border: '#52c41a', badge: '#f6ffed', text: '#237804' },
  }

  const catScores = [
    { label: 'On-page SEO',  value: audit.score_meta },
    { label: 'Content',      value: audit.score_content },
    { label: 'Performance',  value: audit.score_performance },
    { label: 'Technical',    value: audit.score_technical },
    { label: 'Mobile',       value: audit.score_mobile },
    { label: 'Security',     value: audit.score_security },
  ]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://raseotech.com'
  const reportUrl = `${appUrl}/results/${audit.id}`
  const pdfUrl = `${appUrl}/api/pdf-export?id=${audit.id}`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Audit Report — ${escHtml(domain)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0a0e1a,#1e3a5f);border-radius:16px 16px 0 0;padding:28px 36px;">
    <table width="100%"><tr>
      <td>
        <div style="display:inline-flex;align-items:center;gap:10px;">
          <span style="display:inline-block;width:30px;height:30px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:7px;text-align:center;line-height:30px;color:#fff;font-weight:800;font-size:12px;">Ra</span>
          <span style="color:#fff;font-size:17px;font-weight:700;vertical-align:middle;">Ra<span style="color:#38bdf8;">SEO</span>Tech</span>
        </div>
      </td>
      <td align="right" style="color:rgba(255,255,255,0.4);font-size:12px;">SEO Audit Report</td>
    </tr></table>
  </td></tr>

  <!-- Score hero -->
  <tr><td style="background:#0f172a;padding:36px 36px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:0 0 6px;">Your SEO Score for</p>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 24px;">${escHtml(domain)}</h1>

    <!-- Big score circle (HTML fallback) -->
    <div style="display:inline-block;width:100px;height:100px;border-radius:50%;background:conic-gradient(${gradeColor} 0deg,${gradeColor} ${Math.round((audit.overall_score/100)*360)}deg,rgba(255,255,255,0.1) ${Math.round((audit.overall_score/100)*360)}deg);padding:12px;margin-bottom:12px;">
      <div style="width:76px;height:76px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;padding-top:16px;">
        <span style="font-size:26px;font-weight:800;color:${gradeColor};line-height:1;display:block;">${audit.overall_score}</span>
        <span style="font-size:10px;color:rgba(255,255,255,0.3);display:block;">/100</span>
      </div>
    </div>

    <div style="display:inline-block;margin-left:20px;vertical-align:top;padding-top:8px;text-align:left;">
      ${[
        ['🔴', audit.critical_count, '#f87171', 'Critical'],
        ['🟡', audit.warning_count,  '#fbbf24', 'Warnings'],
        ['🟢', audit.passed_count,   '#4ade80', 'Passed'],
      ].map(([icon, count, color, label]) => `
      <div style="margin-bottom:8px;">
        <span style="font-size:18px;font-weight:700;color:${color};display:inline-block;min-width:36px;">${count}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.45);">${label}</span>
      </div>`).join('')}
    </div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:32px 36px;">

    ${audit.ai_summary ? `
    <div style="background:#f0f9ff;border-left:3px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">🤖 AI Summary</p>
      <p style="font-size:13px;color:#1e3a5f;line-height:1.65;margin:0;">${escHtml(audit.ai_summary)}</p>
    </div>` : ''}

    <!-- Category scores -->
    <h2 style="font-size:15px;font-weight:700;color:#111;margin:0 0 14px;">Category Scores</h2>
    <table width="100%" style="margin-bottom:24px;">
      ${catScores.map(cat => `
      <tr>
        <td style="font-size:12px;color:#555;padding:4px 0;width:130px;">${cat.label}</td>
        <td style="padding:4px 10px;">
          <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;">
            <div style="background:${scoreColor(cat.value)};height:100%;width:${cat.value ?? 0}%;border-radius:4px;"></div>
          </div>
        </td>
        <td style="font-size:12px;font-weight:600;color:${scoreColor(cat.value)};width:28px;text-align:right;">${cat.value ?? 0}</td>
      </tr>`).join('')}
    </table>

    <!-- Top issues -->
    ${topIssues.length > 0 ? `
    <h2 style="font-size:15px;font-weight:700;color:#111;margin:0 0 14px;">Top Issues to Fix</h2>
    ${topIssues.map(issue => {
      const s = sevStyle[issue.severity]
      return `
      <div style="margin-bottom:10px;padding:12px 14px;background:#fafafa;border-radius:7px;border-left:3px solid ${s.border};">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:13px;font-weight:600;color:#111;">${escHtml(issue.name)}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:4px;background:${s.badge};color:${s.text};font-weight:500;">${issue.severity}</span>
        </div>
        <p style="font-size:12px;color:#666;margin:0;">${escHtml(issue.description)}</p>
      </div>`
    }).join('')}` : ''}

    <!-- CTA buttons -->
    <div style="text-align:center;margin-top:28px;">
      <a href="${reportUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;text-decoration:none;margin-right:12px;">View Full Report →</a>
      <a href="${pdfUrl}" style="display:inline-block;background:#f8fafc;color:#3b82f6;font-size:14px;font-weight:500;padding:13px 22px;border-radius:10px;text-decoration:none;border:1px solid #e2e8f0;">↓ Download PDF</a>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="font-size:12px;color:#888;margin:0 0 4px;">Generated by <strong>RaSEOTech</strong> — Free AI SEO Audit</p>
    <p style="font-size:11px;color:#aaa;margin:0;">${scanDate} · <a href="${appUrl}" style="color:#3b82f6;text-decoration:none;">raseotech.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`
}

function scoreColor(s: number | null | undefined): string {
  if (!s) return '#888'
  if (s >= 80) return '#52c41a'
  if (s >= 60) return '#faad14'
  return '#f5222d'
}

function escHtml(str: string | null | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
