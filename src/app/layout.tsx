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
  title: 'RaSEOTech — Free AI SEO Audit Tool',
  description: 'Get a full AI-powered SEO audit for your website in seconds. 120+ checks, completely free. Identify what\'s stopping your site from ranking.',
  openGraph: {
    title: 'RaSEOTech — Free AI SEO Audit Tool',
    description: 'Get a full AI-powered SEO audit for your website in seconds. 120+ checks, completely free.',
    url: 'https://raseotech.com',
    siteName: 'RaSEOTech',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaSEOTech — Free AI SEO Audit Tool',
    description: 'Free AI SEO audit. 120+ checks in seconds.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
