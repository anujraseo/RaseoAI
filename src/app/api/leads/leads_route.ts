import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query } from '@/lib/db'

const LeadSchema = z.object({
  fullName:    z.string().min(1, 'Full name is required'),
  email:       z.string().email('Valid email is required'),
  phone:       z.string().optional(),
  company:     z.string().optional(),
  auditId:     z.string().optional(),
  url:         z.string().optional(),
  score:       z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { fullName, email, phone, company, auditId, url, score } = parsed.data

    await query(`
      INSERT INTO leads (full_name, email, phone, company, audit_id, url, score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      fullName,
      email,
      phone ?? null,
      company ?? null,
      auditId ?? null,
      url ?? null,
      score ?? null,
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Lead capture error:', err.message)
    return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
  }
}
