'use client'

interface Issue {
  check_key: string
  name: string
  category: string
  severity: string
  occurrence_count: number
  avg_impact: number
}

interface Props { issues: Issue[] }

const SEV_COLORS: Record<string, { text: string; bg: string }> = {
  critical: { text: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  warning:  { text: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  info:     { text: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
}

export default function TopIssuesPanel({ issues }: Props) {
  const maxCount = Math.max(...issues.map(i => Number(i.occurrence_count)), 1)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '20px 20px 16px',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 600,
        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 16,
      }}>
        Most Common Issues
      </h3>

      {issues.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>
          No data yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {issues.map((issue, i) => {
            const sev = SEV_COLORS[issue.severity] ?? SEV_COLORS.info
            const pct = Math.round((Number(issue.occurrence_count) / maxCount) * 100)

            return (
              <div key={issue.check_key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: 'rgba(255,255,255,0.25)', width: 16, flexShrink: 0,
                  }}>
                    #{i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, color: '#e8eaf0', lineHeight: 1.4 }}>
                    {issue.name}
                  </span>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 8,
                    background: sev.bg, color: sev.text, flexShrink: 0, fontWeight: 500,
                  }}>
                    {issue.severity}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                    flexShrink: 0, minWidth: 20, textAlign: 'right',
                  }}>
                    {issue.occurrence_count}
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginLeft: 24 }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: sev.text, borderRadius: 2, opacity: 0.6,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
