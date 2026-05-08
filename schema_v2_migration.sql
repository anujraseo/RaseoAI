-- ============================================================
-- Migration: Add email_reports table + dashboard settings
-- Run after initial schema.sql
-- ============================================================

-- ============================================================
-- TABLE: email_reports
-- Tracks every time a report was emailed out
-- ============================================================

CREATE TABLE IF NOT EXISTS email_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id     UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  email        VARCHAR(255) NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       VARCHAR(20) NOT NULL DEFAULT 'sent',  -- sent | failed
  error        TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_reports_audit_id ON email_reports(audit_id);
CREATE INDEX IF NOT EXISTS idx_email_reports_email ON email_reports(email);
CREATE INDEX IF NOT EXISTS idx_email_reports_sent_at ON email_reports(sent_at DESC);

-- ============================================================
-- TABLE: settings
-- Key-value store for admin configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key          VARCHAR(100) PRIMARY KEY,
  value        TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('dashboard_title', 'RaSEOTech Admin Dashboard'),
  ('max_audits_per_ip_per_hour', '5'),
  ('max_audits_per_domain_per_hour', '3'),
  ('email_reports_enabled', 'true'),
  ('pdf_export_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- VIEW: email_report_stats
-- ============================================================

CREATE OR REPLACE VIEW email_report_stats AS
SELECT
  DATE(sent_at) AS date,
  COUNT(*) AS total_sent,
  COUNT(DISTINCT email) AS unique_emails,
  COUNT(DISTINCT audit_id) AS reports_emailed
FROM email_reports
WHERE status = 'sent'
GROUP BY 1
ORDER BY 1 DESC;

-- ============================================================
-- UPDATE: dashboard API stat query adds email count
-- ============================================================

-- Optional: add email_count to audit_summary view
CREATE OR REPLACE VIEW audit_summary AS
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
  a.completed_at,
  COUNT(er.id) AS email_send_count
FROM audits a
JOIN domains d ON d.id = a.domain_id
LEFT JOIN email_reports er ON er.audit_id = a.id AND er.status = 'sent'
WHERE a.status = 'completed'
GROUP BY a.id, d.domain
ORDER BY a.created_at DESC;
