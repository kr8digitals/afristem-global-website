# AFRISTEM search visibility implementation

## What this does—and does not do

This release improves discovery and interpretation; it does not guarantee rankings,
indexing, rich results, AI citations or traffic. Google, Bing, other engines and AI
products decide independently what to retrieve and display. Search engines do not
use a 10,000-word meta-keywords tag as a shortcut to relevance.

`keyword-research-10000.csv` contains **10,000 unique generated query candidates**:
25 site-grounded seed topics × 20 query patterns × 20 audience/location contexts.
There is **no measured search volume, ranking, competition score or popularity
claim**. Variants may have little or no actual demand. City variants are research
questions, not claims that a particular event has a venue there. Review relevance,
eligibility and actual availability before publishing copy or advertising.

The list is a planning artefact, deliberately NOT loaded into the browser, hidden
in HTML, embedded in structured data or used to create thousands of doorway pages.
Relevant themes are implemented in titles, descriptions, internal links, the
`/explore` directory and existing programme/event content. Preferred landing pages
are recorded in every row and summarised in `topic-map.md`.

Regenerate deterministically:

```sh
node scripts/generate-keywords.mjs
```

## Implemented

- Self-canonical URLs on public marketing pages, articles, programmes and events.
  Query-string marketing URLs canonicalise to the clean page.
- Unique page-specific Open Graph and Twitter/X summaries, with event/post imagery.
- Connected `EducationalOrganization` and `WebSite` entities using admin contact
  settings, not invented reviews, qualifications or statistics.
- `Article`, `EducationEvent`, `EducationalOccupationalProgram` and breadcrumb
  structured data. Existing visible FAQ content retains its FAQ schema.
- No invented start times, offers, ratings or physical venue addresses. Some
  events therefore may not qualify for a search engine's enhanced event display.
  Registration closure is not misrepresented as event cancellation.
- Dynamic sitemap includes the digital school, school guide, explore page and
  admin-backed events/news. Private routes and the generic registration form are
  omitted. False `lastmod=now` timestamps removed; per-page editorial revision
  timestamps should be introduced before adding lastmod back.
- Robots allow public discovery; admin and API paths remain blocked. Registration
  form pages use `noindex, follow`. Authentication—not robots—protects private data.
- `/feed.xml` RSS for recent official announcements and feed-discovery links in
  page metadata. Dates are the supplied publication dates, not fabricated updates.
- `/llms.txt` provides a dynamic directory of public sources and event status.
  This is an experimental convenience, **not a universal AI standard, submission
  API or ranking signal**. Normal HTML, crawlability and factual content matter more.
  Existing public crawler access is preserved; no special AI-training consent or
  guarantee is implied.
- Server-rendered `/explore` links to programmes, events, services and audience
  pages. Homepage and footer link to it so it is not an orphan page.
- Environment-controlled Google/Bing verification tags and preview noindex switch.

## Deployment and ownership checklist (requires your accounts)

1. Deploy the pushed branch or merge it through your release process. Keep the
   existing persistent `DATA_DIR`; do not replace real submissions with test data.
2. Set `NEXT_PUBLIC_SITE_URL=https://afristemglobal.org` on production. It must be
   your actual preferred origin. Enforce HTTP→HTTPS and www→preferred-host redirects
   at the hosting/domain layer. This release does not alter DNS or your host.
3. For previews/staging set `SITE_INDEXING_ENABLED=false` **before building**.
   It sets robots disallow-all and metadata noindex. Production should unset it
   or set it to `true`. Do not submit a preview domain to a search engine.
4. Verify a domain property in Google Search Console (DNS is preferred), or set
   `GOOGLE_SITE_VERIFICATION` to the HTML verification value issued by your account.
   For Bing Webmaster Tools, set `BING_SITE_VERIFICATION` to its HTML tag value or
   use DNS/import verification. Redeploy after changing these environment values.
   No verification has been performed or ownership token invented by this release.
5. Submit `https://afristemglobal.org/sitemap.xml` in Google Search Console and Bing
   Webmaster Tools. Inspect the homepage, `/explore`, both November event pages,
   programme pages and fresh announcements. Request indexing where available.
6. Check your CDN/WAF does not challenge legitimate search crawlers. Confirm public
   page responses are HTTP 200, unknown URLs return 404, canonical host redirects
   are not looping, and crawlers see the same useful HTML as visitors.
7. Validate representative pages in Google's Rich Results Test and Schema.org's
   validator after deployment. Valid schema does not guarantee a rich result. FAQ
   rich results in Google are restricted and may not appear for this organisation.
8. Complete accurate organisation profiles on relevant social networks and, if
   eligible, Google Business Profile/Bing Places. Keep actual office names,
   addresses, phone numbers and the preferred URL consistent. Do not create fake
   branches for locations merely mentioned in keyword research.
9. Ask genuine schools/partners to link to relevant programme or event pages.
   Publish original updates, useful preparation guidance you have rights to share,
   verified results with appropriate consent, and real school case studies.
   Avoid buying links, auto-post spam and bulk near-duplicate location pages.
10. Keep registration deadlines, fees and results current in Admin. Refresh old
    social posts when they conflict with newer instructions. Do not claim events
    are open solely because an old caption says so.

## Measurement and editorial workflow

- Export real Search Console/Bing query data after indexing begins. Match it to
  the topic map; prioritise actual impressions, relevant demand and enquiries.
- Track organic clicks, indexed canonical pages, broken links, conversions and
  mobile Core Web Vitals. No analytics/tracking service is enabled by this change.
- Review monthly. Correct inaccurate content first. Consolidate near-duplicate
  pages rather than publishing one page per keyword. Record real editorial update
  dates if adding per-page lastModified/dateModified later.
- Use `social-post-drafts.md` as reviewed publishing drafts. This code change does
  not post to social accounts or submit to external search engines.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
node tests/seo-keywords.mjs
# Run after starting a local build; no external submissions:
TEST_BASE_URL=http://127.0.0.1:3000 node tests/seo-integration.mjs
```

Remaining limitations: no search-console access, live-domain/CDN inspection,
external rich-results validation, live SERP research, keyword-volume dataset or
AI citation data was available during implementation. Runtime tests use the local
production build. Production deployment and search-engine ingestion must be
verified separately.
