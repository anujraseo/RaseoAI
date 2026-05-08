import { query, queryOne, withTransaction } from '@/lib/db'
import { crawlPage } from '@/lib/crawler'
import { runAllChecks, calculateScores, scoreToGrade } from '@/lib/seoChecks'
import { Audit, Domain } from '@/types'

export async function createAudit(url: string, ipAddress: string): Promise<Audit> {
  const parsedUrl = new URL(url)
  const domain = parsedUrl.hostname.replace(/^www\./, '')

  return withTransaction(async (client) => {
    await client.query(`
      INSERT INTO domains (domain)
      VALUES ($1)
      ON CONFLICT (domain) DO UPDATE SET last_seen_at = NOW()
    `, [domain])

    const domainRow = await client.query(
      'SELECT id FROM domains WHERE domain = $1', [domain]
    )
    const domainId = domainRow.rows[0].id

    const result = await client.query(`
      INSERT INTO audits (domain_id, url, status, ip_address, started_at)
      VALUES ($1, $2, 'pending', $3, NOW())
      RETURNING *
    `, [domainId, url, ipAddress])

    return result.rows[0] as Audit
  })
}

export async function runAudit(auditId: string): Promise<void> {
  console.log('🚀 runAudit started:', auditId)

  try {
    const audit = await queryOne<Audit>('SELECT * FROM audits WHERE id = $1', [auditId])
    if (!audit) {
      console.log('❌ Audit not found:', auditId)
      return
    }

    // Step 1: Crawl
    await query('UPDATE audits SET status = $1, updated_at = NOW() WHERE id = $2', ['crawling', auditId])
    console.log('🔍 Crawling:', audit.url)

    let crawlData: any
    const crawlStart = Date.now()

    try {
      crawlData = await crawlPage(audit.url)
      console.log('✅ Crawl done:', crawlData.title)
    } catch (crawlErr: any) {
      console.log('❌ Crawl error:', crawlErr.message)
      await query(
        'UPDATE audits SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        ['failed', 'Crawl failed: ' + crawlErr.message, auditId]
      )
      return
    }

    // Step 2: Analyze
    await query('UPDATE audits SET status = $1, updated_at = NOW() WHERE id = $2', ['analyzing', auditId])
    console.log('🔎 Running checks...')

    const checks = runAllChecks(crawlData)
    console.log('✅ Checks done:', checks.length)

    const scores = calculateScores(checks)
    console.log('✅ Scores:', JSON.stringify(scores))

    const grade = scoreToGrade(scores.overall)
    const criticalCount = checks.filter(c => c.severity === 'critical').length
    const warningCount  = checks.filter(c => c.severity === 'warning').length
    const infoCount     = checks.filter(c => c.severity === 'info').length
    const passedCount   = checks.filter(c => c.severity === 'pass').length

    // Step 3: AI Summary
    console.log('🤖 AI summary...')
    let aiSummary = ''
    try {
      aiSummary = await generateAiSummary(audit.url, scores, checks)
    } catch {
      aiSummary = `This site scored ${scores.overall}/100. Fix ${criticalCount} critical issues to improve rankings.`
    }
    console.log('✅ AI done')

    const aiPriorityFixes = checks
      .filter(c => c.severity === 'critical')
      .sort((a, b) => b.score_impact - a.score_impact)
      .slice(0, 3)
      .map(c => c.name)

    // Step 4: Save - update audit first
    console.log('💾 Saving audit...')
    await query(`
      UPDATE audits SET
        status = 'completed',
        overall_score = $1,
        grade = $2,
        score_meta = $3,
        score_content = $4,
        score_performance = $5,
        score_technical = $6,
        score_mobile = $7,
        score_security = $8,
        critical_count = $9,
        warning_count = $10,
        info_count = $11,
        passed_count = $12,
        total_checks = $13,
        crawl_duration_ms = $14,
        page_load_ms = $15,
        page_size_bytes = $16,
        ai_summary = $17,
        ai_priority_fixes = $18,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $19
    `, [
      scores.overall || 0,
      grade,
      scores.meta || 0,
      scores.content || 0,
      scores.performance || 0,
      scores.technical || 0,
      scores.mobile || 0,
      scores.security || 0,
      criticalCount,
      warningCount,
      infoCount,
      passedCount,
      checks.length,
      Date.now() - crawlStart,
      crawlData.loadTimeMs || 0,
      crawlData.htmlSizeBytes || 0,
      aiSummary,
      aiPriorityFixes,
      auditId,
    ])
    console.log('✅ Audit saved as completed!')

    // Step 5: Save issues
    console.log('💾 Saving issues...')
    for (const check of checks) {
      try {
        await query(`
          INSERT INTO audit_issues
            (audit_id, category, severity, check_key, name, description, detail, fix_text, affected_elements, score_impact)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `, [
          auditId,
          check.category,
          check.severity,
          check.check_key,
          check.name,
          check.description,
          check.detail ?? null,
          check.fix_text ?? null,
          check.affected_elements ?? null,
          check.score_impact || 0,
        ])
      } catch (issueErr: any) {
        console.log('⚠️ Issue save error:', issueErr.message)
      }
    }
    console.log('✅ Issues saved')

    // Step 6: Save page data
    console.log('💾 Saving page data...')
    try {
      await query(`
        INSERT INTO audit_page_data
          (audit_id, title, meta_description, canonical_url, robots_tag,
           h1_tags, h2_tags, h3_tags,
           total_images, images_missing_alt, images_oversized,
           internal_links, external_links, broken_links, broken_link_urls,
           has_viewport_meta, has_https, has_sitemap, has_robots_txt,
           has_structured_data, has_og_tags, has_twitter_cards,
           word_count, html_size_bytes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      `, [
        auditId,
        crawlData.title || null,
        crawlData.metaDescription || null,
        crawlData.canonicalUrl || null,
        crawlData.robotsTag || null,
        crawlData.h1Tags || [],
        crawlData.h2Tags || [],
        crawlData.h3Tags || [],
        crawlData.images?.length || 0,
        crawlData.images?.filter((i: any) => !i.alt).length || 0,
        0,
        crawlData.links?.filter((l: any) => l.isInternal).length || 0,
        crawlData.links?.filter((l: any) => !l.isInternal).length || 0,
        0,
        [],
        crawlData.hasViewportMeta || false,
        crawlData.hasHttps || false,
        crawlData.hasSitemap || false,
        crawlData.hasRobotsTxt || false,
        crawlData.hasStructuredData || false,
        crawlData.hasOgTags || false,
        crawlData.hasTwitterCards || false,
        crawlData.wordCount || 0,
        crawlData.htmlSizeBytes || 0,
      ])
      console.log('✅ Page data saved')
    } catch (pageErr: any) {
      console.log('⚠️ Page data error (non-fatal):', pageErr.message)
    }

    console.log('🎉 AUDIT FULLY COMPLETE:', auditId)

  } catch (err: any) {
    console.log('❌ runAudit crashed:', err.message)
    await query(
      'UPDATE audits SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
      ['failed', err.message, auditId]
    ).catch(() => {})
  }
}

export async function getAuditResult(auditId: string) {
  const audit = await queryOne<Audit>(
    'SELECT * FROM audits WHERE id = $1', [auditId]
  )
  if (!audit) return null

  const issues = await query(
    `SELECT * FROM audit_issues WHERE audit_id = $1
     ORDER BY
       CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 WHEN 'info' THEN 2 ELSE 3 END,
       score_impact DESC`,
    [auditId]
  )

  const pageData = await queryOne(
    'SELECT * FROM audit_page_data WHERE audit_id = $1', [auditId]
  )

  const domain = await queryOne<Domain>(
    'SELECT * FROM domains WHERE id = $1', [audit.domain_id]
  )

  return { audit, issues, pageData, domain }
}

export async function isRateLimited(ip: string, domain: string): Promise<boolean> {
  const maxPerIp     = Number(process.env.RATE_LIMIT_PER_IP) || 100
  const maxPerDomain = Number(process.env.RATE_LIMIT_PER_DOMAIN) || 50
  try {
    const ipRes = await query<any>(
      'SELECT check_rate_limit($1, $2, $3, $4) as limited',
      [ip, 'ip', maxPerIp, '1 hour']
    )
    if (ipRes[0]?.limited) return true

    const domRes = await query<any>(
      'SELECT check_rate_limit($1, $2, $3, $4) as limited',
      [domain, 'domain', maxPerDomain, '1 hour']
    )
    return domRes[0]?.limited ?? false
  } catch (err: any) {
    console.log('Rate limit check skipped:', err.message)
    return false
  }
}

async function generateAiSummary(url: string, scores: any, checks: any[]): Promise<string> {
  const criticalCount = checks.filter(c => c.severity === 'critical').length
  const warningCount  = checks.filter(c => c.severity === 'warning').length
  const passedCount   = checks.filter(c => c.severity === 'pass').length
  const criticalIssues = checks
    .filter(c => c.severity === 'critical')
    .map(c => c.name)
    .join(', ')
  const warningIssues = checks
    .filter(c => c.severity === 'warning')
    .map(c => c.name)
    .join(', ')

  const fallback = `**Overall Health: ${scores.overall}/100**

Your website has ${criticalCount} critical issues that are actively preventing it from ranking on Google. The most urgent problems are: ${criticalIssues || 'none detected'}. 

**Performance** is scored at ${scores.performance}/100 — page speed directly impacts your Google rankings and user experience. **Technical SEO** sits at ${scores.technical}/100, meaning search engine crawlers may be missing key pages. Your **content** scores ${scores.content}/100, suggesting room to improve how Google understands your page topics.

The good news: ${passedCount} checks are passing. Fix the ${criticalCount} critical issues first and you could see ranking improvements within 2–4 weeks.`

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder') {
    return fallback
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const prompt = `You are a world-class SEO consultant writing a detailed audit report for ${url}.

Site scores:
- Overall: ${scores.overall}/100
- On-page SEO: ${scores.meta}/100  
- Content: ${scores.content}/100
- Performance: ${scores.performance}/100
- Technical SEO: ${scores.technical}/100
- Mobile: ${scores.mobile}/100
- Security: ${scores.security}/100

Critical issues found (${criticalCount}): ${criticalIssues || 'None'}
Warnings (${warningCount}): ${warningIssues || 'None'}
Checks passed: ${passedCount}

Write a detailed, expert SEO audit summary with exactly these 4 sections. Use this exact format:

**Overall Assessment**
Write 2-3 sentences giving an honest, expert assessment of the site's SEO health. Be specific about the score and what it means for rankings. Mention the domain name.

**What's Hurting Your Rankings**
Write 3-4 sentences explaining the most damaging issues in plain language. Explain WHY each issue hurts rankings, not just what it is. Be specific and urgent.

**Quick Wins (Fix These First)**
Write 3-4 sentences identifying the highest-impact fixes. Explain the expected impact of fixing them. Give a realistic timeline for seeing results.

**Growth Potential**
Write 2-3 sentences about what the site could achieve with proper SEO. Be inspiring but realistic. Mention specific ranking and traffic improvements possible.

Write like a senior SEO consultant — authoritative, specific, and actionable. No generic advice. Reference the actual scores and issues.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const data = await response.json()
    return data.content?.[0]?.text ?? fallback
  } catch {
    return fallback
  }
}