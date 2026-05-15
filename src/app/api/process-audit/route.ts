import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/auditService'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key')
  if (key !== (process.env.INTERNAL_API_KEY ?? 'internal123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { auditId } = await req.json()
    if (!auditId) {
      return NextResponse.json({ error: 'Missing auditId' }, { status: 400 })
    }

    console.log('Running audit:', auditId)
    await runAudit(auditId)
    console.log('Audit done:', auditId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Process audit error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
