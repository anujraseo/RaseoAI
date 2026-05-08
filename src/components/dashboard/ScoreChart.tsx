'use client'

interface DailyAudit { date: string; total: number; avg_score: number }
interface ScoreDist { grade_range: string; count: number; pct: number }

interface Props {
  dailyAudits: DailyAudit[]
  scoreDistribution: ScoreDist[]
}

export default function ScoreChart({ dailyAudits, scoreDistribution }: Props) {
  const last14 = dailyAudits.slice(-14)
  const maxCount = Math.max(...last14.map(d => Number(d.total)), 1)

  const distColors: Record<string, string> = {
    'A+ (90–100)': '#4ade80',
    'A (80–89)':   '#86efac',
    'B (70–79)':   '#fbbf24',
    'C (60–69)':   '#fb923c',
    'D (50–59)':   '#f87171',
    'F (0–49)':    '#ef4444',
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '20px 20px 16px',
    }}>
      {/* Daily audits */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 600,
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
          letterSpacing: '0.07em', marginBottom: 16,
        }}>
          Daily Audits (14 days)
        </h3>

        {last14.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '24px 0' }}>
            No data yet
          </p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
            {last14.map((d, i) => {
              const h = Math.max(4, Math.round((Number(d.total) / maxCount) * 72))
              const date = new Date(d.date)
              const label = date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
              const scoreCol = d.avg_score >= 80 ? '#4ade80' : d.avg_score >= 60 ? '#fbbf24' : '#f87171'

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    title={`${label}: ${d.total} audits, avg ${d.avg_score}`}
                    style={{
                      width: '100%',
                      height: h,
                      background: scoreCol,
                      borderRadius: '3px 3px 0 0',
                      opacity: 0.75,
                      transition: 'opacity 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
                  />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Score distribution */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 600,
          color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
          letterSpacing: '0.07em', marginBottom: 12,
        }}>
          Score Distribution
        </h3>

        {scoreDistribution.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '12px 0' }}>No data yet</p>
        ) : (
          scoreDistribution.map(dist => {
            const color = distColors[dist.grade_range] ?? '#888'
            return (
              <div key={dist.grade_range} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 90, flexShrink: 0 }}>
                  {dist.grade_range}
                </span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dist.pct}%`, background: color, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, color, width: 36, textAlign: 'right', flexShrink: 0 }}>
                  {dist.count}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
