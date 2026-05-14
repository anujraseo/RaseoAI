'use client'

import { useState, useEffect, useRef } from 'react'
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleSubmit = async (url: string, recaptchaToken: string) => {
    setSubmittedUrl(url)
    setAppState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, recaptchaToken, honeypot: '' }),
      })

      const data = await res.json()

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

  const fetchResult = async (auditId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/results/' + auditId)
      if (!res.ok) return false

      const data = await res.json()

      // Completed — has score
      if (data?.audit?.overall_score !== null &&
          data?.audit?.overall_score !== undefined) {
        setResult(data as AuditResultResponse)
        setAppState('lead_gate')
        return true
      }

      // Status based check
      const status = data?.status ?? data?.audit?.status
      if (status === 'completed') {
        setResult(data as AuditResultResponse)
        setAppState('lead_gate')
        return true
      }

      if (status === 'failed') {
        setErrorMessage(data.error ?? 'Audit failed. Please try again.')
        setAppState('error')
        return true
      }

      setProgress(data as AuditProgressResponse)
      return false
    } catch {
      return false
    }
  }

  const startPolling = (auditId: string) => {
    if (timerRef.current) clearInterval(timerRef.current)

    let attempts = 0
    const MAX_ATTEMPTS = 60 // 60 x 3s = 3 minutes

    // First check after 5 seconds
    setTimeout(async () => {
      const done = await fetchResult(auditId)
      if (done) return

      // Then poll every 3 seconds
      timerRef.current = setInterval(async () => {
        attempts++

        if (attempts > MAX_ATTEMPTS) {
          clearInterval(timerRef.current!)
          // Don't show error — show a "check back" message
          setErrorMessage(
            'Your audit is still processing. Click "Try Again" to check if it completed.'
          )
          setAppState('error')
          return
        }

        const done = await fetchResult(auditId)
        if (done && timerRef.current) {
          clearInterval(timerRef.current)
        }
      }, 3000)
    }, 5000)
  }

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
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

      {appState === 'lead_gate' && result && (
        <>
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.4 }}>
            <ReportSection result={result} onReset={handleReset} />
          </div>
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
            {errorMessage.includes('still processing') ? 'Almost Done!' : 'Audit Failed'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
            {errorMessage}
          </p>
          <button onClick={handleReset} style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', borderRadius: 10, color: '#fff',
            padding: '12px 28px', fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
          }}>
            Try Again
          </button>
        </div>
      )}
    </main>
  )
}