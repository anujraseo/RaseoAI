import { NextRequest, NextResponse } from 'next/server'
import { getAuditResult } from '@/lib/auditService'
import { queryOne } from '@/lib/db'
import { Audit } from '@/types'

export const maxDuration = 60
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid audit ID' }, { status: 400 })
  }

  try {
    // First check just the status (fast)
    const audit = await queryOne<Audit>(
      'SELECT id, status, error_message FROM audits WHERE id = $1',
      [id]
    )

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // If still running, return progress info only
    if (audit.status === 'pending' || audit.status === 'crawling' || audit.status === 'analyzing') {
      return NextResponse.json({
        auditId: id,
        status: audit.status,
        progress: statusToProgress(audit.status),
        currentStep: statusToStep(audit.status),
      })
    }

    // If failed
    if (audit.status === 'failed') {
      return NextResponse.json({
        auditId: id,
        status: 'failed',
        progress: 0,
        currentStep: 'Failed',
        error: audit.error_message ?? 'Unknown error occurred',
      })
    }

    // Completed — return full results
    const result = await getAuditResult(id)
    if (!result) {
      return NextResponse.json({ error: 'Results not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('GET /api/results/[id] error:', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

function statusToProgress(status: string): number {
  switch (status) {
    case 'pending': return 10
    case 'crawling': return 40
    case 'analyzing': return 75
    case 'completed': return 100
    default: return 0
  }
}

function statusToStep(status: string): string {
  switch (status) {
    case 'pending': return 'Starting crawl...'
    case 'crawling': return 'Crawling page content...'
    case 'analyzing': return 'Running SEO checks and generating report...'
    default: return ''
  }
}
