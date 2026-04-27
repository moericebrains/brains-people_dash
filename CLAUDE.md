# Brains People Dashboard

Internal culture + people intelligence dashboard for Brains agency.

## Stack
- Next.js 15 (App Router), TypeScript strict, Tailwind (installed but components use inline styles — intentional)
- No database — reads from Rippling (pulse + ONA surveys), Harvest (time tracking), Google Sheets (people directory)
- AI coaching narratives via Anthropic API (proxied through /api/coaching — never call Anthropic from the browser)

## Env vars
See `.env.local`. All API calls are server-side in `src/app/api/`. Fill keys as you get them — routes fall back to mock data when keys are absent.

## Logo
Drop `Brains_PrimaryLogo_Black__6_.png` into `/public/brains-logo.png`. The header will use it automatically.

## Key rules
- All `@keyframes` go in `globals.css`, never inline in JSX (Next.js build breaks on inline keyframes)
- Inline styles throughout — keep it. The prototype was built this way intentionally for portability
- Anthropic calls: always go through `/api/coaching`, never call `api.anthropic.com` from client components
- PIN auth is 3-tier: NEXT_PUBLIC_LEADERSHIP_PIN / NEXT_PUBLIC_COACH_PIN / NEXT_PUBLIC_IC_PIN

## Tabs
pulse | satisfaction | stress | actions | teamdna | directory

## Auth tiers
- ic: everyone, no PIN
- coach: sees individual pulse + stress signals for their people
- leadership: sees everything

## API stubs
All API routes return mock data when env keys are missing. Wire live data by filling the env vars.

## Repo
brainsagency/brains-peopledash → people.brains.co (Vercel)
