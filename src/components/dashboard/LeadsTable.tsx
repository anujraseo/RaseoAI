'use client'

import { useState } from 'react'

interface Lead {
  id: string
  full_name: string
  email: string
  phone?: string
  company?: string
  url?: string
  score?: number
  grade?: string
  created_at: string
}

interface Props { leads: Lead[] }

export default function LeadsTable({ leads }: Props) {
  const [search, setSearch] = useState('')

  const filtered = leads.filter(l =>
    l.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.url?.toLowerCase().includes(search.toLowerCase())
  )

  const scoreColor = (s?: number) => {
    if (!s) return 'rgba(255,255,255,0.3)'
    if (s >= 80) return '#4ade80'
    if (s >= 60) return '#fbbf24'
    return '#f87171'
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 14, marginTop: 20,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            Lead Captures
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {filtered.length} leads collected
          </p>
        </div>
        <input
          type="text"
          placeholder="Search leads…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '7px 14px',
            color: '#fff', fontSize: 13,
            fontFamily: 'var(--font-dm)', outline: 'none', width: 220,
          }}
        />
      </div>

      {/* Export CSV button */}
      <div style={{ padding: '10px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => exportCSV(leads)}
          style={{
            background: 'rgba(56,189,248,0.08)',
            border: '0.5px solid rgba(56,189,248,0.2)',
            borderRadius: 7, color: '#38bdf8',
            fontSize: 12, padding: '6px 14px',
            cursor: 'pointer', fontFamily: 'var(--font-dm)',
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Phone', 'Company', 'Website', 'Score', 'Date'].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  borderBottom: '0.5px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.02)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  textAlign: 'center', padding: '40px 0',
                  color: 'rgba(255,255,255,0.25)', fontSize: 13,
                }}>
                  No leads yet — they appear here after users unlock their report
                </td>
              </tr>
            ) : filtered.map(lead => (
              <tr
                key={lead.id}
                style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#e8eaf0' }}>
                  {lead.full_name}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <a href={`mailto:${lead.email}`} style={{ fontSize: 13, color: '#38bdf8', textDecoration: 'none' }}>
                    {lead.email}
                  </a>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {lead.phone ? (
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} style={{ color: '#25D366', textDecoration: 'none' }}>
                      {lead.phone}
                    </a>
                  ) : '—'}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {lead.company || '—'}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lead.url || '—'}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(lead.score) }}>
                    {lead.score ? `${lead.score} ${lead.grade ?? ''}` : '—'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                  {new Date(lead.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function exportCSV(leads: Lead[]) {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Website', 'Score', 'Date']
  const rows = leads.map(l => [
    l.full_name, l.email, l.phone ?? '', l.company ?? '',
    l.url ?? '', l.score ?? '', new Date(l.created_at).toLocaleDateString()
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}