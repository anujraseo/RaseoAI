import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, company, auditId, url, score } = body

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    await query(`
      INSERT INTO leads (full_name, email, phone, company, audit_id, url, score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      fullName,
      email,
      phone ?? null,
      company ?? null,
      auditId && auditId !== '' ? auditId : null,
      url ?? null,
      score ?? null,
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Lead capture error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
