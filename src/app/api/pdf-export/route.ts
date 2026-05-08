import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { getAuditResult } from '@/lib/auditService'
import { AuditIssue, IssueSeverity } from '@/types'

// ============================================================
// GET /api/pdf-export?id=<auditId>
// Generates a branded PDF report using Puppeteer HTML rendering
// ============================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const auditId = searchParams.get('id')

  if (!auditId || !/^[0-9a-f-]{36}$/.test(auditId)) {
    return NextResponse.json({ error: 'Invalid audit ID' }, { status: 400 })
  }

  const result = await getAuditResult(auditId)
  if (!result || result.audit.status !== 'completed') {
    return NextResponse.json({ error: 'Audit not found or not completed' }, { status: 404 })
  }

  const { audit, issues, domain } = result

  const html = buildReportHtml(audit, issues, domain?.domain ?? audit.url)

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    await browser.close()

    const filename = `seo-audit-${domain?.domain ?? 'report'}-${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {})
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

// ============================================================
// HTML template for the PDF report
// ============================================================

function buildReportHtml(audit: any, issues: AuditIssue[], domain: string): string {
  const sevColors: Record<IssueSeverity, { bg: string; text: string; dot: string }> = {
    critical: { bg: '#fff1f0', text: '#cf1322', dot: '#f5222d' },
    warning:  { bg: '#fffbe6', text: '#874d00', dot: '#faad14' },
    info:     { bg: '#e6f4ff', text: '#0958d9', dot: '#1677ff' },
    pass:     { bg: '#f6ffed', text: '#237804', dot: '#52c41a' },
  }

  const scoreColor = (s: number | null) => {
    if (!s) return '#888'
    if (s >= 80) return '#52c41a'
    if (s >= 60) return '#faad14'
    return '#f5222d'
  }

  const gradeColor = scoreColor(audit.overall_score)

  const criticals = issues.filter(i => i.severity === 'critical')
  const warnings  = issues.filter(i => i.severity === 'warning')
  const passed    = issues.filter(i => i.severity === 'pass')

  const issueRows = (list: AuditIssue[]) =>
    list.map(issue => {
      const c = sevColors[issue.severity]
      return `
      <div style="margin-bottom:10px;padding:14px 16px;background:#fafafa;border-radius:8px;border-left:3px solid ${c.dot};">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#111;">${escHtml(issue.name)}</span>
          <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:${c.bg};color:${c.text};font-weight:500;">
            ${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
          </span>
        </div>
        <p style="font-size:12px;color:#555;margin:0 0 ${issue.fix_text ? '8px' : '0'};">${escHtml(issue.description)}</p>
        ${issue.fix_text ? `
          <div style="font-size:11px;font-weight:600;color:#0066cc;margin-bottom:4px;">HOW TO FIX</div>
          <p style="font-size:11px;color:#333;background:#f0f7ff;padding:8px 10px;border-radius:4px;margin:0;">${escHtml(issue.fix_text)}</p>
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
        <span style="font-size:12px;font-weight:600;color:${color};">${v}</span>
      </div>
      <div style="height:5px;background:#eee;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${v}%;background:${color};border-radius:4px;"></div>
      </div>
    </div>`
  }

  const scanDate = new Date(audit.completed_at ?? audit.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Audit Report — ${domain}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
  @page { size: A4; margin: 0; }

  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
</style>
</head>
<body>

<!-- ======== COVER PAGE ======== -->
<div class="page" style="background:linear-gradient(145deg,#0a0e1a 60%,#0f172a 100%);min-height:297mm;padding:60px 48px;display:flex;flex-direction:column;">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:64px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:34px;height:34px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;">Ra</div>
      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Ra<span style="color:#38bdf8;">SEO</span>Tech</span>
    </div>
    <span style="color:rgba(255,255,255,0.35);font-size:12px;">AI SEO Audit Report</span>
  </div>

  <!-- Domain -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="font-size:12px;color:#38bdf8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;">Full SEO Audit Report</div>
    <h1 style="font-size:38px;color:#fff;font-weight:800;margin-bottom:10px;line-height:1.1;">${escHtml(domain)}</h1>
    <p style="color:rgba(255,255,255,0.45);font-size:14px;margin-bottom:48px;">${escHtml(audit.url)}</p>

    <!-- Score badge -->
    <div style="display:flex;align-items:center;gap:28px;">
      <div style="text-align:center;">
        <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(${gradeColor} 0deg,${gradeColor} ${Math.round((audit.overall_score/100)*360)}deg,rgba(255,255,255,0.1) ${Math.round((audit.overall_score/100)*360)}deg);display:flex;align-items:center;justify-content:center;">
          <div style="width:76px;height:76px;border-radius:50%;background:#0a0e1a;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:26px;font-weight:800;color:${gradeColor};line-height:1;">${audit.overall_score}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.3);">/100</span>
          </div>
        </div>
        <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:6px;">Overall Score</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px;">
        ${[
          ['Critical Issues', audit.critical_count, '#f87171'],
          ['Warnings',        audit.warning_count,  '#fbbf24'],
          ['Checks Passed',   audit.passed_count,   '#4ade80'],
          ['Total Checks',    audit.total_checks,   '#60a5fa'],
        ].map(([label, val, color]) => `
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:20px;font-weight:700;color:${color};min-width:32px;">${val}</span>
            <span style="font-size:12px;color:rgba(255,255,255,0.45);">${label}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="border-top:0.5px solid rgba(255,255,255,0.1);padding-top:20px;display:flex;justify-content:space-between;align-items:center;">
    <span style="color:rgba(255,255,255,0.3);font-size:11px;">Generated by raseotech.com</span>
    <span style="color:rgba(255,255,255,0.3);font-size:11px;">${scanDate}</span>
  </div>
</div>

<!-- ======== PAGE 2: SUMMARY + CATEGORY SCORES ======== -->
<div class="page" style="padding:48px;min-height:297mm;">

  <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #eee;">
    <div style="width:28px;height:28px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:11px;">Ra</div>
    <span style="font-size:15px;font-weight:700;color:#111;">Ra<span style="color:#3b82f6;">SEO</span>Tech</span>
    <span style="margin-left:auto;font-size:11px;color:#888;">${escHtml(domain)} · ${scanDate}</span>
  </div>

  ${audit.ai_summary ? `
  <div style="background:#f0f9ff;border-left:3px solid #3b82f6;padding:16px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
    <div style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">🤖 AI Summary</div>
    <p style="font-size:13px;color:#1e3a5f;line-height:1.65;">${escHtml(audit.ai_summary)}</p>
  </div>` : ''}

  <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;color:#111;">Category Scores</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;margin-bottom:32px;">
    ${catBar('On-page SEO / Meta', audit.score_meta)}
    ${catBar('Content Quality', audit.score_content)}
    ${catBar('Performance', audit.score_performance)}
    ${catBar('Technical SEO', audit.score_technical)}
    ${catBar('Mobile Friendliness', audit.score_mobile)}
    ${catBar('Security', audit.score_security)}
  </div>

  ${audit.ai_priority_fixes?.length ? `
  <h2 style="font-size:16px;font-weight:700;margin-bottom:12px;color:#111;">Top Priority Fixes</h2>
  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:32px;">
    ${audit.ai_priority_fixes.map((fix: string, i: number) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#f8f9fa;border-radius:6px;">
      <span style="width:22px;height:22px;background:#f5222d;border-radius:50%;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i+1}</span>
      <span style="font-size:13px;color:#111;">${escHtml(fix)}</span>
    </div>`).join('')}
  </div>` : ''}

</div>

<!-- ======== PAGE 3+: CRITICAL ISSUES ======== -->
${criticals.length > 0 ? `
<div class="page" style="padding:48px;min-height:297mm;">
  <div style="display:flex;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
    <h2 style="font-size:16px;font-weight:700;color:#111;flex:1;">🔴 Critical Issues (${criticals.length})</h2>
    <span style="font-size:11px;color:#888;">${escHtml(domain)}</span>
  </div>
  ${issueRows(criticals)}
</div>` : ''}

<!-- ======== WARNINGS ======== -->
${warnings.length > 0 ? `
<div class="page" style="padding:48px;min-height:297mm;">
  <div style="display:flex;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
    <h2 style="font-size:16px;font-weight:700;color:#111;flex:1;">🟡 Warnings (${warnings.length})</h2>
    <span style="font-size:11px;color:#888;">${escHtml(domain)}</span>
  </div>
  ${issueRows(warnings)}
</div>` : ''}

<!-- ======== PASSED CHECKS ======== -->
${passed.length > 0 ? `
<div style="padding:48px;">
  <div style="display:flex;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
    <h2 style="font-size:16px;font-weight:700;color:#111;flex:1;">✅ Passed Checks (${passed.length})</h2>
    <span style="font-size:11px;color:#888;">${escHtml(domain)}</span>
  </div>
  ${issueRows(passed)}

  <div style="margin-top:48px;text-align:center;padding:24px;background:#f8f9fa;border-radius:12px;">
    <p style="font-size:13px;color:#555;">Report generated by <strong>RaSEOTech</strong> — Free AI SEO Audit Tool</p>
    <p style="font-size:12px;color:#888;margin-top:4px;">raseotech.com · ${scanDate}</p>
  </div>
</div>` : ''}

</body>
</html>`
}

function escHtml(str: string | null | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
