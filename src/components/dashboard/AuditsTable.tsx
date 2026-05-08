'use client'

import { useState, useMemo } from 'react'

interface Audit {
  id: string
  domain: string
  url: string
  overall_score: number | null
  grade: string | null
  critical_count: number
  warning_count: number
  passed_count: number
  status: string
  page_load_ms: number | null
  created_at: string
  completed_at: string | null
}

interface Props { audits: Audit[] }

type SortKey = 'created_at' | 'overall_score' | 'critical_count' | 'domain'

export default function AuditsTable({ audits }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => {
    let rows = audits.filter(a =>
      a.domain.toLowerCase().includes(search.toLowerCase()) ||
      a.url.toLowerCase().includes(search.toLowerCase())
    )
    rows.sort((a, b) => {
      let va: any = a[sortKey]
      let vb: any = b[sortKey]
      if (sortKey === 'created_at') { va = new Date(va).getTime(); vb = new Date(vb).getTime() }
      if (va == null) return 1
      if (vb == null) return -1
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return rows
  }, [audits, search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const setDir = (d: 'asc' | 'desc') => setSortDir(d)

  const Th = ({ label, skey }: { label: string; skey?: SortKey }) => (
    <th
      onClick={() => skey && handleSort(skey)}
      style={{
        padding: '10px 14px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: skey ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        userSelect: 'none',
      }}
    >
      {label}
      {skey && sortKey === skey && (
        <span style={{ marginLeft: 4, opacity: 0.6 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
      )}
    </th>
  )

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
    }}>
      {/* Table header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            Recent Audits
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {filtered.length} audits found
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by domain or URL…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '8px 14px',
            color: '#fff', fontSize: 13,
            fontFamily: 'var(--font-dm)',
            outline: 'none', width: 240,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th label="Domain" skey="domain" />
              <Th label="Score" skey="overall_score" />
              <Th label="Grade" />
              <Th label="Critical" skey="critical_count" />
              <Th label="Warnings" />
              <Th label="Passed" />
              <Th label="Load Time" />
              <Th label="Status" />
              <Th label="Scanned" skey="created_at" />
              <Th label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={10} style={{
                  textAlign: 'center', padding: '40px 0',
                  color: 'rgba(255,255,255,0.25)', fontSize: 13,
                }}>
                  No audits found
                </td>
              </tr>
            ) : pageRows.map((audit, i) => (
              <tr
                key={audit.id}
                style={{
                  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e8eaf0' }}>
                    {audit.domain}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {audit.url}
                  </div>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 15,
                    color: scoreColor(audit.overall_score),
                  }}>
                    {audit.overall_score ?? '—'}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: scoreColor(audit.overall_score),
                  }}>
                    {audit.grade ?? '—'}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: '#f87171',
                  }}>
                    {audit.critical_count}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 13, color: '#fbbf24' }}>
                    {audit.warning_count}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 13, color: '#4ade80' }}>
                    {audit.passed_count}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 12, color: audit.page_load_ms && audit.page_load_ms > 3000 ? '#f87171' : 'rgba(255,255,255,0.45)' }}>
                    {audit.page_load_ms ? `${(audit.page_load_ms / 1000).toFixed(1)}s` : '—'}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <StatusBadge status={audit.status} />
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {formatDate(audit.created_at)}
                  </span>
                </td>

                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {audit.status === 'completed' && (
                      <>
                        <a
                          href={`/?result=${audit.id}`}
                          style={{ fontSize: 11, color: '#38bdf8', textDecoration: 'none' }}
                          title="View report"
                        >
                          View
                        </a>
                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                        <a
                          href={`/api/pdf-export?id=${audit.id}`}
                          style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                          title="Download PDF"
                        >
                          PDF
                        </a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderTop: '0.5px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: 28, height: 28, borderRadius: 6, border: 'none',
                  background: page === i ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                  color: page === i ? '#38bdf8' : 'rgba(255,255,255,0.35)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-dm)',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ ...navBtnStyle, opacity: page === 0 ? 0.3 : 1 }}
            >
              ←
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{ ...navBtnStyle, opacity: page === totalPages - 1 ? 0.3 : 1 }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', label: 'Completed' },
    pending:   { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', label: 'Pending' },
    crawling:  { bg: 'rgba(56,189,248,0.1)',  text: '#38bdf8', label: 'Crawling' },
    analyzing: { bg: 'rgba(129,140,248,0.1)', text: '#a78bfa', label: 'Analyzing' },
    failed:    { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', label: 'Failed' },
  }
  const s = styles[status] ?? styles.pending
  return (
    <span style={{
      fontSize: 10, padding: '3px 8px', borderRadius: 8,
      background: s.bg, color: s.text, fontWeight: 500,
    }}>
      {s.label}
    </span>
  )
}

function scoreColor(s: number | null | undefined): string {
  if (!s) return 'rgba(255,255,255,0.3)'
  if (s >= 80) return '#4ade80'
  if (s >= 60) return '#fbbf24'
  return '#f87171'
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const navBtnStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 6,
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer',
  fontFamily: 'var(--font-dm)',
}
