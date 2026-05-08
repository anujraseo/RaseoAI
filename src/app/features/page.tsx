import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'

const FEATURES = [
  { icon: '🔍', title: 'On-Page SEO Analysis', desc: 'Deep scan of title tags, meta descriptions, heading structure, keyword density, and content quality. Get specific fix recommendations for every issue.', checks: ['Title tag length & keywords', 'Meta description optimization', 'H1/H2/H3 hierarchy', 'Keyword density analysis', 'Content length & readability'] },
  { icon: '⚡', title: 'Core Web Vitals', desc: 'Google uses Core Web Vitals as direct ranking signals. We measure LCP, FID, and CLS to ensure your site meets Google\'s performance thresholds.', checks: ['Largest Contentful Paint (LCP)', 'First Input Delay (FID)', 'Cumulative Layout Shift (CLS)', 'Page load speed', 'Time to First Byte (TTFB)'] },
  { icon: '🔒', title: 'Security & HTTPS', desc: 'HTTPS is a confirmed Google ranking factor. We verify your SSL certificate, check for mixed content issues, and validate security headers.', checks: ['SSL certificate validity', 'HTTPS enforcement', 'Mixed content detection', 'Security headers check', 'Certificate expiry warning'] },
  { icon: '📱', title: 'Mobile-Friendliness', desc: 'Google indexes mobile-first. We test your site against Google\'s mobile usability guidelines to ensure you\'re not losing mobile rankings.', checks: ['Viewport meta tag', 'Tap target sizes', 'Font size readability', 'Content width fitting', 'Mobile page speed'] },
  { icon: '🗺️', title: 'Technical SEO', desc: 'Deep technical checks that most tools miss. From sitemap validation to robots.txt analysis, canonical tags, and crawlability issues.', checks: ['XML sitemap validation', 'Robots.txt analysis', 'Canonical URL tags', 'Redirect chains', '404 error detection'] },
  { icon: '🤖', title: 'AI-Powered Analysis', desc: 'Powered by Claude AI, get intelligent summaries that explain your SEO issues in plain English with prioritized action plans.', checks: ['Plain English explanations', 'Priority fix recommendations', '4-section expert report', 'Growth potential analysis', 'Competitor benchmarking insights'] },
  { icon: '🔗', title: 'Link Analysis', desc: 'Broken links hurt both UX and SEO. We scan all internal and external links to find 404s, redirect chains, and link equity issues.', checks: ['Internal link structure', 'External link audit', 'Broken link detection', 'Anchor text analysis', 'Link equity flow'] },
  { icon: '📊', title: 'Structured Data', desc: 'Schema markup helps Google understand your content and can unlock rich results in SERPs. We check all JSON-LD and microdata implementations.', checks: ['JSON-LD schema detection', 'Schema type validation', 'Rich result eligibility', 'Open Graph tags', 'Twitter Card tags'] },
]

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#e8eaf0' }}>
      <Navbar active="/features" />

      <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '0.5px solid rgba(56,189,248,0.25)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#38bdf8', marginBottom: 24 }}>
          120+ SEO Checks · Completely Free
        </div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
          Everything You Need to<br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Dominate Google Rankings
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
          RaseoAI runs 120+ checks across every SEO category and tells you exactly what to fix.
        </p>
        <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 12, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, padding: '14px 28px', textDecoration: 'none' }}>
          Start Free Audit →
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px' }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 18 }}>{f.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {f.checks.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>{c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.08))', border: '0.5px solid rgba(56,189,248,0.15)', borderRadius: 20, maxWidth: 600, margin: '0 auto 80px', padding: '48px 32px' }}>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to fix your SEO?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Run a free audit in 30 seconds. No signup required.</p>
        <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 12, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, padding: '14px 32px', textDecoration: 'none' }}>
          Analyze My Website Free →
        </Link>
      </div>
    </div>
  )
}
