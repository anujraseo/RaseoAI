'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'

declare global {
  interface Window { grecaptcha: any }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaReady, setCaptchaReady] = useState(false)

  // Inject WhatsApp animation keyframe safely on client only
useEffect(() => {
  const id = 'wa-ring-style'
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
    @keyframes waRing {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `
  document.head.appendChild(style)
  return () => { document.getElementById(id)?.remove() }
}, [])


  async function getToken(): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey || siteKey === 'placeholder') return 'dev_token'
    return new Promise(resolve => window.grecaptcha.ready(() => window.grecaptcha.execute(siteKey, { action: 'contact' }).then(resolve)))
  }

  async function handleSubmit() {
    setError('')
    if (!form.name.trim()) { setError('Please enter your name'); return }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return }
    if (!form.message.trim()) { setError('Please enter your message'); return }
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken: token }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send. Please try again.'); setLoading(false); return }
      setSent(true)
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 14px',
    color: '#fff', fontSize: 13,
    fontFamily: 'var(--font-dm)', outline: 'none',
  }

  const CONTACT = [
    { icon: '📧', label: 'Email Us', value: 'contact@raseotech.com', sub: 'We reply within 24 hours', href: 'mailto:contact@raseotech.com' },
    { icon: '💬', label: 'WhatsApp', value: '+91 89206 26996', sub: 'Mon–Fri, 9am–6pm IST', href: 'https://wa.me/918920626996' },
    { icon: '📍', label: 'Our Offices', value: 'India · Singapore · USA', sub: 'Serving clients worldwide', href: null },
    { icon: '⚡', label: 'Response Time', value: '< 24 Hours', sub: 'For all inquiries', href: null },
  ]

  const SERVICES = [
    { icon: '🚀', title: 'SEO Growth Package', desc: 'Full done-for-you SEO — fix issues, build links, create content, rank on page 1.' },
    { icon: '🔍', title: 'SEO Audit & Strategy', desc: 'Deep manual audit + 90-day roadmap. Delivered in 5 business days.' },
    { icon: '📝', title: 'Content Marketing', desc: 'SEO-optimized blog posts and landing pages to drive organic traffic.' },
    { icon: '🛠️', title: 'Technical SEO Fix', desc: 'Our developers fix all technical SEO issues — one-time or ongoing.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#e8eaf0' }}>
      <Navbar active="/contact" />

      {/* Sticky WhatsApp Button */}
      <a
        href="https://wa.me/918920626996"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(37,211,102,0.5)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
       <span style={{
  position: 'absolute', inset: -5, borderRadius: '50%',
  border: '2px solid rgba(37,211,102,0.5)',
  animationName: 'waRing',
  animationDuration: '2s',
  animationTimingFunction: 'ease-out',
  animationIterationCount: 'infinite',
  pointerEvents: 'none',
}} />
      </a>

     

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 44px', maxWidth: 580, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '0.5px solid rgba(56,189,248,0.25)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#38bdf8', marginBottom: 22 }}>
          Free Consultation Available
        </div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 44, fontWeight: 800, color: '#fff', marginBottom: 14, lineHeight: 1.1 }}>
          Let's Grow Your<br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Organic Traffic
          </span>
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          Questions about SEO services? Want a free strategy call? Reach out — we'd love to help.
        </p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 120px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 28 }}>

        {/* Left */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {CONTACT.map(c => (
              <div
                key={c.label}
                onClick={() => c.href && window.open(c.href, '_blank')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px 16px',
                  cursor: c.href ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (c.href) { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; e.currentTarget.style.background = 'rgba(56,189,248,0.04)' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <div style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{c.sub}</div>
                </div>
                {c.href && <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>→</div>}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Our Services</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                We'll reply to <strong style={{ color: '#38bdf8' }}>{form.email}</strong> within 24 hours.
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                Urgent? WhatsApp us at +91 89206 26996
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Send Us a Message</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 22 }}>We reply to every inquiry within 24 hours.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Full Name *</label>
                    <input type="text" placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Email *</label>
                    <input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Subject</label>
                    <input type="text" placeholder="SEO Audit, Strategy..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inp} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Message *</label>
                  <textarea placeholder="Tell us about your website and goals..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical' }} />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#f87171' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '100%', background: loading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Sending…' : 'Send Message →'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>🔒 Protected by Google reCAPTCHA</span>
                  <a href="https://wa.me/918920626996" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>
                    💬 WhatsApp instead →
                  </a>
                </div>

                <div style={{ textAlign: 'center', paddingTop: 4, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Or book a free call: </span>
                  <a href="https://calendly.com/raseotech" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                    Schedule on Calendly →
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
