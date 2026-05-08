import { NextRequest, NextResponse } from 'next/server'
import { getAuditResult } from '@/lib/auditService'

export const maxDuration = 30

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const auditId = searchParams.get('id')

  if (!auditId) {
    return NextResponse.json({ error: 'Missing audit ID' }, { status: 400 })
  }

  const result = await getAuditResult(auditId)
  if (!result || result.audit.status !== 'completed') {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  }

  const { audit, issues, domain } = result
  const domainName = domain?.domain ?? new URL(audit.url).hostname
  const html = buildPrintableHtml(audit, issues as any[], domainName)

  // Return as HTML with print styles — user prints to PDF from browser
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

function escHtml(str: string | null | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function scoreColor(s: number | null | undefined): string {
  if (!s) return '#888'
  if (s >= 80) return '#22c55e'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

function buildPrintableHtml(audit: any, issues: any[], domain: string): string {
  const criticals = issues.filter(i => i.severity === 'critical')
  const warnings  = issues.filter(i => i.severity === 'warning')
  const passed    = issues.filter(i => i.severity === 'pass')
  const gradeColor = scoreColor(audit.overall_score)
  const scanDate = new Date(audit.completed_at ?? audit.created_at)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  const issueRows = (list: any[]) => list.map(issue => {
    const colors: Record<string, { border: string; badge: string; text: string }> = {
      critical: { border: '#ef4444', badge: '#fff1f0', text: '#cf1322' },
      warning:  { border: '#f59e0b', badge: '#fffbe6', text: '#874d00' },
      pass:     { border: '#22c55e', badge: '#f6ffed', text: '#237804' },
      info:     { border: '#3b82f6', badge: '#e6f4ff', text: '#0958d9' },
    }
    const c = colors[issue.severity] ?? colors.info
    return `
    <div style="margin-bottom:10px;padding:14px 16px;background:#fafafa;border-radius:8px;border-left:3px solid ${c.border};page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:13px;font-weight:600;color:#111;">${escHtml(issue.name)}</span>
        <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:${c.badge};color:${c.text};font-weight:500;">
          ${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
        </span>
      </div>
      <p style="font-size:12px;color:#555;margin:0 0 ${issue.fix_text ? '8px' : '0'};">${escHtml(issue.description)}</p>
      ${issue.fix_text ? `
        <div style="font-size:11px;font-weight:600;color:#2563eb;margin-bottom:4px;">HOW TO FIX</div>
        <p style="font-size:11px;color:#333;background:#eff6ff;padding:8px 10px;border-radius:4px;margin:0;">${escHtml(issue.fix_text)}</p>
      ` : ''}
    </div>`
  }).join('')

  const catBar = (label: string, val: number | null) => {
    const v = val ?? 0
    const color = scoreColor(val)
    return `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:#555;">${label}</span>
        <span style="font-size:12px;font-weight:600;color:${color};">${v}/100</span>
      </div>
      <div style="height:6px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${v}%;background:${color};border-radius:4px;"></div>
      </div>
    </div>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Audit Report — ${escHtml(domain)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; }

  @media print {
    .no-print { display: none !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page-break { page-break-before: always; }
  }

  @media screen {
    body { background: #f3f4f6; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
  }
</style>
</head>
<body>

<!-- Print button — hidden when printing -->
<div class="no-print" style="background:#1e3a5f;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;">
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;">R</div>
    <span style="color:#fff;font-weight:700;font-size:16px;">Raseo<span style="color:#38bdf8;">AI</span> — SEO Audit Report</span>
  </div>
  <button onclick="window.print()" style="background:linear-gradient(135deg,#3b82f6,#06b6d4);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;padding:10px 22px;cursor:pointer;">
    🖨️ Download as PDF
  </button>
</div>

<div class="container">

  <!-- Cover -->
  <div style="background:linear-gradient(135deg,#0a0e1a,#1e3a5f);border-radius:16px;padding:40px;margin-bottom:24px;color:#fff;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">R</div>
      <span style="font-size:18px;font-weight:700;">Raseo<span style="color:#38bdf8;">AI</span></span>
      <span style="margin-left:auto;font-size:12px;color:rgba(255,255,255,0.4);">AI SEO Audit Report</span>
    </div>

    <div style="font-size:12px;color:#38bdf8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;">Full SEO Audit Report</div>
    <h1 style="font-size:32px;font-weight:800;margin-bottom:6px;">${escHtml(domain)}</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:32px;">${escHtml(audit.url)}</p>

    <div style="display:flex;gap:40px;flex-wrap:wrap;">
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:800;color:${gradeColor};">${audit.overall_score ?? 0}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);">Overall Score /100</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;justify-content:center;">
        <div style="font-size:14px;color:rgba(255,255,255,0.8);">🔴 <strong style="color:#f87171;">${audit.critical_count}</strong> Critical Issues</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.8);">🟡 <strong style="color:#fbbf24;">${audit.warning_count}</strong> Warnings</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.8);">🟢 <strong style="color:#4ade80;">${audit.passed_count}</strong> Checks Passed</div>
        <div style="font-size:14px;color:rgba(255,255,255,0.8);">📊 <strong style="color:#60a5fa;">${audit.total_checks}</strong> Total Checks</div>
      </div>
    </div>

    <div style="margin-top:28px;padding-top:20px;border-top:0.5px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3);">
      <span>Generated by raseotech.com</span>
      <span>${scanDate}</span>
    </div>
  </div>

  <!-- AI Summary -->
  ${audit.ai_summary ? `
  <div style="background:#eff6ff;border-left:3px solid #3b82f6;padding:18px 20px;border-radius:0 10px 10px 0;margin-bottom:20px;">
    <div style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">🤖 AI Summary</div>
    <p style="font-size:13px;color:#1e3a5f;line-height:1.7;">${escHtml(audit.ai_summary)}</p>
  </div>` : ''}

  <!-- Category Scores -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
    <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;">Category Scores</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;">
      ${catBar('On-page SEO', audit.score_meta)}
      ${catBar('Content', audit.score_content)}
      ${catBar('Performance', audit.score_performance)}
      ${catBar('Technical SEO', audit.score_technical)}
      ${catBar('Mobile', audit.score_mobile)}
      ${catBar('Security', audit.score_security)}
    </div>
  </div>

  <!-- Critical Issues -->
  ${criticals.length > 0 ? `
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
    <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;color:#ef4444;">🔴 Critical Issues (${criticals.length})</h2>
    ${issueRows(criticals)}
  </div>` : ''}

  <!-- Warnings -->
  ${warnings.length > 0 ? `
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
    <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;color:#f59e0b;">🟡 Warnings (${warnings.length})</h2>
    ${issueRows(warnings)}
  </div>` : ''}

  <!-- Passed -->
  ${passed.length > 0 ? `
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
    <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;color:#22c55e;">✅ Passed Checks (${passed.length})</h2>
    ${issueRows(passed)}
  </div>` : ''}

  <!-- Footer -->
  <div style="text-align:center;padding:24px;background:#f9fafb;border-radius:12px;margin-bottom:40px;">
    <p style="font-size:13px;color:#555;">Report generated by <strong>RaseoAI</strong> — Free AI SEO Audit Tool</p>
    <p style="font-size:12px;color:#888;margin-top:4px;">raseotech.com · ${scanDate}</p>
  </div>

</div>
</body>
</html>`
}