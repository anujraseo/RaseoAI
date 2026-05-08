'use client'

import { useState } from 'react'
import { AuditResultResponse, AuditIssue, IssueSeverity, IssueCategory } from '@/types'

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
  critical: 0, warning: 1, info: 2, pass: 3,
}

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  meta: 'Meta & Tags', content: 'Content', performance: 'Performance',
  technical: 'Technical', mobile: 'Mobile', security: 'Security',
  links: 'Links', structured_data: 'Structured Data', social: 'Social',
}

const SEV_COLORS: Record<IssueSeverity, { dot: string; badge: string; text: string }> = {
  critical: { dot: '#ef4444', badge: 'rgba(239,68,68,0.1)', text: '#f87171' },
  warning:  { dot: '#f59e0b', badge: 'rgba(245,158,11,0.1)', text: '#fbbf24' },
  info:     { dot: '#3b82f6', badge: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
  pass:     { dot: '#22c55e', badge: 'rgba(34,197,94,0.1)',  text: '#4ade80' },
}

type FilterKey = 'all' | IssueSeverity | IssueCategory

interface Props { result: AuditResultResponse; onReset: () => void }

function parseSummary(summary: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = []
  const titles = ['Overall Assessment', "What's Hurting Your Rankings", 'Quick Wins (Fix These First)', 'Growth Potential']
  for (const title of titles) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp('\\*\\*' + escaped + '\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)', 'i')
    const match = summary.match(pattern)
    if (match && match[1]?.trim()) sections.push({ title, content: match[1].trim() })
  }
  return sections
}

function scoreColor(s: number | null | undefined): string {
  if (!s) return '#888'
  if (s >= 80) return '#4ade80'
  if (s >= 60) return '#fbbf24'
  return '#f87171'
}

function gradeLabel(grade: string | null): string {
  if (grade === 'A+' || grade === 'A') return 'Excellent'
  if (grade === 'B') return 'Good'
  if (grade === 'C') return 'Needs work'
  if (grade === 'D') return 'Poor'
  return 'Critical'
}

function ScoreCircle({ score }: { score: number }) {
  const deg = Math.round((score / 100) * 360)
  const color = scoreColor(score)
  return (
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'conic-gradient(' + color + ' 0deg, ' + color + ' ' + deg + 'deg, rgba(255,255,255,0.07) ' + deg + 'deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>/100</span>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-syne)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
      {children}
    </div>
  )
}

function IssueCard({ issue, isExpanded, onToggle }: { issue: AuditIssue; isExpanded: boolean; onToggle: () => void }) {
  const colors = SEV_COLORS[issue.severity]
  return (
    <div onClick={onToggle} style={{ background: 'rgba(255,255,255,0.03)', border: isExpanded ? '0.5px solid rgba(56,189,248,0.2)' : '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot, flexShrink: 0, marginTop: 6, boxShadow: issue.severity === 'critical' ? '0 0 6px ' + colors.dot + '80' : 'none' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf0' }}>{issue.name}</span>
          <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, fontWeight: 500, background: colors.badge, color: colors.text }}>{issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}</span>
          <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>{CATEGORY_LABELS[issue.category]}</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.55 }}>{issue.description}</p>
        {isExpanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
            {issue.detail && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 12 }}>{issue.detail}</p>}
            {issue.fix_text && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>How to fix</div>
                <div style={{ background: 'rgba(56,189,248,0.05)', border: '0.5px solid rgba(56,189,248,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{issue.fix_text}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: 2, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
    </div>
  )
}

function AiSummaryCard({ summary, score }: { summary: string; score: number }) {
  const [expanded, setExpanded] = useState(true)
  const sections = parseSummary(summary)
  const icons: Record<string, string> = { 'Overall Assessment': '📊', "What's Hurting Your Rankings": '⚠️', 'Quick Wins (Fix These First)': '⚡', 'Growth Potential': '🚀' }
  const colors: Record<string, string> = { 'Overall Assessment': 'rgba(56,189,248,0.08)', "What's Hurting Your Rankings": 'rgba(239,68,68,0.08)', 'Quick Wins (Fix These First)': 'rgba(245,158,11,0.08)', 'Growth Potential': 'rgba(34,197,94,0.08)' }
  const borders: Record<string, string> = { 'Overall Assessment': '#38bdf8', "What's Hurting Your Rankings": '#f87171', 'Quick Wins (Fix These First)': '#fbbf24', 'Growth Potential': '#4ade80' }
  const sc = scoreColor(score)
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.05), rgba(129,140,248,0.05))', border: '0.5px solid rgba(56,189,248,0.2)', borderRadius: 16, marginBottom: 28, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer', borderBottom: expanded ? '0.5px solid rgba(255,255,255,0.07)' : 'none' }}>
        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>AI SEO Analysis</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Powered by Claude · Detailed expert audit report</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: score >= 80 ? 'rgba(34,197,94,0.15)' : score >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', border: '0.5px solid ' + sc, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: sc }}>{score}/100</div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '20px 22px' }}>
          {sections.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {sections.map((section, i) => (
                <div key={i} style={{ background: colors[section.title] ?? 'rgba(255,255,255,0.03)', border: '0.5px solid ' + (borders[section.title] ?? '#38bdf8') + '40', borderLeft: '2px solid ' + (borders[section.title] ?? '#38bdf8'), borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>{icons[section.title] ?? '📌'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: borders[section.title] ?? '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{section.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: 0 }}>{section.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {summary.split('\n\n').filter(p => p.trim()).map((para, i) => {
                const isBold = para.startsWith('**')
                const cleaned = para.replace(/\*\*/g, '')
                return <p key={i} style={{ fontSize: isBold ? 14 : 13, fontWeight: isBold ? 600 : 400, color: isBold ? '#fff' : 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, paddingLeft: isBold ? 0 : 12, borderLeft: isBold ? 'none' : '2px solid rgba(56,189,248,0.3)' }}>{cleaned}</p>
              })}
            </div>
          )}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Analysis generated by Claude AI · Based on live crawl data</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReportSection({ result, onReset }: Props) {
  const { audit, issues, domain } = result
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredIssues = (issues as AuditIssue[])
    .filter(issue => {
      if (activeFilter === 'all') return true
      if (['critical','warning','info','pass'].includes(activeFilter)) return issue.severity === activeFilter
      return issue.category === activeFilter
    })
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const categoryScores = [
    { label: 'On-page SEO', value: audit.score_meta },
    { label: 'Content', value: audit.score_content },
    { label: 'Performance', value: audit.score_performance },
    { label: 'Technical', value: audit.score_technical },
    { label: 'Mobile', value: audit.score_mobile },
    { label: 'Security', value: audit.score_security },
  ]

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Issues' },
    { key: 'critical', label: 'Critical (' + audit.critical_count + ')' },
    { key: 'warning', label: 'Warnings (' + audit.warning_count + ')' },
    { key: 'pass', label: 'Passed (' + audit.passed_count + ')' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌐</div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff' }}>{domain?.domain ?? new URL(audit.url).hostname}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Scanned {new Date(audit.completed_at ?? audit.created_at).toLocaleString()} · {audit.total_checks} checks</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreCircle score={audit.overall_score ?? 0} />
          <div>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 32, color: scoreColor(audit.overall_score) }}>{audit.grade}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{gradeLabel(audit.grade)}</div>
          </div>
        </div>
      </div>

      {audit.ai_summary && <AiSummaryCard summary={audit.ai_summary} score={audit.overall_score ?? 0} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { icon: '🔴', count: audit.critical_count, label: 'Critical Issues', color: '#f87171' },
          { icon: '🟡', count: audit.warning_count, label: 'Warnings', color: '#fbbf24' },
          { icon: '🟢', count: audit.passed_count, label: 'Passed', color: '#4ade80' },
          { icon: '🔵', count: audit.total_checks, label: 'Total Checks', color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 26, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <SectionTitle>Category Scores</SectionTitle>
        {categoryScores.map(cat => (
          <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', width: 110, flexShrink: 0 }}>{cat.label}</span>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: (cat.value ?? 0) + '%', background: scoreColor(cat.value), borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: scoreColor(cat.value), width: 28, textAlign: 'right', flexShrink: 0 }}>{cat.value ?? 0}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: activeFilter === f.key ? '0.5px solid rgba(56,189,248,0.4)' : '0.5px solid rgba(255,255,255,0.1)', background: activeFilter === f.key ? 'rgba(56,189,248,0.1)' : 'none', color: activeFilter === f.key ? '#38bdf8' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>{f.label}</button>
          ))}
        </div>
        <a href={'/api/pdf-export?id=' + audit.id} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-dm)', fontSize: 13, padding: '7px 14px', cursor: 'pointer', textDecoration: 'none' }}>↓ Export PDF</a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredIssues.map(issue => (
          <IssueCard key={issue.id} issue={issue} isExpanded={expandedId === issue.id} onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)} />
        ))}
        {filteredIssues.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '32px 0', fontSize: 14 }}>No issues in this category</p>}
      </div>

      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <button onClick={onReset} style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-dm)', fontSize: 14, fontWeight: 500, padding: '12px 32px', cursor: 'pointer' }}>Audit Another Site</button>
      </div>
    </div>
  )
}
