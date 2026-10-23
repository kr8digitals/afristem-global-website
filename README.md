<p align="center">
  <img src="public/images/brand/logo.png" alt="AFRISTEM" width="180" />
</p>

<h1 align="center">AFRISTEM Global — Website</h1>

<p align="center">
  <strong>Inspiring the Next Generation of African Innovators.</strong><br/>
  A modern, fast, animated rebuild of <a href="https://afristemglobal.org">afristemglobal.org</a> — migrated from WordPress to Next.js.
</p>

---

## ✨ What's inside

| Area | Details |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS v4 with a custom AFRISTEM design-token system (navy `#0b2a6f` + sun-yellow `#ffc42d`) |
| **Motion** | Framer Motion — scroll reveals, staggered grids, animated counters, 3D-tilt cards, magnetic buttons, word-by-word hero headline, rotating text, marquee, lightbox |
| **Data** | [Supabase](https://supabase.com) Postgres: every page reads its content from the database and every form/admin change is written there (`src/lib/store.ts`). `src/content/` holds the shipped starting content and the copy that is not editable |
| **Forms** | Contact, multi-step Registration and Newsletter — saved to the database, honeypot + rate limiting, email notifications and registrant confirmations via [Resend](https://resend.com) |
| **SEO** | Metadata API, Open Graph image (auto-generated), `sitemap.xml`, `robots.txt`, JSON-LD (Organisation + FAQ), PWA manifest |
| **Performance** | One database round trip per page (memoised per request), `next/image` with AVIF/WebP, font subsetting, functions pinned to London (`lhr1`) next to the database |
| **Accessibility** | Skip link, focus rings, keyboard-navigable menus/lightbox, `prefers-reduced-motion` support, semantic HTML |

## 🗺️ Pages

```
/                         Home (hero, who we are, services, programmes, why AFRISTEM,
                          events, Prime STEM Nigeria, testimonials, partners, news, FAQ)
/about                    About: vision, mission, beliefs, approach timeline, who we serve
/programmes               Programme landing (4 flagship cards + Prime STEM programmes)
/programmes/[slug]        SciSPELL · Code Africa · STEM Kids Championship · Organic Chemistry Tournament
/prime-stem-nigeria       Partner page: ANSC + Laptop for Schools
/services                 6 services with anchor navigation
/schools /educators /stem-professionals   Audience pages
/partners                 Partner profiles + ways to partner
/events                   Upcoming events with live countdown + add-to-calendar
/news, /news/[slug]       Filterable, searchable blog + article pages with share buttons
/gallery                  Filterable masonry gallery + lightbox + video section
/contact                  Contact form, 3 offices, map, socials
/register                 4-step registration wizard (student / school / educator / professional / partner)
/faq                      FAQ with FAQPage schema
/privacy /terms /cookies  Legal
/admin                    Admin dashboard (password protected)
```

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # add SUPABASE_URL + SUPABASE_SECRET_KEY (and RESEND_API_KEY for emails)
npm run dev                  # http://localhost:3000
```

Without the Supabase variables the site still runs and shows the built-in content, but forms
and the admin cannot save anything.

Production:

```bash
npm run build
npm start
```

## 🔐 Admin dashboard

Everything the site displays — the announcement bar, homepage hero, programmes,
events, news, gallery, videos, FAQs, testimonials, partners, statistics, contact
details and social links — is editable from a built-in dashboard. All form
submissions land there as well.

| | |
|---|---|
| **URL** | `https://your-domain/admin` |
| **Password** | `Afr!@Ad?nàccess` — change it from **Settings** on first login |
| **Session** | signed, HttpOnly cookie · expires after 12 hours |

### What you can do

| Section | Purpose |
|---|---|
| **Overview** | New messages, new registrations, subscribers and the next events at a glance, plus quick actions |
| **Submissions** | Three inboxes — contact messages, registrations, newsletter. Search, status filters, CSV export, internal notes and a **reply-by-email** box that records every reply on the entry |
| **Announcement** | The strip at the top of every page: message, colour, link, and an optional auto-expiry date |
| **Homepage hero** | Headline, rotating words, sub-heading, both buttons and all three hero images |
| **Brand & contact** | Phone numbers, WhatsApp, email, offices, social links, external/sister sites |
| **Statistics** | The big impact numbers, written as plain text (e.g. `5,867+`) — numbers still animate |
| **Programmes · Events · News · Gallery · Videos · FAQs · Testimonials · Partners** | Full add / edit / reorder / delete, with image uploader and media library |
| **Settings** | Change the admin password, download a full JSON backup, export any submission list as CSV |

### Where the data lives

Everything is stored in the **Supabase** project `afristem-global` (organisation AFRISTEM):

| What | Where |
|---|---|
| Content, form submissions, admin password hash | 24 tables in the Postgres database (`public` schema) |
| Uploaded images | Supabase Storage bucket `media`, served by the site at `/api/media/<file>` |
| Database schema, seed, security and API | `docs/database/postgres/01…04-*.sql` (applied as Supabase migrations) |

The website talks to the database only through the SQL functions in
`docs/database/postgres/04-supabase-api.sql`, using the project's secret
(service_role) key on the server. Row Level Security is on for every table and the
public API keys can read or change nothing. Full details: `docs/database/README.md`.

- **Backup:** Supabase backs the database up daily. Admin → Settings → *Download everything (JSON)* gives you your own complete copy.
- **Lost password:** delete the single row in the `admin_account` table (Supabase → Table editor), then sign in with `ADMIN_PASSWORD` (or the shipped default) and set a new one.
- **Health check:** `GET /api/health` reports whether the database answers and whether email is configured (no data, no secrets).

### Email replies

Replies, submission notifications and registration confirmations use
[Resend](https://resend.com). Add `RESEND_API_KEY` in the environment and they are
delivered for real. Without a key every submission is still saved in the dashboard,
but no email is sent — the dashboard says so, and a reply that could not be
delivered is recorded as "not sent" rather than "sent".

## 📬 Form submissions

Forms POST to `/api/contact`, `/api/register` and `/api/newsletter`.

1. Create a free account at [resend.com](https://resend.com) → API Keys → copy.
2. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env.local` (or in your hosting dashboard).
3. Optionally verify `afristemglobal.org` in Resend and set `MAIL_FROM="AFRISTEM <no-reply@afristemglobal.org>"`.

Without a key, submissions are still saved to the database (and shown in the admin); emails are only written to the server log.

## ☁️ Deploying (Vercel + Supabase)

The site runs on **Vercel** (project `afristem-global-website`, production branch `main`)
with its data in **Supabase** (project `afristem-global`, region eu-west-2 London).
`vercel.json` pins the server functions to `lhr1` (London) so they sit next to the database.

**Environment variables** (Vercel → Project → Settings → Environment Variables):

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) | yes | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | yes | Supabase **secret / service_role** key — server only, mark it *Sensitive* |
| `ADMIN_SECRET` | yes | 16+ random characters that sign admin sessions |
| `ADMIN_PASSWORD` | no | Password accepted before the first sign-in stores one (defaults to the shipped password) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `MAIL_FROM` | recommended | Email notifications, confirmations and replies |
| `NEWSLETTER_WEBHOOK_URL` | no | Also forward newsletter sign-ups to another service |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical address for metadata and the sitemap (default `https://afristemglobal.org`) |

**Database changes** are SQL migrations: the four scripts in `docs/database/postgres/`
(schema, seed, Supabase security, website API) are what the live project was built from.
Change the scripts and apply the same SQL in Supabase (SQL editor or a migration).

Because the content lives in the database, **redeploying never touches content or
submissions**. The site also runs on any Node 20+ host (`npm run build && npm start`)
with the same environment variables.

## 🔄 Pushing updates

This repo uses a **GitHub deploy key** (repo-scoped, write access, no expiry),
stored outside version control at `~/.ssh/afristem_deploy`.

```bash
./scripts/push.sh            # commit first, then push the current branch to origin
```

The script recreates the `origin` remote if it is missing and never writes
credentials into `.git/config`. A personal access token also works — put it in
`.github-token` (git-ignored) and the script will use it instead.

## 🧭 Roadmap-ready

The client brief asks for future support for student/teacher accounts, online exams, certificates, LMS, e-commerce and memberships. This codebase is set up for that:

- App Router + server components + Supabase → add `/dashboard` and accounts (Supabase Auth) without restructuring.
- Every database call goes through `src/lib/store.ts` and the SQL functions in `docs/database/postgres/04-supabase-api.sql`.
- API routes already exist for forms → extend for payments (Paystack/Flutterwave) and registrations.

## 🎨 Brand tokens

```
Navy   50 → 950   #eef3ff … #04122f   (primary: navy-800 #0b2a6f)
Sun    50 → 700   #fff9e6 … #b06d00   (primary: sun-400 #ffc42d)
Accents: coral #ff6b5b · mint #2dd4bf · violet #a78bfa · sky #38bdf8
Fonts: Sora (display) · Plus Jakarta Sans (body)
```

---

© AFRISTEM GLOBAL (RC 9452641). All rights reserved.
