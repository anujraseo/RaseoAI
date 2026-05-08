'use client'

import { useEffect, useState } from 'react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import AuditsTable from '@/components/dashboard/AuditsTable'
import TopIssuesPanel from '@/components/dashboard/TopIssuesPanel'
import ScoreChart from '@/components/dashboard/ScoreChart'

interface DashboardData {
  stats: any
  recentAudits: any[]
  topIssues: any[]
  scoreDistribution: any[]
  dailyAudits: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard?secret=admin123')
      .then(r => {
        if (r.status === 401) throw new Error('Unauthorized')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const refresh = () => {
    setLoading(true)
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }

  if (error === 'Unauthorized') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, marginBottom: 8 }}>Admin Access Required</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Set DASHBOARD_SECRET in your environment variables.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>

      {/* Top nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        background: 'rgba(10,14,26,0.95)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 30, height: 30, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>Ra</div>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, color: '#fff', fontSize: 16 }}>
            Ra<span style={{ color: '#38bdf8' }}>SEO</span>Tech
          </span>
          <span style={{
            marginLeft: 6, fontSize: 11, padding: '2px 8px',
            background: 'rgba(56,189,248,0.1)', color: '#38bdf8',
            border: '0.5px solid rgba(56,189,248,0.25)', borderRadius: 10,
          }}>
            Admin
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            {data ? `Last updated ${new Date().toLocaleTimeString()}` : ''}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 7, color: 'rgba(255,255,255,0.6)',
              padding: '6px 14px', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-dm)',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '↻ Loading…' : '↻ Refresh'}
          </button>
          <a href="/" style={{
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
            textDecoration: 'none', padding: '6px 12px',
          }}>
            ← Back to Tool
          </a>
        </div>
      </nav>

      <div style={{ padding: '32px 32px 80px', maxWidth: 1280, margin: '0 auto' }}>

        {loading && !data ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 36, height: 36, border: '2px solid rgba(255,255,255,0.07)',
              borderTopColor: '#38bdf8', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading dashboard…</p>
          </div>
        ) : data ? (
          <>
            {/* Page title */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: 'var(--font-syne)', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4,
              }}>
                Dashboard
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                All-time audit analytics for raseotech.com
              </p>
            </div>

            {/* Global stats */}
            <DashboardStats stats={data.stats} />

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '24px 0' }}>
              <ScoreChart dailyAudits={data.dailyAudits} scoreDistribution={data.scoreDistribution} />
              <TopIssuesPanel issues={data.topIssues} />
            </div>

            {/* Recent audits table */}
            <AuditsTable audits={data.recentAudits} />
          </>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 80 }}>{error}</p>
        )}

      </div>
    </div>
  )
}
