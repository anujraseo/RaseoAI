import { NextRequest, NextResponse } from 'next/server'
import { createAudit, isRateLimited } from '@/lib/auditService'
import { validateAuditUrl, checkHoneypot, getIp } from '@/lib/spamProtection'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, honeypot } = body

    if (!url) {
      return NextResponse.json({ error: 'Please enter a URL' }, { status: 400 })
    }

    if (checkHoneypot(honeypot)) {
      return NextResponse.json({ auditId: 'blocked', status: 'pending' })
    }

    const urlCheck = validateAuditUrl(url)
    if (urlCheck.blocked) {
      return NextResponse.json({ error: urlCheck.reason ?? 'Invalid URL' }, { status: 400 })
    }

    const ip = getIp(req)
    const domain = new URL(url).hostname.replace(/^www\./, '')

    const rateLimited = await isRateLimited(ip, domain)
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const audit = await createAudit(url, ip)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-seoaudit.com'
    fetch(baseUrl + '/api/process-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? 'internal123',
      },
      body: JSON.stringify({ auditId: audit.id }),
    }).catch((e: Error) => console.error('Background error:', e.message))

    return NextResponse.json({ auditId: audit.id, status: 'pending' })

  } catch (err: any) {
    console.error('Audit error:', err?.message)
    return NextResponse.json(
      { error: 'Failed to start audit. Please try again.' },
      { status: 500 }
    )
  }
}
