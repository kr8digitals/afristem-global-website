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

## ✏️ Editing content (no code knowledge needed)

Everything a content editor needs lives in **`src/content/`**:

| File | What it controls |
|---|---|
| `site.ts` | Name, phone numbers, WhatsApp, email, offices, social links, navigation, footer links, impact stats |
| `programmes.ts` | The 4 flagship programmes (text, objectives, images, eligibility) + Prime STEM Nigeria programmes |
| `data.ts` | Services, "Why AFRISTEM", approach, beliefs, **events**, **news posts**, partners, FAQs, **gallery**, videos, testimonials, audience pages |

Images live in `public/images/` (`brand/`, `partners/`, `photos/`). Drop a new photo in `photos/` and reference it from the content file.

> **Adding an event:** open `src/content/data.ts`, copy an object inside the `events` array, change the fields, save. Past events automatically move to the "Recent highlights" section.

> **Adding a news post:** copy an object inside the `posts` array. The page at `/news/<slug>` is generated automatically.

> **Adding a YouTube video:** in `videos`, paste the video ID (the part after `v=`) into `youtubeId`.

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
