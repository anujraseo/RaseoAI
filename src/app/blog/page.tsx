import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'

const POSTS = [
  { emoji: '🚀', category: 'SEO Guide', title: 'Why 90% of Websites Never Rank on Google — And How to Fix It', excerpt: 'Most websites fail to rank not because of bad content, but because of fixable technical issues. Here are the 7 most common SEO killers we see in our audits.', date: 'May 5, 2026', readTime: '8 min read', color: '#38bdf8' },
  { emoji: '⚡', category: 'Core Web Vitals', title: 'Google\'s Core Web Vitals: The Complete 2026 Guide', excerpt: 'LCP, FID, CLS — Google uses these three metrics as direct ranking signals. Learn what they mean, how to measure them, and exactly how to improve your scores.', date: 'Apr 28, 2026', readTime: '12 min read', color: '#818cf8' },
  { emoji: '🤖', category: 'AI & SEO', title: 'How AI is Changing SEO in 2026: What You Need to Know', excerpt: 'With Google\'s AI Overviews and generative search changing the SERP landscape, here\'s how to adapt your SEO strategy to stay visible.', date: 'Apr 20, 2026', readTime: '10 min read', color: '#c084fc' },
  { emoji: '📱', category: 'Mobile SEO', title: 'Mobile-First Indexing: Is Your Site Ready?', excerpt: 'Google now indexes the mobile version of your site first. If your mobile experience is lacking, you\'re losing rankings regardless of how good your desktop site is.', date: 'Apr 15, 2026', readTime: '6 min read', color: '#4ade80' },
  { emoji: '🔗', category: 'Link Building', title: 'The Only Link Building Strategy That Works in 2026', excerpt: 'Forget outdated tactics. Here\'s what actually moves the needle for backlinks in 2026 — and what Google\'s SpamBrain algorithm is penalizing.', date: 'Apr 8, 2026', readTime: '9 min read', color: '#fbbf24' },
  { emoji: '📊', category: 'Technical SEO', title: 'The Technical SEO Checklist: 50 Things to Fix Before Anything Else', excerpt: 'Before you write a single word of content or build a single backlink, these technical fundamentals must be in place. Run through this complete checklist.', date: 'Apr 1, 2026', readTime: '15 min read', color: '#f87171' },
]

const CATEGORIES = ['All', 'SEO Guide', 'Core Web Vitals', 'AI & SEO', 'Mobile SEO', 'Link Building', 'Technical SEO']

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050810', color: '#e8eaf0' }}>
      <Navbar active="/blog" />

      <div style={{ textAlign: 'center', padding: '80px 24px 48px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '0.5px solid rgba(56,189,248,0.25)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#38bdf8', marginBottom: 24 }}>
          SEO Insights · Updated Weekly
        </div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
          The RaseoAI Blog
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          Expert SEO guides, Google algorithm updates, and ranking strategies to help you grow organic traffic.
        </p>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px 40px' }}>
        {CATEGORIES.map((cat, i) => (
          <button key={cat} style={{ fontSize: 12, padding: '6px 16px', borderRadius: 20, border: i === 0 ? '0.5px solid rgba(56,189,248,0.4)' : '0.5px solid rgba(255,255,255,0.1)', background: i === 0 ? 'rgba(56,189,248,0.1)' : 'none', color: i === 0 ? '#38bdf8' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured post */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06))', border: '0.5px solid rgba(56,189,248,0.2)', borderRadius: 20, padding: '40px', marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ fontSize: 64, flexShrink: 0 }}>{POSTS[0].emoji}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Featured · {POSTS[0].category}</div>
            <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>{POSTS[0].title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>{POSTS[0].excerpt}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{POSTS[0].date}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{POSTS[0].readTime}</span>
              <button style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#38bdf8', background: 'none', border: '0.5px solid rgba(56,189,248,0.3)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                Read Article →
              </button>
            </div>
          </div>
        </div>

        {/* Post grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 60 }}>
          {POSTS.slice(1).map((post, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{post.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: post.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{post.category}</div>
              <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.4 }}>{post.title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 16 }}>{post.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '40px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Get Weekly SEO Insights</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Join 5,000+ marketers getting actionable SEO tips every week.</p>
          <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto' }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 13, fontFamily: 'var(--font-dm)', outline: 'none' }} />
            <button style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font-syne)', fontSize: 13, fontWeight: 700, padding: '11px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
