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
| **Content** | Plain TypeScript content files in `src/content/` — no CMS required, CMS-ready structure |
| **Forms** | Contact, multi-step Registration and Newsletter — API routes with honeypot spam protection, email delivery via [Resend](https://resend.com) (optional) |
| **SEO** | Metadata API, Open Graph image (auto-generated), `sitemap.xml`, `robots.txt`, JSON-LD (Organisation + FAQ), PWA manifest |
| **Performance** | Static generation for all marketing pages, `next/image` with AVIF/WebP, font subsetting, zero external CSS/JS |
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
cp .env.example .env.local   # optional – add RESEND_API_KEY to receive form emails
npm run dev                  # http://localhost:3000
```

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

```
data/store.json     content + form submissions + admin password hash
data/uploads/       images uploaded from the dashboard
```

Both are **git-ignored**, so nothing sensitive ever reaches GitHub. They sit
outside the build output on the server, which means **redeploying does not erase
your content or submissions**.

- **Backup:** Admin → Settings → *Download everything (JSON)* — that one file is a complete restore point.
- **Custom location:** set `DATA_DIR` (useful for a persistent volume on a VPS).
- **Lost password:** delete the `admin` block from `data/store.json` on the server (or set `ADMIN_PASSWORD`), then sign in with that value.

### Email replies

Replies and submission notifications use [Resend](https://resend.com). Add
`RESEND_API_KEY` in the environment and they are delivered for real; without a
key they are still saved in the dashboard and written to the server log, so
nothing is ever lost.

## 📬 Form submissions

Forms POST to `/api/contact`, `/api/register` and `/api/newsletter`.

1. Create a free account at [resend.com](https://resend.com) → API Keys → copy.
2. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env.local` (or in your hosting dashboard).
3. Optionally verify `afristemglobal.org` in Resend and set `MAIL_FROM="AFRISTEM <no-reply@afristemglobal.org>"`.

Without a key, submissions are logged to the server console (handy for local testing) and the UI still shows the success state.

## ☁️ Deploying on Hostinger (Node.js Web App via GitHub)

Requires a **Business** or **Cloud** hosting plan (Node.js web apps are not available on Premium/Single plans).

1. In **hPanel → Websites → Add Website → Deploy Web App**.
2. Choose **Import Git Repository** → **Authorize** the Hostinger GitHub app → select `afristem-global-website`.
3. Hostinger auto-detects **Next.js**. Confirm the settings:

   | Setting | Value |
   |---|---|
   | Framework | Next.js |
   | Node.js version | **20** (or 22) |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Start command | `npm run start` *(already binds to Hostinger's `$PORT`)* |
   | Branch | `main` |

4. **Environment variables** (Dashboard → Environment Variables) — optional but recommended:

   ```
   NEXT_PUBLIC_SITE_URL=https://afristemglobal.org
   RESEND_API_KEY=re_xxxxxxxxx          # from https://resend.com – enables form emails
   CONTACT_TO_EMAIL=contact@afristemglobal.com
   MAIL_FROM=AFRISTEM Website <no-reply@afristemglobal.org>
   ```
5. Click **Deploy**. First build takes ~2–4 minutes. Every push to `main` redeploys automatically.

> ⚠️ **Domain already used by the WordPress site?** Hostinger requires the domain to be free before a Node.js app can be attached to it. Recommended path:
> 1. Deploy first on a **temporary/sub-domain** (e.g. `new.afristemglobal.org`) and review it.
> 2. Take a final backup of the WordPress site (you already have the WPvivid backup).
> 3. **Remove** the WordPress website from the plan, then add the Node.js app on `afristemglobal.org` (or change the app's domain in its settings).

**Troubleshooting:** build logs are under *Dashboard → Deployments*. If you see a 403 after a redeploy, redeploy once more so Hostinger regenerates `public_html/.htaccess`. A "Restart" button is available under *Running* for server-side apps.

Also deploys unchanged to Vercel, Netlify, Railway, Render or any Node 20+ host (`npm run build && npm start`).

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

- App Router + server components → add `/dashboard`, auth (e.g. NextAuth/Clerk) and a database (e.g. Supabase/Prisma) without restructuring.
- Content layer is isolated in `src/content/` → swap to a headless CMS (Sanity, Payload, Strapi) by replacing the imports.
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

## November 2026 event update

Two dedicated, admin-backed edition pages:

- `/events/stem-kids-championship-2026`
- `/events/african-organic-chemistry-tournament-2026`

**Admin → Events** controls dates, eligibility, fees, instructions, payment copy,
contact details, flyers, handbook/memorandum PDF uploads, registration status and
verified results. **Submissions → Registrations** holds adult contact information,
candidate lists, school, exam mode/location, AOCT preferred sitting, references,
status, internal notes and email replies. CSV/JSON exports include these fields.
Search the event slug/title to find its entries. News announcements are editable
under **News**, including their linked event slug; the top bar is under **Announcement**.

### Closing and publishing results

- `pending`: the form is disabled while arrangements are being confirmed.
- `open`: requires a closing date in deadline mode; manual mode needs no date. **Date-only deadlines include the full selected
  day in Africa/Lagos (WAT, UTC+1)**. SKC is set to close at midnight following
  **12 November 2026** (`2026-11-12T23:00:00Z`). This end-of-day convention is an
  implementation assumption because the documents give a date, not a cutoff time.
- `closed`: immediately rejects new submissions on the server and displays
  **Registration closed — awaiting results**. An elapsed deadline also closes the
  form even if the stored admin status still says `open`. A deadline countdown
  checks every second; already-open pages refresh manual admin changes every 15
  seconds and on browser focus. The server checks again at submission time.
- `results`: publish a verified results PDF/HTTPS link and/or an announcement.
  Registration stays disabled. The permanent event URL and documents remain usable.
- To reopen, choose `open` and either manual closure or a future closing date.

**AOCT is open with manual closure**, as requested by the organiser. It has no
automatic registration cutoff. In **Admin → Events → AOCT**, set status to `closed`
and save to stop submissions and show “Awaiting results”. Manual mode ignores any
stored deadline; switch closure mode to `deadline` to enable scheduled closing.
The examination-date countdown remains separate from registration closure.
The form requests a preferred date within the editable examination window, plus
preferred time and time zone; these are requests, not guaranteed bookings.

Seed version 6 opens the previously shipped pending AOCT record with no deadline,
including on existing installations. Explicit admin closures, published results,
and configured dated schedules are preserved.

A form submission is a **registration request**, not verified payment or confirmed
admission. Organisers still verify payment evidence sent via their official
email/WhatsApp channel and issue candidate codes. Minors' entries are submitted
by an authorised adult. No card details or payment receipts are collected here.
Notifications depend on the deployment's existing Resend configuration; submissions
are stored in the dashboard even if email delivery fails.

### Imported assets and existing deployments

All four original PDFs from `AFRISTEM Website Update` are stored in
`public/documents/events`. The original flyers embedded on page 2 of the handbooks
were extracted, not regenerated, into `public/images/events`; handbook covers are
rendered from page 1. `src/content/event-updates.ts` supplies initial event content.
The seed-version-5 migration inserts both editions and announcements in existing
stores, retires the superseded combined listing, and corrects known old shipped
fee/format copy while retaining unrelated custom content and submissions.

Persistent storage is required: retain `DATA_DIR/store.json` and `DATA_DIR/uploads`
on a durable volume. A Git push does **not** itself migrate a running server; the
new code must be deployed, and the first content read performs the seed upgrade.
Do not use ephemeral filesystem hosting for real registration records.

The existing Plus Jakarta Sans and Sora fonts are now bundled locally (OFL licenses
in `src/app/fonts`) so production builds do not depend on Google Fonts connectivity.

### Regression checks

```bash
npm run lint
npm run typecheck
npm run build
# Node 22.6+ for native TypeScript stripping:
node --experimental-strip-types --test tests/events.test.mjs
```

`tests/events-integration.mjs` is for a **disposable local server only**, with an
isolated `DATA_DIR`, disabled outbound mail, and `TEST_ADMIN_PASSWORD` matching that
server's `ADMIN_PASSWORD`. It creates a synthetic registration and PDF, exercises
admin edits, restores event content, and must never target production data.

## Search visibility and content planning

See [the SEO implementation and deployment checklist](docs/seo/README.md) for
canonical URLs, structured data, sitemap/RSS, public source discovery, search-engine
verification and preview noindex configuration. The repository includes 10,000
generated query candidates in `docs/seo/keyword-research-10000.csv`, a topic-to-page
map and 10 reviewed-before-publishing social draft templates. These are planning
resources, not hidden keyword text or guarantees of search traffic.

### Automated website checks

GitHub Actions runs **Website checks** on the working branch, pull requests and
`main`. On Node 22.6+, run `npm run check` locally for the same deployment-config,
lint, keyword, production-build, SEO, registration, migration and preview-noindex
tests. `npm run test:site` reuses an existing production build and creates/removes
its own isolated local test servers and data; no real emails are sent.

These checks validate the code, not the live hosting deployment or search-engine
indexing. See `docs/seo/README.md` for the remaining account-owner steps.
