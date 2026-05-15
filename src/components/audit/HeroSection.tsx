'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './HeroSection.module.css'

interface Props {
  onSubmit: (url: string, recaptchaToken: string) => void
}

const ROTATING_WORDS = ['Rankings', 'Traffic', 'Revenue', 'Authority', 'Visibility']

const FLOATING_TAGS = [
  { text: 'Missing Meta Tags', color: '#f87171', x: 8, y: 18, delay: 0 },
  { text: 'Slow Page Speed', color: '#fbbf24', x: 82, y: 12, delay: 0.4 },
  { text: 'Broken Links Found', color: '#f87171', x: 75, y: 72, delay: 0.8 },
  { text: 'No Sitemap.xml', color: '#fbbf24', x: 5, y: 68, delay: 1.2 },
  { text: 'H1 Tag Missing', color: '#f87171', x: 88, y: 42, delay: 0.6 },
  { text: 'Schema Detected ✓', color: '#4ade80', x: 2, y: 42, delay: 1.0 },
  { text: 'HTTPS Active ✓', color: '#4ade80', x: 60, y: 88, delay: 1.4 },
  { text: 'Mobile Ready ✓', color: '#4ade80', x: 30, y: 92, delay: 0.2 },
]

export default function HeroSection({ onSubmit }: Props) {
  const [url, setUrl] = useState('')
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recaptchaLoaded = useRef(false)

  // Load reCAPTCHA
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey || siteKey === 'placeholder' || recaptchaLoaded.current) return
    const existing = document.querySelector('script[src*="recaptcha"]')
    if (existing) { recaptchaLoaded.current = true; return }
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.onload = () => { recaptchaLoaded.current = true }
    document.head.appendChild(script)
  }, [])

  // Rotating words
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setWordIndex(i => (i + 1) % ROTATING_WORDS.length)
        setIsTransitioning(false)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Neural network canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      })
    }
    let animId: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(56,189,248,${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      nodes.forEach(node => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(56,189,248,0.4)'
        ctx.fill()
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  async function getRecaptchaToken(): Promise<string> {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey || siteKey === 'placeholder') return 'placeholder'
    const w = window as any
    if (!w.grecaptcha) return 'placeholder'
    try {
      return await new Promise<string>((resolve) => {
        w.grecaptcha.ready(() => {
          w.grecaptcha.execute(siteKey, { action: 'audit' }).then(resolve)
        })
      })
    } catch {
      return 'placeholder'
    }
  }

  async function handleSubmit() {
    setUrlError('')
    setCaptchaError(false)

    let normalized = url.trim()
    if (!normalized) { setUrlError('Please enter a website URL'); return }
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }
    try { new URL(normalized) } catch { setUrlError('Please enter a valid URL'); return }
    if (!captchaChecked) { setCaptchaError(true); return }

    setIsSubmitting(true)
    try {
      const token = await getRecaptchaToken()
      onSubmit(normalized, token)
    } catch {
      onSubmit(normalized, 'placeholder')
    }
    setIsSubmitting(false)
  }

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.tagsContainer}>
        {FLOATING_TAGS.map((tag, i) => (
          <div key={i} className={styles.floatingTag} style={{
            left: tag.x + '%', top: tag.y + '%',
            borderColor: tag.color + '40', color: tag.color,
            animationDelay: tag.delay + 's',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: tag.color, display: 'inline-block', marginRight: 6, flexShrink: 0 }} />
            {tag.text}
          </div>
        ))}
      </div>

      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span className={styles.logoText}>Raseo<span className={styles.logoAI}>AI</span></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/features">Features</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <Link href="/features" className={styles.navBadge}>Free Tool</Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.aiBadge}>
          <span className={styles.aiBadgeDot} />
          <span>Powered by Claude AI</span>
          <span className={styles.aiBadgeSep}>·</span>
          <span>120+ SEO Checks</span>
          <span className={styles.aiBadgeSep}>·</span>
          <span>Free Forever</span>
        </div>

        <h1 className={styles.heading}>
          <span className={styles.headingLine1}>Uncover What's Killing</span>
          <span className={styles.headingLine2}>
            Your{' '}
            <span className={styles.rotatingWord} style={{ opacity: isTransitioning ? 0 : 1 }}>
              {ROTATING_WORDS[wordIndex]}
            </span>
          </span>
        </h1>

        <p className={styles.subheading}>
          Enter any URL and get a full AI-powered SEO audit in 30 seconds.<br />
          Discover exactly why your site isn't ranking — and how to fix it.
        </p>

        <div className={styles.inputCard}>
          <div className={styles.inputCardHeader}>
            <div className={styles.inputCardDots}>
              <span style={{ background: '#f87171' }} />
              <span style={{ background: '#fbbf24' }} />
              <span style={{ background: '#4ade80' }} />
            </div>
            <span className={styles.inputCardLabel}>AI SEO Analyzer</span>
          </div>

          <div className={styles.inputRow} style={{ borderColor: urlError ? 'rgba(248,113,113,0.4)' : undefined }}>
            <span className={styles.inputIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.5 1C3.46 1 1 3.46 1 6.5S3.46 12 6.5 12c1.33 0 2.55-.46 3.51-1.22l3.6 3.59 1.06-1.06-3.59-3.6A5.47 5.47 0 0012 6.5C12 3.46 9.54 1 6.5 1zm0 1.5a4 4 0 110 8 4 4 0 010-8z" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </span>
            <input
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); setUrlError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="https://yourwebsite.com"
              className={styles.urlInput}
              autoComplete="url"
              spellCheck={false}
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={styles.analyzeBtn}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              <span>{isSubmitting ? 'Analyzing...' : 'Analyze Now'}</span>
              {!isSubmitting && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>

          {urlError && <p className={styles.errorText}>{urlError}</p>}

          <div className={styles.captchaRow}>
            <div
              className={`${styles.captchaBox} ${captchaChecked ? styles.captchaChecked : ''} ${captchaError ? styles.captchaError : ''}`}
              onClick={() => { setCaptchaChecked(!captchaChecked); setCaptchaError(false) }}
              role="checkbox"
              tabIndex={0}
              onKeyDown={e => e.key === ' ' && setCaptchaChecked(!captchaChecked)}
            >
              {captchaChecked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={styles.captchaLabel}>I'm not a robot</span>
            <span className={styles.captchaNote}>reCAPTCHA · Privacy · Terms</span>
          </div>
          {captchaError && <p className={styles.errorText}>Please confirm you're not a robot</p>}

          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', textAlign: 'center', padding: '0 16px 10px' }}>
            Protected by Google reCAPTCHA ·{'  '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Privacy</a>
            {'  ·  '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>Terms</a>
          </p>
        </div>

        <div className={styles.statsRow}>
          {[
            { num: '48K+', label: 'Sites Audited', icon: '📊' },
            { num: '120+', label: 'SEO Checks', icon: '✅' },
            { num: '< 30s', label: 'Audit Speed', icon: '⚡' },
            { num: 'Free', label: 'No Credit Card', icon: '🎁' },
          ].map(s => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statIcon}>{s.icon}</span>
              <div>
                <div className={styles.statNum}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.featureStrip}>
        <div className={styles.featureStripInner}>
          {['🔍 On-page SEO', '⚡ Core Web Vitals', '📱 Mobile Check', '🔒 HTTPS & Security', '🗺️ Sitemap & Robots', '🤖 AI Fix Suggestions', '📊 Score & Grade', '📄 PDF Export'].map(f => (
            <span key={f} className={styles.featureChip}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
