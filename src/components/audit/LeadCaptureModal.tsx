'use client'

import { useState } from 'react'

interface Props {
  auditId: string
  url: string
  score: number
  onUnlock: () => void
}

export default function LeadCaptureModal({ auditId, url, score, onUnlock }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', company: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'
  const domain = url.replace(/https?:\/\//, '').split('/')[0]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Required'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          company: form.company,
          auditId,
          url,
          score,
        }),
      })
      setStep('success')
      setTimeout(() => onUnlock(), 1800)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0d1117, #0f172a)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        width: '100%', maxWidth: 480,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
      }}>

        {step === 'success' ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Report Unlocked!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              Loading your full AI SEO audit report…
            </p>
            <div style={{
              width: 40, height: 40,
              border: '2px solid rgba(255,255,255,0.1)',
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '24px auto 0',
            }} />
          </div>
        ) : (
          <>
            {/* Header gradient bar */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
              padding: '28px 32px 24px',
              borderBottom: '0.5px solid rgba(255,255,255,0.07)',
            }}>
              {/* Score pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '5px 12px',
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {domain}
                </span>
                <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>
                  Score: {score}/100
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-syne)',
                fontSize: 22, fontWeight: 800,
                color: '#fff', lineHeight: 1.2, marginBottom: 8,
              }}>
                🔒 Unlock Your Full AI<br />SEO Audit Report
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Get the complete PDF report + personalized ranking recommendations — free.
              </p>

              {/* Value props */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {['📊 Full PDF Report', '🤖 AI Analysis', '⚡ Fix Checklist'].map(v => (
                  <span key={v} style={{
                    fontSize: 11, padding: '4px 10px',
                    background: 'rgba(56,189,248,0.1)',
                    border: '0.5px solid rgba(56,189,248,0.2)',
                    borderRadius: 20, color: '#38bdf8',
                  }}>{v}</span>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: '24px 32px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Full Name */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>
                    Full Name <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    value={form.fullName}
                    onChange={e => { setForm(f => ({...f, fullName: e.target.value})); setErrors(er => ({...er, fullName: ''})) }}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid ' + (errors.fullName ? '#f87171' : 'rgba(255,255,255,0.1)'),
                      borderRadius: 10, padding: '11px 14px',
                      color: '#fff', fontSize: 14,
                      fontFamily: 'var(--font-dm)', outline: 'none',
                    }}
                  />
                  {errors.fullName && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>
                    Email Address <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={e => { setForm(f => ({...f, email: e.target.value})); setErrors(er => ({...er, email: ''})) }}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid ' + (errors.email ? '#f87171' : 'rgba(255,255,255,0.1)'),
                      borderRadius: 10, padding: '11px 14px',
                      color: '#fff', fontSize: 14,
                      fontFamily: 'var(--font-dm)', outline: 'none',
                    }}
                  />
                  {errors.email && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>
                    Phone Number <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => { setForm(f => ({...f, phone: e.target.value})); setErrors(er => ({...er, phone: ''})) }}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid ' + (errors.phone ? '#f87171' : 'rgba(255,255,255,0.1)'),
                      borderRadius: 10, padding: '11px 14px',
                      color: '#fff', fontSize: 14,
                      fontFamily: 'var(--font-dm)', outline: 'none',
                    }}
                  />
                  {errors.phone && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.phone}</p>}
                </div>

                {/* Company */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 5 }}>
                    Company Name <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your Company Ltd."
                    value={form.company}
                    onChange={e => setForm(f => ({...f, company: e.target.value}))}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '11px 14px',
                      color: '#fff', fontSize: 14,
                      fontFamily: 'var(--font-dm)', outline: 'none',
                    }}
                  />
                </div>

              </div>

              {/* CTA Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', marginTop: 20,
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontFamily: 'var(--font-syne)',
                  fontSize: 15, fontWeight: 700,
                  padding: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  letterSpacing: '0.01em',
                }}
              >
                {loading ? 'Unlocking…' : '🔓 Unlock Full Report →'}
              </button>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12 }}>
                🔒 No spam. Your data is secure. We hate spam too.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
