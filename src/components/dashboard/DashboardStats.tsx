'use client'

interface Props { stats: any }

export default function DashboardStats({ stats }: Props) {
  const cards = [
    {
      label: 'Total Audits',
      value: Number(stats.total_audits ?? 0).toLocaleString(),
      sub: `${stats.audits_today ?? 0} today`,
      icon: '📊',
      color: '#60a5fa',
    },
    {
      label: 'Unique Domains',
      value: Number(stats.unique_domains ?? 0).toLocaleString(),
      sub: `${stats.audits_this_week ?? 0} this week`,
      icon: '🌐',
      color: '#38bdf8',
    },
    {
      label: 'Avg SEO Score',
      value: `${stats.avg_score ?? 0}/100`,
      sub: 'across all completed audits',
      icon: '⭐',
      color: scoreColor(Number(stats.avg_score)),
    },
    {
      label: 'Checks Run',
      value: Number(stats.total_checks_run ?? 0).toLocaleString(),
      sub: `${Number(stats.total_critical_issues ?? 0).toLocaleString()} critical found`,
      icon: '✅',
      color: '#4ade80',
    },
    {
      label: 'Completed',
      value: Number(stats.completed_audits ?? 0).toLocaleString(),
      sub: `${stats.failed_audits ?? 0} failed`,
      icon: '🏁',
      color: '#a78bfa',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 12,
    }}>
      {cards.map(card => (
        <div key={card.label} style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '18px 16px',
        }}>
          <div style={{ fontSize: 20, marginBottom: 10 }}>{card.icon}</div>
          <div style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 24,
            fontWeight: 700,
            color: card.color,
            marginBottom: 4,
          }}>
            {card.value}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#e8eaf0', marginBottom: 2 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{card.sub}</div>
        </div>
      ))}
    </div>
  )
}

function scoreColor(s: number): string {
  if (s >= 80) return '#4ade80'
  if (s >= 60) return '#fbbf24'
  return '#f87171'
}
