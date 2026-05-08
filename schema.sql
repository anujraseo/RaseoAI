-- ============================================================
-- RaSEOTech SEO Audit Tool — Database Schema
-- PostgreSQL 15+
-- Run: psql -U postgres -d raseotech -f schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search on URLs

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE audit_status AS ENUM (
  'pending',
  'crawling',
  'analyzing',
  'completed',
  'failed'
);

CREATE TYPE issue_severity AS ENUM (
  'critical',
  'warning',
  'info',
  'pass'
);

CREATE TYPE issue_category AS ENUM (
  'meta',
  'content',
  'performance',
  'technical',
  'mobile',
  'security',
  'links',
  'structured_data',
  'social'
);

-- ============================================================
-- TABLE: domains
-- Tracks unique domains audited (for rate limiting & analytics)
-- ============================================================

CREATE TABLE domains (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain        VARCHAR(255) NOT NULL UNIQUE,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audit_count   INTEGER NOT NULL DEFAULT 0,
  is_blocked    BOOLEAN NOT NULL DEFAULT FALSE,   -- block spam domains
  block_reason  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_domains_domain ON domains(domain);
CREATE INDEX idx_domains_last_seen ON domains(last_seen_at);

-- ============================================================
-- TABLE: audits
-- One row per audit request
-- ============================================================

CREATE TABLE audits (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id        UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,

  -- The exact URL submitted by user
  url              TEXT NOT NULL,

  -- Overall scores (0–100)
  overall_score    SMALLINT CHECK (overall_score BETWEEN 0 AND 100),
  grade            CHAR(2),    -- A+, A, B, C, D, F

  -- Category scores
  score_meta       SMALLINT CHECK (score_meta BETWEEN 0 AND 100),
  score_content    SMALLINT CHECK (score_content BETWEEN 0 AND 100),
  score_performance SMALLINT CHECK (score_performance BETWEEN 0 AND 100),
  score_technical  SMALLINT CHECK (score_technical BETWEEN 0 AND 100),
  score_mobile     SMALLINT CHECK (score_mobile BETWEEN 0 AND 100),
  score_security   SMALLINT CHECK (score_security BETWEEN 0 AND 100),

  -- Issue counts
  critical_count   SMALLINT DEFAULT 0,
  warning_count    SMALLINT DEFAULT 0,
  info_count       SMALLINT DEFAULT 0,
  passed_count     SMALLINT DEFAULT 0,
  total_checks     SMALLINT DEFAULT 0,

  -- Crawl metadata
  status           audit_status NOT NULL DEFAULT 'pending',
  error_message    TEXT,
  crawl_duration_ms INTEGER,  -- how long the crawl took
  page_load_ms     INTEGER,   -- actual page load time detected
  page_size_bytes  BIGINT,
  ip_address       INET,      -- IP of the requester (for rate limiting)

  -- AI-generated summary
  ai_summary       TEXT,
  ai_priority_fixes TEXT[],   -- top 3 recommended fixes

  -- Timestamps
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audits_domain_id ON audits(domain_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX idx_audits_ip ON audits(ip_address);
CREATE INDEX idx_audits_url ON audits USING gin(url gin_trgm_ops);

-- ============================================================
-- TABLE: audit_issues
-- Individual SEO check results for each audit
-- ============================================================

CREATE TABLE audit_issues (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id     UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  category     issue_category NOT NULL,
  severity     issue_severity NOT NULL,
  check_key    VARCHAR(100) NOT NULL,  -- machine-readable key e.g. "missing_meta_description"
  name         VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  detail       TEXT,                   -- expanded explanation
  fix_text     TEXT,                   -- how to fix it
  affected_elements TEXT[],            -- e.g. list of img srcs missing alt
  score_impact SMALLINT DEFAULT 0,     -- how much this affects the score (0–10)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issues_audit_id ON audit_issues(audit_id);
CREATE INDEX idx_issues_severity ON audit_issues(severity);
CREATE INDEX idx_issues_category ON audit_issues(category);
CREATE INDEX idx_issues_check_key ON audit_issues(check_key);

-- ============================================================
-- TABLE: rate_limits
-- Tracks requests per IP/domain to prevent abuse
-- ============================================================

CREATE TABLE rate_limits (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier   VARCHAR(255) NOT NULL,  -- IP address or domain
  limit_type   VARCHAR(50) NOT NULL,   -- 'ip' or 'domain'
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rate_limits_identifier_window
  ON rate_limits(identifier, window_start);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- ============================================================
-- TABLE: audit_page_data
-- Raw crawled page data stored per audit (for debugging/re-analysis)
-- ============================================================

CREATE TABLE audit_page_data (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id     UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,

  -- Meta
  title        TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  robots_tag   VARCHAR(100),

  -- Headings
  h1_tags      TEXT[],
  h2_tags      TEXT[],
  h3_tags      TEXT[],

  -- Images
  total_images INTEGER DEFAULT 0,
  images_missing_alt INTEGER DEFAULT 0,
  images_oversized INTEGER DEFAULT 0,

  -- Links
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,
  broken_links  INTEGER DEFAULT 0,
  broken_link_urls TEXT[],

  -- Performance signals
  has_viewport_meta BOOLEAN,
  has_https     BOOLEAN,
  has_sitemap   BOOLEAN,
  has_robots_txt BOOLEAN,
  has_structured_data BOOLEAN,
  has_og_tags   BOOLEAN,
  has_twitter_cards BOOLEAN,

  -- Content
  word_count    INTEGER DEFAULT 0,
  reading_time_mins SMALLINT,
  keyword_density JSONB,  -- { "keyword": count }

  -- Raw HTML size
  html_size_bytes INTEGER,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_page_data_audit_id ON audit_page_data(audit_id);

-- ============================================================
-- FUNCTION: update_updated_at
-- Auto-updates the updated_at column on row change
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: increment_domain_audit_count
-- Auto-increments domain audit count on new audit
-- ============================================================

CREATE OR REPLACE FUNCTION increment_domain_audit_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE domains
  SET audit_count = audit_count + 1,
      last_seen_at = NOW()
  WHERE id = NEW.domain_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_audit_increment_domain
  AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION increment_domain_audit_count();

-- ============================================================
-- FUNCTION: check_rate_limit
-- Returns true if the identifier has exceeded the limit
-- Usage: SELECT check_rate_limit('1.2.3.4', 'ip', 5, '1 hour')
-- ============================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR,
  p_type VARCHAR,
  p_max_requests INTEGER,
  p_window INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := date_trunc('hour', NOW());

  SELECT request_count INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND limit_type = p_type
    AND window_start = v_window_start;

  IF NOT FOUND THEN
    INSERT INTO rate_limits (identifier, limit_type, request_count, window_start)
    VALUES (p_identifier, p_type, 1, v_window_start)
    ON CONFLICT (identifier, window_start) DO UPDATE
      SET request_count = rate_limits.request_count + 1;
    RETURN FALSE; -- not rate limited
  END IF;

  IF v_count >= p_max_requests THEN
    RETURN TRUE; -- rate limited
  END IF;

  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE identifier = p_identifier
    AND limit_type = p_type
    AND window_start = v_window_start;

  RETURN FALSE; -- not rate limited
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VIEW: audit_summary
-- Convenient view for listing audits with domain info
-- ============================================================

CREATE VIEW audit_summary AS
SELECT
  a.id,
  a.url,
  d.domain,
  a.overall_score,
  a.grade,
  a.status,
  a.critical_count,
  a.warning_count,
  a.passed_count,
  a.total_checks,
  a.page_load_ms,
  a.ai_summary,
  a.created_at,
  a.completed_at
FROM audits a
JOIN domains d ON d.id = a.domain_id
WHERE a.status = 'completed'
ORDER BY a.created_at DESC;

-- ============================================================
-- VIEW: top_issues
-- Most common SEO issues across all audits (analytics)
-- ============================================================

CREATE VIEW top_issues AS
SELECT
  check_key,
  name,
  category,
  severity,
  COUNT(*) AS occurrence_count,
  ROUND(AVG(score_impact), 2) AS avg_score_impact
FROM audit_issues
GROUP BY check_key, name, category, severity
ORDER BY occurrence_count DESC;

-- ============================================================
-- SEED: Check keys reference table (optional)
-- Documents all possible check_key values used by the crawler
-- ============================================================

CREATE TABLE seo_checks_registry (
  check_key    VARCHAR(100) PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  category     issue_category NOT NULL,
  description  TEXT,
  max_impact   SMALLINT DEFAULT 5
);

INSERT INTO seo_checks_registry (check_key, name, category, max_impact) VALUES
  ('missing_title',              'Missing page title',                'meta',            10),
  ('title_too_long',             'Title tag too long',                'meta',            5),
  ('title_too_short',            'Title tag too short',               'meta',            4),
  ('missing_meta_description',   'Missing meta description',          'meta',            8),
  ('meta_description_too_long',  'Meta description too long',         'meta',            4),
  ('missing_h1',                 'Missing H1 heading',                'content',         9),
  ('multiple_h1',                'Multiple H1 tags',                  'content',         5),
  ('missing_alt_attributes',     'Images missing alt text',           'content',         7),
  ('thin_content',               'Thin content (under 300 words)',    'content',         6),
  ('missing_canonical',          'No canonical URL specified',        'technical',       6),
  ('missing_sitemap',            'XML sitemap not found',             'technical',       8),
  ('missing_robots_txt',         'robots.txt not found',              'technical',       7),
  ('no_https',                   'Site not using HTTPS',              'security',        10),
  ('mixed_content',              'Mixed HTTP/HTTPS content',          'security',        8),
  ('slow_page_load',             'Page load time too slow',           'performance',     9),
  ('large_images',               'Oversized images found',            'performance',     7),
  ('render_blocking_resources',  'Render-blocking CSS/JS',            'performance',     7),
  ('missing_viewport',           'Missing viewport meta tag',         'mobile',          9),
  ('small_tap_targets',          'Tap targets too small',             'mobile',          6),
  ('missing_og_tags',            'Open Graph tags missing',           'social',          5),
  ('missing_twitter_cards',      'Twitter Card tags missing',         'social',          4),
  ('broken_links',               'Broken internal links found',       'links',           8),
  ('missing_structured_data',    'No structured data / schema.org',   'structured_data', 6),
  ('no_favicon',                 'No favicon found',                  'technical',       3),
  ('www_redirect',               'www/non-www redirect issue',        'technical',       5);

-- ============================================================
-- GRANTS (adjust to your DB user)
-- ============================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO raseotech_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO raseotech_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO raseotech_app;
