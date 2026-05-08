// ============================================================
// RaSEOTech — Shared TypeScript Types
// ============================================================

export type AuditStatus = 'pending' | 'crawling' | 'analyzing' | 'completed' | 'failed'
export type IssueSeverity = 'critical' | 'warning' | 'info' | 'pass'
export type IssueCategory =
  | 'meta'
  | 'content'
  | 'performance'
  | 'technical'
  | 'mobile'
  | 'security'
  | 'links'
  | 'structured_data'
  | 'social'

// ---- DB row types ----

export interface Domain {
  id: string
  domain: string
  first_seen_at: string
  last_seen_at: string
  audit_count: number
  is_blocked: boolean
  block_reason?: string
}

export interface Audit {
  id: string
  domain_id: string
  url: string
  overall_score: number | null
  grade: string | null
  score_meta: number | null
  score_content: number | null
  score_performance: number | null
  score_technical: number | null
  score_mobile: number | null
  score_security: number | null
  critical_count: number
  warning_count: number
  info_count: number
  passed_count: number
  total_checks: number
  status: AuditStatus
  error_message?: string
  crawl_duration_ms?: number
  page_load_ms?: number
  page_size_bytes?: number
  ip_address?: string
  ai_summary?: string
  ai_priority_fixes?: string[]
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface AuditIssue {
  id: string
  audit_id: string
  category: IssueCategory
  severity: IssueSeverity
  check_key: string
  name: string
  description: string
  detail?: string
  fix_text?: string
  affected_elements?: string[]
  score_impact: number
}

export interface AuditPageData {
  id: string
  audit_id: string
  title?: string
  meta_description?: string
  canonical_url?: string
  robots_tag?: string
  h1_tags: string[]
  h2_tags: string[]
  h3_tags: string[]
  total_images: number
  images_missing_alt: number
  images_oversized: number
  internal_links: number
  external_links: number
  broken_links: number
  broken_link_urls: string[]
  has_viewport_meta: boolean
  has_https: boolean
  has_sitemap: boolean
  has_robots_txt: boolean
  has_structured_data: boolean
  has_og_tags: boolean
  has_twitter_cards: boolean
  word_count: number
  reading_time_mins: number
  html_size_bytes: number
}

// ---- API response types ----

export interface AuditSubmitResponse {
  auditId: string
  status: AuditStatus
}

export interface AuditResultResponse {
  audit: Audit
  issues: AuditIssue[]
  pageData: AuditPageData | null
  domain: Domain
}

export interface AuditProgressResponse {
  auditId: string
  status: AuditStatus
  progress: number    // 0–100
  currentStep: string
  error?: string
}

// ---- Crawler internal types ----

export interface CrawlResult {
  url: string
  finalUrl: string          // after redirects
  statusCode: number
  loadTimeMs: number
  htmlSizeBytes: number
  html: string

  // Parsed data
  title: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  robotsTag: string | null
  h1Tags: string[]
  h2Tags: string[]
  h3Tags: string[]
  images: ImageInfo[]
  links: LinkInfo[]
  hasHttps: boolean
  hasSitemap: boolean
  hasRobotsTxt: boolean
  hasStructuredData: boolean
  hasOgTags: boolean
  hasTwitterCards: boolean
  hasViewportMeta: boolean
  wordCount: number
  renderBlockingResources: string[]
  pageSpeedSignals: PageSpeedSignals
}

export interface ImageInfo {
  src: string
  alt: string | null
  width?: number
  height?: number
  sizeBytes?: number
}

export interface LinkInfo {
  href: string
  text: string
  isInternal: boolean
  statusCode?: number
}

export interface PageSpeedSignals {
  estimatedLoadMs: number
  totalPageSizeBytes: number
  numberOfRequests: number
  renderBlockingCount: number
  largeImageCount: number
  unminifiedJsCount: number
  unminifiedCssCount: number
}

// ---- SEO scoring types ----

export interface SeoScores {
  overall: number
  meta: number
  content: number
  performance: number
  technical: number
  mobile: number
  security: number
}

export interface CheckResult {
  check_key: string
  name: string
  category: IssueCategory
  severity: IssueSeverity
  description: string
  detail?: string
  fix_text?: string
  affected_elements?: string[]
  score_impact: number
}
