import { CrawlResult, CheckResult, SeoScores } from '@/types'

// ============================================================
// Helper — creates a passing check result
// ============================================================
function pass(check_key: string, name: string, category: any): CheckResult {
  return {
    check_key,
    name,
    category,
    severity: 'pass',
    description: name,
    score_impact: 0,
  }
}

// ============================================================
// Run ALL checks
// ============================================================
export function runAllChecks(data: CrawlResult): CheckResult[] {
  const checks: CheckResult[] = []
  checks.push(...runMetaChecks(data))
  checks.push(...runContentChecks(data))
  checks.push(...runPerformanceChecks(data))
  checks.push(...runTechnicalChecks(data))
  checks.push(...runMobileChecks(data))
  checks.push(...runSecurityChecks(data))
  checks.push(...runSocialChecks(data))
  checks.push(...runLinkChecks(data))
  checks.push(...runStructuredDataChecks(data))
  return checks
}

// ============================================================
// META CHECKS
// ============================================================
function runMetaChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.title) {
    results.push({
      check_key: 'missing_title',
      name: 'Missing page title',
      category: 'meta',
      severity: 'critical',
      description: 'No <title> tag found. The title is the most important on-page SEO element.',
      fix_text: 'Add a unique <title> tag to your <head>. Format: "Primary Keyword — Brand Name". Keep it 50–60 characters.',
      score_impact: 10,
    })
  } else if (data.title.length > 60) {
    results.push({
      check_key: 'title_too_long',
      name: 'Title tag too long (' + data.title.length + ' chars)',
      category: 'meta',
      severity: 'warning',
      description: 'Your title is ' + data.title.length + ' characters. Google truncates titles above 60 characters.',
      fix_text: 'Shorten your title to 50–60 characters.',
      score_impact: 5,
    })
  } else if (data.title.length < 30) {
    results.push({
      check_key: 'title_too_short',
      name: 'Title tag too short (' + data.title.length + ' chars)',
      category: 'meta',
      severity: 'warning',
      description: 'Your title is very short. Longer descriptive titles rank better.',
      fix_text: 'Expand your title to 50–60 chars with descriptive keywords and your brand name.',
      score_impact: 4,
    })
  } else {
    results.push(pass('title_ok', 'Title tag is well-optimized', 'meta'))
  }

  if (!data.metaDescription) {
    results.push({
      check_key: 'missing_meta_description',
      name: 'Missing meta description',
      category: 'meta',
      severity: 'critical',
      description: 'No meta description found. Google shows this in search results and it directly impacts click-through rate.',
      fix_text: 'Add <meta name="description" content="Your 150–160 char description"> to your <head>.',
      score_impact: 8,
    })
  } else if (data.metaDescription.length > 160) {
    results.push({
      check_key: 'meta_description_too_long',
      name: 'Meta description too long (' + data.metaDescription.length + ' chars)',
      category: 'meta',
      severity: 'warning',
      description: 'Meta description exceeds 160 characters and will be truncated in search results.',
      fix_text: 'Shorten your meta description to 150–160 characters.',
      score_impact: 4,
    })
  } else {
    results.push(pass('meta_description_ok', 'Meta description present and well-sized', 'meta'))
  }

  if (!data.canonicalUrl) {
    results.push({
      check_key: 'missing_canonical',
      name: 'Canonical URL not specified',
      category: 'meta',
      severity: 'warning',
      description: 'No canonical link tag found. This can cause duplicate content issues.',
      fix_text: 'Add <link rel="canonical" href="https://yourdomain.com/page/"> to your <head>.',
      score_impact: 6,
    })
  } else {
    results.push(pass('canonical_ok', 'Canonical URL is specified', 'technical'))
  }

  return results
}

// ============================================================
// CONTENT CHECKS
// ============================================================
function runContentChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (data.h1Tags.length === 0) {
    results.push({
      check_key: 'missing_h1',
      name: 'H1 heading missing',
      category: 'content',
      severity: 'critical',
      description: 'No H1 tag found. The H1 is the most important content signal for Google.',
      fix_text: 'Add exactly one <h1> near the top of your content with your primary keyword.',
      score_impact: 9,
    })
  } else if (data.h1Tags.length > 1) {
    results.push({
      check_key: 'multiple_h1',
      name: 'Multiple H1 tags found (' + data.h1Tags.length + ')',
      category: 'content',
      severity: 'warning',
      description: 'More than one H1 dilutes your topical focus.',
      fix_text: 'Keep exactly one H1 per page. Convert extras to H2 or H3.',
      affected_elements: data.h1Tags,
      score_impact: 5,
    })
  } else {
    results.push(pass('h1_ok', 'Single H1 heading found', 'content'))
  }

  const imagesWithoutAlt = data.images.filter((img: any) => !img.alt || img.alt.trim() === '')
  if (imagesWithoutAlt.length > 0) {
    results.push({
      check_key: 'missing_alt_attributes',
      name: imagesWithoutAlt.length + ' image(s) missing alt text',
      category: 'content',
      severity: imagesWithoutAlt.length > 3 ? 'critical' : 'warning',
      description: imagesWithoutAlt.length + ' of ' + data.images.length + ' images have no alt attribute.',
      fix_text: 'Add descriptive alt text to every image. Example: alt="SEO audit dashboard".',
      affected_elements: imagesWithoutAlt.map((i: any) => i.src).slice(0, 10),
      score_impact: 7,
    })
  } else if (data.images.length > 0) {
    results.push(pass('alt_attributes_ok', 'All images have alt text', 'content'))
  }

  if (data.wordCount < 300) {
    results.push({
      check_key: 'thin_content',
      name: 'Thin content (' + data.wordCount + ' words)',
      category: 'content',
      severity: 'warning',
      description: 'Pages with fewer than 300 words are considered thin content by Google.',
      fix_text: 'Expand your content to at least 500–800 words with depth and value.',
      score_impact: 6,
    })
  } else {
    results.push(pass('content_length_ok', 'Sufficient content length (' + data.wordCount + ' words)', 'content'))
  }

  return results
}

// ============================================================
// PERFORMANCE CHECKS
// ============================================================
function runPerformanceChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []
  const loadTimeMs = data.loadTimeMs || 0

  if (loadTimeMs > 5000) {
    results.push({
      check_key: 'slow_page_load',
      name: 'Very slow page load (' + (loadTimeMs / 1000).toFixed(1) + 's)',
      category: 'performance',
      severity: 'critical',
      description: 'Your page takes ' + (loadTimeMs / 1000).toFixed(1) + 's to load. Google threshold is under 2.5s.',
      fix_text: 'Compress images to WebP, enable browser caching, minify CSS/JS, use a CDN.',
      score_impact: 9,
    })
  } else if (loadTimeMs > 2500) {
    results.push({
      check_key: 'slow_page_load',
      name: 'Slow page load (' + (loadTimeMs / 1000).toFixed(1) + 's)',
      category: 'performance',
      severity: 'warning',
      description: 'Load time of ' + (loadTimeMs / 1000).toFixed(1) + 's is above Google\'s 2.5s threshold.',
      fix_text: 'Optimize images, enable caching headers, use a CDN, defer non-critical JS.',
      score_impact: 6,
    })
  } else {
    results.push(pass('page_load_ok', 'Fast page load (' + (loadTimeMs / 1000).toFixed(1) + 's)', 'performance'))
  }

  const renderBlocking = data.pageSpeedSignals?.renderBlockingCount || 0
  if (renderBlocking > 2) {
    results.push({
      check_key: 'render_blocking_resources',
      name: renderBlocking + ' render-blocking resources',
      category: 'performance',
      severity: 'warning',
      description: renderBlocking + ' CSS/JS files are blocking page rendering.',
      fix_text: 'Add "defer" or "async" to non-critical scripts. Load non-critical CSS asynchronously.',
      score_impact: 7,
    })
  } else {
    results.push(pass('no_render_blocking', 'No major render-blocking resources', 'performance'))
  }

  return results
}

// ============================================================
// TECHNICAL CHECKS
// ============================================================
function runTechnicalChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.hasSitemap) {
    results.push({
      check_key: 'missing_sitemap',
      name: 'XML sitemap not found',
      category: 'technical',
      severity: 'critical',
      description: 'No sitemap.xml found. Without it Google may miss pages.',
      fix_text: 'Generate a sitemap at /sitemap.xml and submit it in Google Search Console.',
      score_impact: 8,
    })
  } else {
    results.push(pass('sitemap_ok', 'XML sitemap found', 'technical'))
  }

  if (!data.hasRobotsTxt) {
    results.push({
      check_key: 'missing_robots_txt',
      name: 'robots.txt not found',
      category: 'technical',
      severity: 'critical',
      description: 'No robots.txt file found. Crawlers have no guidance on what to index.',
      fix_text: 'Create robots.txt at your site root with: User-agent: * / Allow: /',
      score_impact: 7,
    })
  } else {
    results.push(pass('robots_txt_ok', 'robots.txt found', 'technical'))
  }

  return results
}

// ============================================================
// MOBILE CHECKS
// ============================================================
function runMobileChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.hasViewportMeta) {
    results.push({
      check_key: 'missing_viewport',
      name: 'Viewport meta tag missing',
      category: 'mobile',
      severity: 'critical',
      description: 'No viewport meta tag found. Mobile browsers will render at desktop width.',
      fix_text: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
      score_impact: 9,
    })
  } else {
    results.push(pass('viewport_ok', 'Mobile viewport is configured', 'mobile'))
  }

  return results
}

// ============================================================
// SECURITY CHECKS
// ============================================================
function runSecurityChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.hasHttps) {
    results.push({
      check_key: 'no_https',
      name: 'Site not using HTTPS',
      category: 'security',
      severity: 'critical',
      description: 'Your site is served over HTTP. Google uses HTTPS as a ranking signal.',
      fix_text: 'Install an SSL certificate (free via Let\'s Encrypt) and redirect HTTP to HTTPS.',
      score_impact: 10,
    })
  } else {
    results.push(pass('https_ok', 'HTTPS / SSL certificate active', 'security'))
  }

  return results
}

// ============================================================
// SOCIAL CHECKS
// ============================================================
function runSocialChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.hasOgTags) {
    results.push({
      check_key: 'missing_og_tags',
      name: 'Open Graph tags missing',
      category: 'social',
      severity: 'warning',
      description: 'No OG meta tags found. Social shares will show random content instead of a preview.',
      fix_text: 'Add og:title, og:description, og:image, og:url to your <head>.',
      score_impact: 5,
    })
  } else {
    results.push(pass('og_tags_ok', 'Open Graph tags present', 'social'))
  }

  if (!data.hasTwitterCards) {
    results.push({
      check_key: 'missing_twitter_cards',
      name: 'Twitter Card tags missing',
      category: 'social',
      severity: 'info',
      description: 'No Twitter Card tags found. Tweets sharing this URL won\'t show rich previews.',
      fix_text: 'Add <meta name="twitter:card" content="summary_large_image"> and related tags.',
      score_impact: 4,
    })
  } else {
    results.push(pass('twitter_cards_ok', 'Twitter Card tags present', 'social'))
  }

  return results
}

// ============================================================
// LINKS CHECKS
// ============================================================
function runLinkChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  const brokenLinks = data.links.filter((l: any) => l.statusCode && l.statusCode >= 400)
  if (brokenLinks.length > 0) {
    results.push({
      check_key: 'broken_links',
      name: brokenLinks.length + ' broken link(s) found',
      category: 'links',
      severity: 'critical',
      description: brokenLinks.length + ' links return 4xx errors. Broken links hurt UX and crawl budget.',
      fix_text: 'Fix or remove all broken links. Use 301 redirects if content moved.',
      affected_elements: brokenLinks.map((l: any) => l.href).slice(0, 10),
      score_impact: 8,
    })
  } else {
    results.push(pass('links_ok', 'No broken links detected', 'links'))
  }

  return results
}

// ============================================================
// STRUCTURED DATA CHECKS
// ============================================================
function runStructuredDataChecks(data: CrawlResult): CheckResult[] {
  const results: CheckResult[] = []

  if (!data.hasStructuredData) {
    results.push({
      check_key: 'missing_structured_data',
      name: 'No structured data (Schema.org) found',
      category: 'structured_data',
      severity: 'warning',
      description: 'No JSON-LD schema found. Structured data helps Google show rich results.',
      fix_text: 'Add JSON-LD schema markup. Start with Organization and WebSite schemas.',
      score_impact: 6,
    })
  } else {
    results.push(pass('structured_data_ok', 'Structured data found', 'structured_data'))
  }

  return results
}

// ============================================================
// SCORING
// ============================================================
export function calculateScores(checks: CheckResult[]): SeoScores {
  function safe(n: number): number {
    if (isNaN(n) || !isFinite(n)) return 50
    return Math.min(100, Math.max(0, Math.round(n)))
  }

  function categoryScore(category: string): number {
    const cat = checks.filter(c => c.category === category)
    if (cat.length === 0) return 80
    let deductions = 0
    for (const c of cat) {
      const impact = c.score_impact || 0
      if (c.severity === 'critical') deductions += impact
      else if (c.severity === 'warning') deductions += impact * 0.5
      else if (c.severity === 'info') deductions += impact * 0.2
    }
    return safe(100 - deductions)
  }

  const meta        = categoryScore('meta')
  const content     = categoryScore('content')
  const performance = categoryScore('performance')
  const technical   = categoryScore('technical')
  const mobile      = categoryScore('mobile')
  const security    = categoryScore('security')
  const overall     = safe(
    meta * 0.2 +
    content * 0.2 +
    performance * 0.25 +
    technical * 0.15 +
    mobile * 0.1 +
    security * 0.1
  )

  return { overall, meta, content, performance, technical, mobile, security }
}

export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}