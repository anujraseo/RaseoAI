'use client'

import { useEffect, useState } from 'react'
import { AuditProgressResponse } from '@/types'

const STEPS = [
  { key: 'crawling',  label: 'Crawling page structure & content',  icon: '🔍' },
  { key: 'meta',      label: 'Checking meta tags & title',          icon: '🏷️' },
  { key: 'content',   label: 'Analyzing headings & images',         icon: '📝' },
  { key: 'perf',      label: 'Measuring page speed signals',        icon: '⚡' },
  { key: 'mobile',    label: 'Testing mobile-friendliness',         icon: '📱' },
  { key: 'security',  label: 'Checking HTTPS & security',           icon: '🔒' },
  { key: 'ai',        label: 'Running AI analysis & scoring',       icon: '🤖' },
]

interface Props { url: string; progress: AuditProgressResponse | null }

export default function LoadingSection({ url, progress }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const [dots, setDots] = useState('')

  const domain = url.replace(/https?:\/\//, '').split('/')[0]

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return
    const t = setTimeout(() => setActiveStep(s => s + 1), 1400)
    return () => clearTimeout(t)
  }, [activeStep])

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])

  const pct = Math.round((activeStep / (STEPS.length - 1)) * 100)

  return (
    <div style={{
      minHeight: '100vh', background: '#050810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 800,
            }}>R</div>
            <span style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
              Raseo<span style={{ color: '#38bdf8', fontStyle: 'italic' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Scanning animation */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '28px 28px 24px',
          marginBottom: 24,
          boxShadow: '0 0 40px rgba(56,189,248,0.05)',
        }}>
          {/* Spinner */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.06)',
                borderTopColor: '#38bdf8',
                animation: 'spin 0.9s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 8,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.04)',
                borderBottomColor: '#818cf8',
                animation: 'spin 1.4s linear infinite reverse',
              }} />
              <div style={{
                position: 'absolute', inset: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 20,
              }}>
                {STEPS[activeStep]?.icon}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-syne)', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Auditing {domain}{dots}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {STEPS[activeStep]?.label}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%',
              width: pct + '%',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
              borderRadius: 4,
              transition: 'width 1.2s ease',
              boxShadow: '0 0 10px rgba(56,189,248,0.5)',
            }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{pct}%</div>
        </div>

        {/* Steps list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STEPS.map((step, i) => {
            const isDone = i < activeStep
            const isActive = i === activeStep
            return (
              <div key={step.key} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: isActive ? 'rgba(56,189,248,0.06)' : 'transparent',
                border: isActive ? '0.5px solid rgba(56,189,248,0.15)' : '0.5px solid transparent',
                borderRadius: 10,
                transition: 'all 0.3s',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: isDone ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                  border: isDone ? '1px solid rgba(34,197,94,0.4)' : isActive ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.3s', fontSize: 11,
                }}>
                  {isDone ? '✓' : isActive ? (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animation: 'blink 1s infinite' }} />
                  ) : null}
                </div>
                <span style={{ fontSize: 13, color: isDone ? 'rgba(255,255,255,0.4)' : isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s' }}>
                  {step.label}
                </span>
                {isDone && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4ade80' }}>✓</span>}
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#38bdf8' }}>Running</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
