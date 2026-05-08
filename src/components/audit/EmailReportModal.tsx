'use client'

import { useState } from 'react'

interface Props {
  auditId: string
  domain: string
  onClose: () => void
}

export default function EmailReportModal({ auditId, domain, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSend() {
    if (!email.includes('@')) { setErrorMsg('Enter a valid email'); return }
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, email }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? 'Failed to send'); setStatus('error'); return }
      setStatus('sent')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111827',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '32px 28px',
          width: '100%', maxWidth: 400, margin: '0 16px',
        }}
      >
        {status === 'sent' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 18, color: '#fff', marginBottom: 8 }}>
              Report Sent!
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
              Your audit report for <strong style={{ color: '#38bdf8' }}>{domain}</strong> has been sent to <strong style={{ color: '#fff' }}>{email}</strong>
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                border: 'none', borderRadius: 10, color: '#fff',
                padding: '11px 24px', fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-dm)',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Email this Report
              </h3>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.55 }}>
              We'll send a full SEO audit summary for <strong style={{ color: '#38bdf8' }}>{domain}</strong> straight to your inbox.
            </p>

            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="you@company.com"
                autoFocus
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${errorMsg ? '#f87171' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 9, padding: '11px 14px',
                  color: '#fff', fontSize: 14, fontFamily: 'var(--font-dm)',
                  outline: 'none',
                }}
              />
              {errorMsg && (
                <p style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>{errorMsg}</p>
              )}
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>
              We won't spam you. This is a one-time delivery.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSend}
                disabled={status === 'sending'}
                style={{
                  flex: 1,
                  background: status === 'sending'
                    ? 'rgba(56,189,248,0.3)'
                    : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                  border: 'none', borderRadius: 10, color: '#fff',
                  padding: '12px', fontSize: 14, fontWeight: 500,
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-dm)',
                  transition: 'opacity 0.2s',
                }}
              >
                {status === 'sending' ? 'Sending…' : 'Send Report ✉'}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: 'rgba(255,255,255,0.5)',
                  padding: '12px 18px', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'var(--font-dm)',
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
