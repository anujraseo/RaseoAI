import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'

const STEPS = [
  { num: '01', icon: '🔗', title: 'Enter Your Website URL', desc: 'Paste any website URL into our analyzer. We support all websites — from small blogs to large e-commerce stores. No login or signup required.', detail: 'Our system validates your URL, normalizes it, and prepares for a full crawl. We handle redirects, www vs non-www, and HTTP/HTTPS automatically.' },
  { num: '02', icon: '🤖', title: 'AI Crawls Your Website', desc: 'Our intelligent crawler visits your page just like Googlebot would. It loads the full HTML, executes JavaScript, and captures all SEO signals in real time.', detail: 'We check 120+ data points including page speed, meta tags, images, links, structured data, and mobile compatibility — all in one pass.' },
  { num: '03', icon: '📊', title: 'Deep SEO Analysis Runs', desc: 'Every data point is run through our SEO rules engine, which scores each element against Google\'s latest guidelines and ranking factor documentation.', detail: 'Issues are classified as Critical, Warning, or Passed and weighted by their actual impact on rankings — not just flagged arbitrarily.' },
  { num: '04', icon: '✨', title: 'Claude AI Writes Your Report', desc: 'Claude AI reads all your data and writes a personalized audit report with plain-English explanations, priority fixes, and a growth roadmap.', detail: 'The AI sections include Overall Assessment, What\'s Hurting Rankings, Quick Wins, and Growth Potential — tailored to your specific site.' },
  { num: '05', icon: '📋', title: 'Get Your Full Report', desc: 'Your complete SEO audit appears in seconds — with an overall score, category breakdowns, and expandable issue cards with step-by-step fix guides.', detail: 'Download your report as a professional PDF to share with your team, developer, or agency. Each issue includes exactly how to fix it.' },
]

const FAQS = [
  { q: 'Is RaseoAI really free?', a: 'Yes, completely free. We offer unlimited audits with no credit card required. We make money by offering done-for-you SEO services to businesses that want expert help.' },
  { q: 'How accurate are the results?', a: 'Very accurate. We crawl your site the same way Googlebot does, checking real page data. Our checks are based on Google\'s published ranking factor documentation and best practices.' },
  { q: 'How long does an audit take?', a: 'Most audits complete in 15–30 seconds. Complex sites with many resources may take up to 60 seconds. We crawl in real time, not from a cached database.' },
  { q: 'Will it slow down my website?', a: 'No. Our crawler makes a single request to your page, just like any normal visitor. It has no impact on your site\'s performance or uptime.' },
  { q: 'How often should I run an audit?', a: 'We recommend running an audit after any major site changes, monthly for ongoing monitoring, and whenever you notice a drop in rankings or traffic.' },
  { q: 'Do you store my website data?', a: 'We store audit results in our database so you can reference past reports. We do not sell or share your data with third parties.' },
]

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#e8eaf0' }}>
      <Navbar active="/how-it-works" />

      <div style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '0.5px solid rgba(56,189,248,0.25)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#38bdf8', marginBottom: 24 }}>
          Simple · Fast · Accurate
        </div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
          How RaseoAI Works
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          From URL to full AI audit report in under 30 seconds. Here's exactly what happens behind the scenes.
        </p>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 28, marginBottom: 48, position: 'relative' }}>
            {i < STEPS.length - 1 && (
              <div style={{ position: 'absolute', left: 28, top: 64, bottom: -24, width: 1, background: 'linear-gradient(180deg, rgba(56,189,248,0.3), transparent)' }} />
            )}
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))', border: '0.5px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {step.icon}
              </div>
            </div>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', marginBottom: 6 }}>STEP {step.num}</div>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 10 }}>{step.desc}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeft: '2px solid rgba(56,189,248,0.2)' }}>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 32, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 40 }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px' }}>
              <h4 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{faq.q}</h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px 80px' }}>
        <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 12, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, padding: '14px 32px', textDecoration: 'none' }}>
          Try It Free Now →
        </Link>
      </div>
    </div>
  )
}
