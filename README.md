# EX-it. — Breakup Recovery Sanctuary

EX-it. is a private, AI-powered breakup recovery platform that helps you enforce **No-Contact**, process unsaid emotions, log red flags, and rebuild your self-esteem day by day.

## Features

- **No-Contact Streak & Urges** — track streak days with a visual punch card and Daily Mission check-ins
- **Red Flag Vault** — log unedited reasons why it ended to counter nostalgia relapses
- **AI Persona / Closure Engine** — simulate unsent closure conversations without breaking No-Contact
- **24/7 AI Healing Coach** — empathetic companion that remembers your story
- **Glow-Up Milestones & Timeline** — recovery badges, mood trends, and milestone days
- **Strict privacy** — journal entries, red flags, and AI conversations are encrypted

## Pricing

- **Monthly Freedom** — $10/mo (no trial)
- **Annual Sanctuary Pass** — $39/yr ($3.25/mo) with a **3-Day Free Trial**

Cancel anytime with 1 click.

## Tech Stack

- **Next.js (App Router)** + TypeScript + React
- **Supabase** (auth, database, migrations)
- **Oxlint** for linting

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your Supabase + provider keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database setup

Run these in the Supabase SQL editor, in order:

1. `supabase_migration.sql`
2. `supabase_payments_migration.sql`
3. `supabase_mood_logs_migration.sql`
4. `supabase_missing_tables_migration.sql`

The last file adds `user_avatars`, `push_subscriptions`, `vault_entries`, and
`user_profiles.last_active_at`, which are required by the app.

## Environment notes

- `SUPABASE_SERVICE_ROLE_KEY` is required for the Dodo webhook, cron jobs, and
  admin push broadcasts. Never expose it to the browser.
- `CRON_SECRET` must match the secret configured for the Vercel cron jobs.
- `DODO_PRODUCT_LIFETIME` is optional. Set it only if you sell a one-time
  lifetime plan; without it, no payment grants permanent Pro access.
- `NEXT_PUBLIC_AUTH_BYPASS=true` skips auth and Pro checks for local development.
  Never set it in production.

## Deployment

Live at [ex-it-black.vercel.app](https://ex-it-black.vercel.app) (Vercel).

## License

Private / proprietary. All rights reserved.
