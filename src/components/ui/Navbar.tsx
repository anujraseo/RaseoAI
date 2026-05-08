import Link from 'next/link'

export default function Navbar({ active }: { active?: string }) {
  const links = [
    { href: '/features', label: 'Features' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(16px)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(56,189,248,0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M9 6L12 7.5V10.5L9 12L6 10.5V7.5L9 6Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>
          Raseo<span style={{ color: '#38bdf8', fontStyle: 'italic' }}>AI</span>
        </span>
      </Link>
      <div style={{ display: 'flex', gap: 28 }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{ fontSize: 13, color: active === l.href ? '#38bdf8' : 'rgba(255,255,255,0.5)', textDecoration: 'none', borderBottom: active === l.href ? '1px solid #38bdf8' : '1px solid transparent', paddingBottom: 2 }}>
            {l.label}
          </Link>
        ))}
      </div>
      <Link href="/" style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 20, color: '#fff', textDecoration: 'none' }}>
        Free Audit →
      </Link>
    </nav>
  )
}
