# AFRISTEM SEO & Discoverability — Strategy & Assets

This directory documents the technical-SEO implementation for **afristemglobal.org**
and stores the keyword research that drives it.

## What was implemented

### 1. Structured data (schema.org JSON-LD) — `src/lib/seo.ts`

| Entity | Where | Purpose |
|---|---|---|
| `EducationalOrganization` + `NGO` graph (name, legal name, RC number, logo, contact points, offices, `areaServed`, `sameAs`, `knowsAbout`, `subOrganization`) | root layout, every page | Resolves the brand entity for Google, Bing and AI engines; supports knowledge panels |
| `founder` → `Person` node | root layout | Emitted automatically once `site.founder.name` is set in `src/content/site.ts` |
| `WebSite` + homepage `WebPage` | root layout | Site-level entity for sitelinks / AI citations |
| `EducationalOccupationalProgram` | `/programmes` + each programme page | Exact entity for SciSPELL, Code Africa, STEM Kids Championship, AOCT |
| `Event` (+ `ItemList`) | `/events`, programme pages | Rich results for competitions, boot camps, hangouts |
| `Course` (+ `ItemList`) | `/digital-science-school` | Online-school tracks (Primary, JSS, SSS, WAEC/NECO/JAMB) |
| `Service` | `/services` | B2B service discovery |
| `Article` | `/news/[slug]` | Article rich results |
| `Blog` | `/news` | Blog roll entity |
| `FAQPage` | home, FAQ, contact, register, services, schools, educators, professionals, partners, prime-stem, digital school, stem guide + programme pages | Conversational-AI answer snippets |
| `BreadcrumbList` | all main pages | Navigation rich results |
| `ImageGallery` | `/gallery` | Image discoverability |
| `Place` / `PostalAddress` (3 offices) | `/contact` | Local presence |
| `RegisterAction` | `/register` | Action eligibility |

### 2. Dynamic metadata — `src/content/seo.ts` + `src/lib/seo.ts`

Every public route gets a **unique, keyword-optimised** `<title>`, meta
description, canonical URL, Open Graph tags, Twitter Card tags and a curated
keyword cluster (10–25 terms) through `buildMetadata()`.

### 3. Crawlability

- `src/app/robots.ts` — allows all crawlers; explicit allow-groups for
  GPTBot / OAI-SearchBot / ChatGPT-User, Google-Extended, PerplexityBot,
  ClaudeBot family, Applebot-Extended, Meta-ExternalAgent, Bingbot,
  DuckDuckBot and more. Disallows only `/api/` and `/admin`.
- `src/app/sitemap.ts` — all public URLs with tuned priorities/change
  frequencies, always in sync with the route tree.
- `src/app/llms.txt/route.ts` — machine-readable site summary for LLM
  crawlers (llmstxt.org), with citation guidance.
- Admin is `noindex`; legal pages have low sitemap priority.

### 4. Natural-language FAQs

Visible FAQ sections with matching `FAQPage` JSON-LD were added to the home,
programmes (index + all four detail pages), digital science school, services,
schools, educators, STEM professionals, partners, prime-stem-nigeria,
register, contact and STEM-guide pages. Each FAQ answer is written as a
complete, quotable sentence so AI engines can cite it verbatim.

## The 20,000-keyword matrix

`keyword-matrix.csv` (regenerate with `npm run keywords`) contains
**~21,000 deduplicated phrases** across 21 clusters (brand, programme,
exam-prep, conversational, local/state, B2B, seasonal, careers…).

### Implementation policy (why we don't stuff all 20k into the HTML)

Listing thousands of keywords in page source is *keyword stuffing* — it
triggers Google's spam policies and degrades AI-engine trust. Instead:

1. **Priority-1 terms (~1,400)** are implemented *directly* in code:
   titles, descriptions, `keywords` meta, visible headings, FAQ copy, alt
   text and JSON-LD entities. These cover every brand, programme, intent and
   location query that matters for entity resolution.
2. **Priority-2/3 long-tail (~19,500)** each carries a `target_page` —
   they are covered *semantically* by that page's content, FAQ answers and
   structured data, and they serve as the roadmap for future content
   (blog posts, guides, landing pages) and paid-search campaigns.

That is how a site becomes "super visible wherever people search": strong
entities + exact-match brand/programme copy + semantic long-tail coverage —
not literal keyword dumps.

## Maintenance checklist

- [ ] Set the founder in `src/content/site.ts` (`site.founder`) to activate the founder `Person` entity.
- [ ] After adding a page: add it to `src/content/seo.ts`, `src/app/sitemap.ts` and (if index-worthy) robots is automatic.
- [ ] After adding a programme/event/post: schemas pick it up automatically.
- [ ] Re-run `npm run keywords` when launching new programmes or regions.
- [ ] Submit `https://afristemglobal.org/sitemap.xml` in Google Search Console and Bing Webmaster Tools; verify ownership via the `verification` field in `src/app/layout.tsx` metadata when codes are available.
