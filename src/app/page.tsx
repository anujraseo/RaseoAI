'use client'

import { useState, useCallback } from 'react'
import HeroSection from '@/components/audit/HeroSection'
import LoadingSection from '@/components/audit/LoadingSection'
import ReportSection from '@/components/audit/ReportSection'
import LeadCaptureModal from '@/components/audit/LeadCaptureModal'
import { AuditResultResponse, AuditProgressResponse } from '@/types'

type AppState = 'idle' | 'loading' | 'lead_gate' | 'complete' | 'error'

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [progress, setProgress] = useState<AuditProgressResponse | null>(null)
  const [result, setResult] = useState<AuditResultResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [submittedUrl, setSubmittedUrl] = useState<string>('')

  const handleSubmit = async (url: string, recaptchaToken: string) => {
    setSubmittedUrl(url)
    setAppState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, recaptchaToken }),
      })

      const data = await res.json()
      console.log('Audit created:', data)

      if (!res.ok) {
        setErrorMessage(data.error ?? 'Failed to start audit.')
        setAppState('error')
        return
      }

      startPolling(data.auditId)
    } catch {
      setErrorMessage('Network error. Please check your connection.')
      setAppState('error')
    }
  }

  const startPolling = (auditId: string) => {
    console.log('Starting polling for:', auditId)
    let attempts = 0

    const timer = setInterval(async () => {
      attempts++
      if (attempts > 40) {
        clearInterval(timer)
        setErrorMessage('Audit timed out. Please try again.')
        setAppState('error')
        return
      }

      try {
        const res = await fetch('/api/results/' + auditId)
        const data = await res.json()
        const status = data.status ?? data.audit?.status

        if (status === 'completed' || status === undefined) {
          clearInterval(timer)
          setResult(data as AuditResultResponse)
          setAppState('lead_gate') // Show lead gate before report
        } else if (status === 'failed') {
          clearInterval(timer)
          setErrorMessage(data.error ?? 'Audit failed.')
          setAppState('error')
        } else {
          setProgress(data as AuditProgressResponse)
        }
      } catch (err) {
        console.log('Poll error:', err)
      }
    }, 5000)
  }

  const handleReset = () => {
    setAppState('idle')
    setProgress(null)
    setResult(null)
    setErrorMessage('')
    setSubmittedUrl('')
  }

  return (
    <main>
      {appState === 'idle' && (
        <HeroSection onSubmit={handleSubmit} />
      )}

      {appState === 'loading' && (
        <LoadingSection url={submittedUrl} progress={progress} />
      )}

      {/* Lead gate shows ON TOP of the report */}
      {appState === 'lead_gate' && result && (
        <>
          {/* Blurred report behind modal */}
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.4 }}>
            <ReportSection result={result} onReset={handleReset} />
          </div>
          {/* Lead capture modal */}
          <LeadCaptureModal
            auditId={result.audit?.id ?? ''}
            url={result.audit?.url ?? submittedUrl}
            score={result.audit?.overall_score ?? 0}
            onUnlock={() => setAppState('complete')}
          />
        </>
      )}

      {appState === 'complete' && result && (
        <ReportSection result={result} onReset={handleReset} />
      )}

      {appState === 'error' && (
        <div style={{
          maxWidth: 560, margin: '120px auto',
          textAlign: 'center', padding: '0 24px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{
            fontFamily: 'var(--font-syne)', fontSize: 22,
            fontWeight: 700, color: '#fff', marginBottom: 12,
          }}>
            Audit Failed
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
            {errorMessage}
          </p>
          <button onClick={handleReset} style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', borderRadius: 10, color: '#fff',
            padding: '12px 28px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            Try Again
          </button>
        </div>
      )}
    </main>
  )
}
