import * as cheerio from 'cheerio'
import { CrawlResult, ImageInfo, LinkInfo, PageSpeedSignals } from '@/types'

export async function crawlPage(rawUrl: string): Promise<CrawlResult> {
  let url = rawUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const startTime = Date.now()

  // Strict 8 second timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISEOAuditBot/1.0; +https://ai-seoaudit.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error('Page took too long to respond (timeout after 8s)')
    }
    throw new Error('Failed to fetch page: ' + err.message)
  }

  clearTimeout(timeout)

  if (!response.ok && response.status !== 200) {
    throw new Error(`Page returned status ${response.status}`)
  }

  const html = await response.text()
  const loadTimeMs = Date.now() - startTime
  const htmlSizeBytes = Buffer.byteLength(html, 'utf8')
  const finalUrl = response.url

  const $ = cheerio.load(html)

  const title = $('title').first().text().trim() || null
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null
  const canonicalUrl = $('link[rel="canonical"]').attr('href')?.trim() || null
  const robotsTag = $('meta[name="robots"]').attr('content')?.trim() || null

  const h1Tags: string[] = []
  const h2Tags: string[] = []
  const h3Tags: string[] = []
  $('h1').each((_, el): void => { h1Tags.push($(el).text().trim()) })
  $('h2').each((_, el): void => { h2Tags.push($(el).text().trim()) })
  $('h3').each((_, el): void => { h3Tags.push($(el).text().trim()) })

  const images: ImageInfo[] = []
  $('img').each((_, el): void => {
    images.push({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') ?? null,
    })
  })

  const parsedBase = new URL(finalUrl)
  const links: LinkInfo[] = []
  $('a[href]').each((_, el): void => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()
    let isInternal = false
    try {
      const resolved = new URL(href, finalUrl)
      isInternal = resolved.hostname === parsedBase.hostname
    } catch {}
    links.push({ href, text, isInternal })
  })

  const hasHttps = finalUrl.startsWith('https://')
  const hasViewportMeta = !!$('meta[name="viewport"]').length
  const hasStructuredData = !!$('script[type="application/ld+json"]').length
  const hasOgTags = !!$('meta[property^="og:"]').length
  const hasTwitterCards = !!$('meta[name^="twitter:"]').length

  // Check sitemap and robots with short timeout
  const origin = `${parsedBase.protocol}//${parsedBase.host}`
  const [hasSitemap, hasRobotsTxt] = await Promise.all([
    fetchWithTimeout(`${origin}/sitemap.xml`, 3000),
    fetchWithTimeout(`${origin}/robots.txt`, 3000),
  ])

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(Boolean).length

  const renderBlockingCount = $('script:not([async]):not([defer])').length

  const pageSpeedSignals: PageSpeedSignals = {
    estimatedLoadMs: loadTimeMs,
    totalPageSizeBytes: htmlSizeBytes,
    numberOfRequests: 1,
    renderBlockingCount,
    largeImageCount: 0,
    unminifiedJsCount: 0,
    unminifiedCssCount: 0,
  }

  return {
    url,
    finalUrl,
    statusCode: response.status,
    loadTimeMs,
    htmlSizeBytes,
    html,
    title,
    metaDescription,
    canonicalUrl,
    robotsTag,
    h1Tags,
    h2Tags,
    h3Tags,
    images,
    links,
    hasHttps,
    hasSitemap,
    hasRobotsTxt,
    hasStructuredData,
    hasOgTags,
    hasTwitterCards,
    hasViewportMeta,
    wordCount,
    renderBlockingResources: [],
    pageSpeedSignals,
  }
}

async function fetchWithTimeout(url: string, ms: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), ms)
    const r = await fetch(url, { signal: controller.signal })
    clearTimeout(t)
    return r.ok
  } catch {
    return false
  }
}

export async function closeBrowser(): Promise<void> {}