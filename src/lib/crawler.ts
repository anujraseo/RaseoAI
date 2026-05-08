import * as cheerio from 'cheerio'
import { CrawlResult, ImageInfo, LinkInfo, PageSpeedSignals } from '@/types'

export async function crawlPage(rawUrl: string): Promise<CrawlResult> {
  let url = rawUrl.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const startTime = Date.now()

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RaSEOTechBot/1.0)',
    },
    redirect: 'follow',
  })

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
 $('h1').each((_, el) => { h1Tags.push($(el).text().trim()) })
$('h2').each((_, el) => { h2Tags.push($(el).text().trim()) })
$('h3').each((_, el) => { h3Tags.push($(el).text().trim()) })

  const images: ImageInfo[] = []
 $('img').each((_, el) => {
  images.push({
    src: $(el).attr('src') || '',
    alt: $(el).attr('alt') ?? null,
  }); return true
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

  const origin = `${parsedBase.protocol}//${parsedBase.host}`
  const [hasSitemap, hasRobotsTxt] = await Promise.all([
    fetch(`${origin}/sitemap.xml`).then(r => r.ok).catch(() => false),
    fetch(`${origin}/robots.txt`).then(r => r.ok).catch(() => false),
  ])

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(' ').filter(Boolean).length

  const pageSpeedSignals: PageSpeedSignals = {
    estimatedLoadMs: loadTimeMs,
    totalPageSizeBytes: htmlSizeBytes,
    numberOfRequests: 1,
    renderBlockingCount: $('script:not([async]):not([defer])').length,
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

export async function closeBrowser(): Promise<void> {}