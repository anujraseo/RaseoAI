import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// ============================================================
// GET /api/dashboard
// Returns aggregate stats, recent audits, trending issues
// Protected by a simple admin token (set DASHBOARD_SECRET in env)
// ============================================================

export async function GET(req: NextRequest) {
  // Simple admin auth — check for ?secret= or Authorization header
  const secret = req.nextUrl.searchParams.get('secret') ??
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (process.env.DASHBOARD_SECRET && secret !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [stats, recentAudits, topIssues, scoreDistribution, dailyAudits, recentLeads] = await Promise.all([
  getGlobalStats(),
  getRecentAudits(20),
  getTopIssues(10),
  getScoreDistribution(),
  getDailyAudits(30),
  getRecentLeads(20),
])

return NextResponse.json({ stats, recentAudits, topIssues, scoreDistribution, dailyAudits, recentLeads })

}

// ============================================================
// Queries
// ============================================================

async function getGlobalStats() {
  const row = await queryOne<any>(`
    SELECT
      COUNT(*)                                                  AS total_audits,
      COUNT(*) FILTER (WHERE status = 'completed')              AS completed_audits,
      COUNT(*) FILTER (WHERE status = 'failed')                 AS failed_audits,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24h') AS audits_today,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7d')  AS audits_this_week,
      ROUND(AVG(overall_score) FILTER (WHERE status='completed'))  AS avg_score,
      COUNT(DISTINCT domain_id)                                 AS unique_domains,
      SUM(critical_count) FILTER (WHERE status='completed')     AS total_critical_issues,
      SUM(total_checks)   FILTER (WHERE status='completed')     AS total_checks_run
    FROM audits
  `)
  return row
}

async function getRecentAudits(limit: number) {
  return query<any>(`
    SELECT
      a.id,
      d.domain,
      a.url,
      a.overall_score,
      a.grade,
      a.critical_count,
      a.warning_count,
      a.passed_count,
      a.status,
      a.page_load_ms,
      a.created_at,
      a.completed_at
    FROM audits a
    JOIN domains d ON d.id = a.domain_id
    ORDER BY a.created_at DESC
    LIMIT $1
  `, [limit])
}

async function getTopIssues(limit: number) {
  return query<any>(`
    SELECT
      check_key,
      name,
      category,
      severity,
      COUNT(*) AS occurrence_count,
      ROUND(AVG(score_impact), 1) AS avg_impact
    FROM audit_issues
    WHERE severity IN ('critical', 'warning')
    GROUP BY check_key, name, category, severity
    ORDER BY occurrence_count DESC
    LIMIT $1
  `, [limit])
}

async function getScoreDistribution() {
  return query<any>(`
    SELECT
      CASE
        WHEN overall_score >= 90 THEN 'A+ (90–100)'
        WHEN overall_score >= 80 THEN 'A (80–89)'
        WHEN overall_score >= 70 THEN 'B (70–79)'
        WHEN overall_score >= 60 THEN 'C (60–69)'
        WHEN overall_score >= 50 THEN 'D (50–59)'
        ELSE                          'F (0–49)'
      END AS grade_range,
      COUNT(*) AS count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
    FROM audits
    WHERE status = 'completed' AND overall_score IS NOT NULL
    GROUP BY 1
    ORDER BY MIN(overall_score) DESC
  `)
}

async function getDailyAudits(days: number) {
  return query<any>(`
    SELECT
      DATE(created_at AT TIME ZONE 'Asia/Kolkata') AS date,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      ROUND(AVG(overall_score) FILTER (WHERE status='completed')) AS avg_score
    FROM audits
    WHERE created_at > NOW() - ($1 || ' days')::INTERVAL
    GROUP BY 1
    ORDER BY 1
  `, [days])
}

async function getRecentLeads(limit: number) {
  return query<any>(`
    SELECT
      l.id,
      l.full_name,
      l.email,
      l.phone,
      l.company,
      l.url,
      l.score,
      l.created_at,
      a.grade
    FROM leads l
    LEFT JOIN audits a ON a.id = l.audit_id
    ORDER BY l.created_at DESC
    LIMIT $1
  `, [limit])
}