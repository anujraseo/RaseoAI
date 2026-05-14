'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import AuditsTable from '@/components/dashboard/AuditsTable'
import TopIssuesPanel from '@/components/dashboard/TopIssuesPanel'
import ScoreChart from '@/components/dashboard/ScoreChart'
import LeadsTable from '@/components/dashboard/LeadsTable'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'audits'|'leads'>('audits')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const secret = params.get('secret') ?? 'admin123'
      const res = await fetch('/api/dashboard?secret=' + secret)
      if (res.status === 401) throw new Error('Unauthorized')
      const d = await res.json()
      setData(d)
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (error === 'Unauthorized') {
    return (
      <div style={{ minHeight:'100vh', background:'#050810', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontFamily:'var(--font-syne)', fontSize:20, color:'#fff', marginBottom:8 }}>Admin Access Required</h2>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Add ?secret=yourpassword to the URL</p>
        </div>
      </div>
    )
  }

  const tabStyle = (active: boolean) => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 13,
    fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-dm)',
    border: active ? '0.5px solid rgba(56,189,248,0.4)' : '0.5px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(56,189,248,0.1)' : 'none',
    color: active ? '#38bdf8' : 'rgba(255,255,255,0.4)',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ minHeight:'100vh', background:'#050810' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'0.5px solid rgba(255,255,255,0.07)', background:'rgba(5,8,16,0.95)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:13 }}>R</div>
          <span style={{ fontFamily:'var(--font-syne)', fontWeight:700, color:'#fff', fontSize:17 }}>
            Raseo<span style={{ color:'#38bdf8', fontStyle:'italic' }}>AI</span>
          </span>
          <span style={{ fontSize:11, padding:'2px 8px', background:'rgba(56,189,248,0.1)', color:'#38bdf8', border:'0.5px solid rgba(56,189,248,0.25)', borderRadius:10 }}>Admin</span>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button style={tabStyle(activeTab==='audits')} onClick={() => setActiveTab('audits')}>
            📊 Audits {data ? `(${data.recentAudits?.length ?? 0})` : ''}
          </button>
          <button style={tabStyle(activeTab==='leads')} onClick={() => setActiveTab('leads')}>
            👥 Leads {data ? `(${data.recentLeads?.length ?? 0})` : ''}
          </button>
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
            {data ? `Updated ${new Date().toLocaleTimeString()}` : ''}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:7, color: loading ? 'rgba(255,255,255,0.3)' : '#fff', padding:'7px 16px', fontSize:12, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'var(--font-dm)' }}
          >
            {loading ? '↻ Loading…' : '↻ Refresh'}
          </button>
          <a href="/" style={{ fontSize:12, color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>← Back to Tool</a>
        </div>
      </nav>

      <div style={{ padding:'28px 32px 80px', maxWidth:1280, margin:'0 auto' }}>
        {loading && !data ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:36, height:36, border:'2px solid rgba(255,255,255,0.07)', borderTopColor:'#38bdf8', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14 }}>Loading dashboard…</p>
          </div>
        ) : data ? (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontFamily:'var(--font-syne)', fontSize:24, fontWeight:800, color:'#fff', marginBottom:4 }}>Dashboard</h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>ai-seoaudit.com — All-time analytics</p>
            </div>

            <DashboardStats stats={data.stats} />

            {activeTab === 'audits' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, margin:'20px 0' }}>
                  <ScoreChart dailyAudits={data.dailyAudits} scoreDistribution={data.scoreDistribution} />
                  <TopIssuesPanel issues={data.topIssues} />
                </div>
                <AuditsTable audits={data.recentAudits} />
              </>
            )}

            {activeTab === 'leads' && (
              <LeadsTable leads={data.recentLeads ?? []} />
            )}
          </>
        ) : (
          <p style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', paddingTop:80 }}>{error}</p>
        )}
      </div>
    </div>
  )
}
