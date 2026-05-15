import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'AI SEO Audit — Free AI-Powered SEO Audit Tool',
  description: 'Get a full AI-powered SEO audit for your website in seconds. 120+ checks, completely free.',
  metadataBase: new URL('https://ai-seoaudit.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'AI SEO Audit — Free AI-Powered SEO Audit Tool',
    description: 'Get a full AI-powered SEO audit in seconds. 120+ checks, completely free.',
    url: 'https://ai-seoaudit.com',
    siteName: 'AI SEO Audit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI SEO Audit — Free AI-Powered SEO Audit Tool',
    description: 'Free AI SEO audit. 120+ checks in seconds.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>{children}</body>
    </html>
  )
}
