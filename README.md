# RaSEOTech — AI SEO Audit Tool

Free, AI-powered SEO audit tool. Users enter a URL, solve a captcha, and receive a full SEO audit report in 30 seconds.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Crawler**: Puppeteer + Cheerio
- **Database**: PostgreSQL (Supabase recommended)
- **AI Summary**: Claude API (Anthropic)
- **Captcha**: Google reCAPTCHA v3
- **Deployment**: Vercel (frontend) + Railway/Render (crawler)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main page (state machine: idle → loading → result)
│   ├── layout.tsx                  # Root layout + fonts + metadata
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── audit/route.ts          # POST /api/audit — submit URL
│       └── results/[id]/route.ts   # GET /api/results/:id — poll status + results
├── components/
│   └── audit/
│       ├── HeroSection.tsx         # URL input + captcha form
│       ├── HeroSection.module.css
│       ├── LoadingSection.tsx      # Animated progress steps
│       └── ReportSection.tsx       # Full audit report display
├── lib/
│   ├── db.ts                       # PostgreSQL pool + query helpers
│   ├── crawler.ts                  # Puppeteer page crawler
│   ├── seoChecks.ts                # 25+ SEO checks + scoring
│   └── auditService.ts             # Orchestrates crawl → checks → DB → AI summary
└── types/
    └── index.ts                    # All TypeScript types
schema.sql                          # Full PostgreSQL schema
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/raseotech.git
cd raseotech
npm install
```

### 2. Set Up Database

Create a PostgreSQL database (Supabase free tier recommended):

```bash
# Using Supabase CLI or their dashboard SQL editor
psql -U postgres -d raseotech -f schema.sql
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
ANTHROPIC_API_KEY=...
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to SQL Editor → paste contents of `schema.sql` → Run
3. Copy your connection string from Settings → Database → Connection String
4. Paste into `DATABASE_URL` in `.env.local`

---

## reCAPTCHA Setup

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register new site → reCAPTCHA v3
3. Add your domain (and `localhost` for development)
4. Copy Site Key → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
5. Copy Secret Key → `RECAPTCHA_SECRET_KEY`

### Add reCAPTCHA to the form (production)

In `HeroSection.tsx`, replace the `mock_token` line:

```tsx
// Add to layout.tsx <head>:
// <Script src="https://www.google.com/recaptcha/api.js?render=SITE_KEY" />

// In HeroSection.tsx handleSubmit():
const token = await new Promise<string>((resolve) => {
  window.grecaptcha.ready(() => {
    window.grecaptcha
      .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!, { action: 'audit' })
      .then(resolve)
  })
})
onSubmit(normalizedUrl, token)
```

---

## Deployment

### Option A: Vercel (recommended for frontend + API)

> ⚠️ Puppeteer does NOT work on Vercel serverless. See Option B for the crawler.

```bash
npx vercel --prod
```

Add all environment variables in Vercel dashboard.

### Option B: Separate Crawler Service (Railway/Render)

For production, extract the crawler into a separate Express microservice:

```
POST /crawl { url, auditId }
→ Runs Puppeteer
→ Updates DB directly
→ Returns { success: true }
```

Then in `auditService.ts`, replace the direct `runAudit()` call with:

```typescript
await fetch(`${process.env.CRAWLER_SERVICE_URL}/crawl`, {
  method: 'POST',
  body: JSON.stringify({ url: audit.url, auditId: audit.id })
})
```

### Option C: Queue-based (BullMQ + Redis) — recommended for scale

```bash
npm install bullmq ioredis
```

Use BullMQ to queue audit jobs. Workers run Puppeteer on a dedicated server.

---

## Adding More SEO Checks

All checks are in `src/lib/seoChecks.ts`. Each check function returns a `CheckResult[]`.

To add a new check:

```typescript
// In the appropriate run*Checks() function:
if (!data.someCondition) {
  results.push({
    check_key: 'my_new_check',
    name: 'Descriptive check name',
    category: 'technical',        // see IssueCategory type
    severity: 'warning',          // critical | warning | info | pass
    description: 'What this means for the user.',
    fix_text: 'How to fix it.',
    score_impact: 5,              // 0–10
  })
} else {
  results.push(pass('my_new_check_ok', 'Check passed', 'technical'))
}
```

Also add it to `seo_checks_registry` in `schema.sql`.

---

## Rate Limiting

Default limits (configurable via env):
- 5 audits per IP per hour
- 3 audits per domain per hour

Limits are enforced server-side via PostgreSQL `check_rate_limit()` function.

---

## License

MIT — free to use and modify.
Built for **raseotech.com**
# RaseoAI
