

import { useState } from 'react'

interface Props {
  score: number
  domain: string
  criticalCount: number
}

export default function SalesSection({ score, domain, criticalCount }: Props) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const urgencyText = score < 50
    ? 'Your site is critically underperforming — every day costs you customers.'
    : score < 70
    ? 'Your site has significant gaps that are costing you rankings and traffic.'
    : 'Your site is good but has room to dominate your niche with expert SEO.'

  return (
    <div style={{ marginTop: 60, borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 56 }}>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 20, letterSpacing: '0.04em' }}>
          🚨 {criticalCount} CRITICAL ISSUES DETECTED ON {domain.toUpperCase()}
        </div>

        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16, maxWidth: 640, margin: '0 auto 16px' }}>
          Want Us To Fix These SEO Issues &amp;<br />
          <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Rank Your Website in 60–90 Days?
          </span>
        </h2>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
          {urgencyText} Our SEO team has helped 200+ businesses rank on page 1 of Google.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 28, flexWrap: 'wrap' }}>
          {[{ num: '200+', label: 'Clients Ranked' }, { num: '60–90', label: 'Days to Results' }, { num: '4.9★', label: 'Client Rating' }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 800, color: '#fff' }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>

        <div onMouseEnter={() => setHoveredCard(0)} onMouseLeave={() => setHoveredCard(null)} style={{ background: hoveredCard === 0 ? 'linear-gradient(145deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))' : 'rgba(255,255,255,0.03)', border: hoveredCard === 0 ? '0.5px solid rgba(239,68,68,0.4)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', transition: 'all 0.25s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.1)', borderRadius: '0 16px 0 16px', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#f87171', letterSpacing: '0.06em' }}>FREE</div>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🔴</div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Book Free Strategy Call</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 24 }}>Talk with our SEO experts and get a personalized growth roadmap for your website. No obligation, no sales pressure.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['✓ 30-min expert consultation', '✓ Custom SEO roadmap', '✓ Competitor analysis'].map(f => (
              <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{f}</div>
            ))}
          </div>
          <a href="https://calendly.com/raseotech/strategy-call" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, padding: '13px', textDecoration: 'none' }}>
            Schedule Call →
          </a>
        </div>

        <div onMouseEnter={() => setHoveredCard(1)} onMouseLeave={() => setHoveredCard(null)} style={{ background: 'linear-gradient(145deg, rgba(56,189,248,0.12), rgba(129,140,248,0.08))', border: '0.5px solid rgba(56,189,248,0.35)', borderRadius: 16, padding: '28px 24px', transition: 'all 0.25s', cursor: 'pointer', position: 'relative', overflow: 'hidden', transform: hoveredCard === 1 ? 'translateY(-4px)' : 'none', boxShadow: hoveredCard === 1 ? '0 20px 40px rgba(56,189,248,0.15)' : 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '0 0 10px 10px', padding: '5px 16px', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>⭐ MOST POPULAR</div>
          <div style={{ fontSize: 36, marginBottom: 14, marginTop: 16 }}>🚀</div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>SEO Growth Package</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 24 }}>Full done-for-you SEO service. We fix every issue, build authority, and get you ranking on page 1 within 60–90 days.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['✓ Fix all ' + criticalCount + ' critical issues', '✓ Monthly content & backlinks', '✓ Weekly ranking reports', '✓ Dedicated SEO manager'].map(f => (
              <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{f}</div>
            ))}
          </div>
          <a href="https://raseotech.com/pricing" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, padding: '13px', textDecoration: 'none' }}>
            View Packages →
          </a>
        </div>

        <div onMouseEnter={() => setHoveredCard(2)} onMouseLeave={() => setHoveredCard(null)} style={{ background: hoveredCard === 2 ? 'linear-gradient(145deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))' : 'rgba(255,255,255,0.03)', border: hoveredCard === 2 ? '0.5px solid rgba(34,197,94,0.35)' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', transition: 'all 0.25s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(34,197,94,0.1)', borderRadius: '0 16px 0 16px', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.06em' }}>INSTANT</div>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Download Full PDF Report</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 24 }}>Get the complete branded PDF report with all issues, fix instructions, and priority action plan to share with your team.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['✓ Full issue breakdown', '✓ Step-by-step fix guide', '✓ Share with your dev team'].map(f => (
              <div key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{f}</div>
            ))}
          </div>
          <a href="#pdf-export" onClick={(e) => { e.preventDefault(); document.querySelector('[href*="pdf-export"]')?.dispatchEvent(new MouseEvent('click')) }} style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, padding: '13px', textDecoration: 'none', cursor: 'pointer' }}>
            ↓ Download PDF →
          </a>
        </div>

      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {[{ icon: '🔒', text: '100% Confidential' }, { icon: '✅', text: 'No Long-term Contracts' }, { icon: '📈', text: 'Results in 60–90 Days' }, { icon: '💬', text: 'Free Consultation' }].map(t => (
          <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t.text}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
