# AFRISTEM Global Website: Database Specification and Handoff Pack

> **For:** the developer who will create the database.
> **You do not need access to the website's code.** This folder has everything: the full design, ready-to-run SQL for two database engines, the website's current content, and a tool for moving live data.
>
> Prepared on 21 October 2026 from the website's source code. The site is a Next.js 16 app (repository `kr8digitals/afristem-global-website`).

> ✅ **Status (23 October 2026): built and live.** The PostgreSQL design below is running on the Supabase project
> **`afristem-global`** (organisation AFRISTEM, region eu-west-2), created from the four scripts in `postgres/`
> and verified with the section 14 query (24 tables, 104 rows). The website now reads and writes it — see
> [section 0](#0-the-live-supabase-setup). The rest of this document still describes the design in full; where it says
> "today" about the old JSON file it refers to the version before the switch.

## Contents

0. [The live Supabase setup](#0-the-live-supabase-setup)
1. [Quick start](#1-quick-start)
2. [What is in this folder](#2-what-is-in-this-folder)
3. [Background: how the website stores data today](#3-background-how-the-website-stores-data-today)
4. [Everything that needs the database](#4-everything-that-needs-the-database)
5. [Choosing the database engine](#5-choosing-the-database-engine)
6. [Design conventions](#6-design-conventions)
7. [The 24 tables at a glance and how they relate](#7-the-24-tables-at-a-glance-and-how-they-relate)
8. [Table reference: every table, every column](#8-table-reference-every-table-every-column)
9. [Data the website collects but currently loses](#9-data-the-website-collects-but-currently-loses)
10. [Uploaded images (file storage)](#10-uploaded-images-file-storage)
11. [Admin password and security](#11-admin-password-and-security)
12. [Moving existing data from the live site](#12-moving-existing-data-from-the-live-site)
13. [How the website will use the database](#13-how-the-website-will-use-the-database)
14. [Verification: how to prove it is done](#14-verification-how-to-prove-it-is-done)
15. [What to send back to the site owner](#15-what-to-send-back-to-the-site-owner)
- [Appendix A: All allowed values](#appendix-a-all-allowed-values)
- [Appendix B: What each public form sends](#appendix-b-what-each-public-form-sends)
- [Appendix C: Content that stays in the code (optional)](#appendix-c-content-that-stays-in-the-code-optional)
- [Appendix D: Future features (not needed now)](#appendix-d-future-features-not-needed-now)

---

## 0. The live Supabase setup

**Where:** Supabase organisation *AFRISTEM* → project `afristem-global` (ref `lcaafzbeaocphmhxizar`, PostgreSQL 17, eu-west-2 London).

**How it was built** (each step is a Supabase migration, in this order):

| Migration | Source | What it did |
|---|---|---|
| `afristem_move_legacy_tables` | – | Moved the five first-draft tables of migration `20261021195733 afristem_core_schema` (programmes, registrations, contact_messages, newsletter_subscribers, admin_users) **unchanged** into the schema `legacy_20261021`. Nothing was deleted. The website does not use them; drop them with `DROP SCHEMA legacy_20261021 CASCADE;` when you no longer need them. |
| `afristem_website_schema`, `afristem_website_comments_1/2` | `postgres/01-schema.sql` | The 24 tables, constraints, indexes, triggers and column comments |
| `afristem_website_seed_1/2/3` | `postgres/02-seed.sql` | The starting content (104 rows) |
| `afristem_website_security` | `postgres/03-supabase-security.sql` | Row Level Security on every table with no policies; table and sequence privileges removed from `anon` and `authenticated` |
| `afristem_website_api_read_save`, `afristem_website_api_submissions` | `postgres/04-supabase-api.sql` | The website's data API (below) and the public Storage bucket `media` for uploaded images |

**How the website talks to it.** Only through the SQL functions in `postgres/04-supabase-api.sql`, called with
`supabase-js` `.rpc()` from the server (`src/lib/db.ts`, `src/lib/store.ts`) using the project's secret
(service_role) key. Every call is one transaction. The functions read and write the website's own JSON shapes, so
the column mapping lives in one place.

| Function | Used by |
|---|---|
| `app_get_content()` | Every public page (one round trip per request) |
| `app_save_section(section, value)` | Admin → Save (delete removed ids, upsert the rest, `sort_order` = position) |
| `app_get_submissions()`, `app_get_submission(type, id)` | Admin inbox, exports, replies |
| `app_add_contact(p)`, `app_add_registration(p)`, `app_subscribe(id, email, source)` | The three public forms |
| `app_update_submission(...)`, `app_add_reply(...)`, `app_delete_submission(...)` | Admin status changes, notes, email replies, deletes |
| `app_get_admin()`, `app_set_admin(hash, salt, only_if_absent)` | Admin sign-in and password change |
| `app_add_media(p)`, `app_list_media()` | Image uploads and the media library |
| `app_health()` | `GET /api/health` |

Only `service_role` may execute them; `anon`/`authenticated` (the public keys) can call no function and read no table.

**Website environment variables:** `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`), `SUPABASE_SECRET_KEY`
(secret or service_role key, server only), `ADMIN_SECRET`; optional `ADMIN_PASSWORD`, `RESEND_API_KEY`,
`CONTACT_TO_EMAIL`, `MAIL_FROM`, `NEWSLETTER_WEBHOOK_URL`, `NEXT_PUBLIC_SITE_URL`. See the root `README.md`.

**Uploaded images** go to the Storage bucket `media` (public read; only the server can upload) and are registered in
`media_files`. Content stores them as `/api/media/<file>`; that route streams the file from Storage with a one-year cache.

**Changing the schema later:** edit the scripts here, then run the same SQL in Supabase (SQL editor or a new migration).
`04-supabase-api.sql` can be re-run safely at any time (everything is `CREATE OR REPLACE`).

## 1. Quick start

1. **Pick one engine** (section 5): **MySQL/MariaDB**, e.g. on Hostinger where the site is hosted, **or PostgreSQL**, e.g. Supabase or Neon. Both folders create identical tables.
2. **Create an empty database.** Use the `utf8mb4` character set on MySQL/MariaDB, or UTF-8 on PostgreSQL.
3. **Run the scripts in this order** from that engine's folder:
   - `01-schema.sql` creates the 24 tables.
   - `02-seed.sql` loads the website's current content (104 rows).
   - `03-supabase-security.sql` is for **Supabase only**.
   - `04-supabase-api.sql` (Supabase / PostgreSQL) adds the functions the website calls.
   - If the live website already has real form submissions, load a converted backup **instead of** `02-seed.sql` (section 12).
4. **Check the row counts** with the query in section 14.
5. **Set up storage for uploaded images** (section 10).
6. **Leave the `admin_account` table empty** (section 11).
7. **Send the owner** the items listed in section 15, securely.

> **Tested before handover.** Every script here was run on real **PostgreSQL 18** and **MariaDB 13** engines. The tests covered:
> - creating the schema and loading the seed
> - dozens of constraint and cascade tests
> - a migration with realistic live data
> - a full round trip that rebuilds the website's data from the database and compares it field by field with the original. The result was identical.
>
> That is 175 automated checks, all passing. MySQL 8 itself was not available for test runs. The MySQL script only uses features that MySQL 8.0.16+ supports, and its table and index statements pass an independent MySQL-syntax parser.

## 2. What is in this folder

| File | What it is | Needed for |
|---|---|---|
| `README.md` | This document. | Everyone |
| `mysql/01-schema.sql` | Creates all 24 tables on MySQL 8.0.16+ / MariaDB 10.6+. | MySQL route |
| `mysql/02-seed.sql` | Loads the starting content into MySQL/MariaDB. | MySQL route |
| `postgres/01-schema.sql` | Creates all 24 tables on PostgreSQL 14+. | PostgreSQL route |
| `postgres/02-seed.sql` | Loads the starting content into PostgreSQL. | PostgreSQL route |
| `postgres/03-supabase-security.sql` | Supabase only: stops the public API from reading or writing these tables. | Supabase |
| `postgres/04-supabase-api.sql` | The website's data API: the SQL functions it calls, their permissions, and the `media` Storage bucket. | Supabase (the live setup) |
| `data/seed-data.json` | The same starting content as one JSON document, in the exact format the website uses today. Useful for checking values. | Reference |
| `data/hardcoded-content.json` | Optional: content that lives in the website code (menus, services page...). **Not needed for the database.** | Reference |
| `tools/store-json-to-sql.mjs` | Turns a JSON backup of the live website (with real submissions) into SQL for either engine. Needs Node.js 18+, nothing to install. | Only when moving live data |

## 3. Background: how the website stores data today

- The website is a **Next.js 16 (Node.js)** application. It has a public website, an **admin dashboard at `/admin`** and three public forms: contact, programme registration and newsletter.
- **There is no database today.** All editable content, every form submission and the admin password hash live in **one JSON file on the server** (`data/store.json`). Uploaded images are files in `data/uploads/`.
- The admin dashboard edits 12 content sections and the forms add submissions. Every change rewrites the whole file.

**Why a database is needed now:**

1. **Hosting.** Serverless hosts such as Vercel (the project had a `vercel.json` until recently) have no permanent disk, so `store.json` and the uploads would be lost. A database plus file storage works on any host.
2. **Safe saving.** One file can only have one safe writer. Two server processes saving at the same moment can overwrite each other's changes.
3. **Growth.** Submissions keep growing, and today the admin page loads *every* submission into the browser just to search them.
4. **Backups, reporting and data protection.** The site collects children's data.
5. **Lost data.** Some form data is currently thrown away (section 9). The new tables keep it.

## 4. Everything that needs the database

Everything below changes while the site is running, so it must be stored in the database.

| # | Feature on the website | Changed by | Table(s) |
|---|---|---|---|
| 1 | Announcement bar on every page | Admin | `announcement` |
| 2 | Homepage hero (headline, rotating words, buttons, photos) | Admin | `hero_content` |
| 3 | Brand and contact details, offices, social links, sister-site links | Admin | `site_settings`, `site_offices`, `site_social_links`, `site_external_links` |
| 4 | Impact statistics | Admin | `stats` |
| 5 | Flagship programmes (4) | Admin | `programmes` |
| 6 | Events calendar and countdown | Admin | `events` |
| 7 | News articles | Admin | `news_posts` (+ `news_categories`) |
| 8 | Photo gallery | Admin | `gallery_items` (+ `gallery_categories`) |
| 9 | Videos | Admin | `videos` |
| 10 | FAQs | Admin | `faqs` |
| 11 | Testimonials | Admin | `testimonials` |
| 12 | Partners | Admin | `partners` |
| 13 | Contact form messages, with admin notes and email replies | Visitors / Admin | `contact_messages`, `contact_message_notes` |
| 14 | Programme / event registrations, with notes and replies | Visitors / Admin | `registrations`, `registration_notes` |
| 15 | Newsletter and "notify me" sign-ups | Visitors / Admin | `newsletter_subscribers` |
| 16 | Admin dashboard password | Admin | `admin_account` |
| 17 | Uploaded images | Admin | `media_files` + file storage (section 10) |

**What does NOT need the database:**

- **Admin login sessions.** These are signed cookies valid for 12 hours, with nothing stored on the server.
- **Rate limiting** (anti-spam limits on the forms and the login). This is kept in server memory, which is fine for one server. It only needs shared storage, such as Redis/Upstash (optional), if the site runs on several servers or on serverless hosting.
- **Emails.** These are sent through the Resend email service. Replies are recorded in the notes tables.
- **Fixed page text** (About, Services, menus, legal pages...). This stays in the code; see Appendix C if the owner later wants it editable.
- **Images shipped with the site** (`/images/...`). They are part of the code.

## 5. Choosing the database engine

Both folders create **identical** tables, columns and rules. Choose **one**:

| | **MySQL / MariaDB**: use `mysql/` | **PostgreSQL**: use `postgres/` |
|---|---|---|
| Choose it when | The website stays on **Hostinger**. MySQL databases come with the hPanel plan and run next to the site. | You prefer a managed cloud database (**Supabase**, **Neon**, Railway, Render, AWS RDS) or will host the site on Vercel |
| Minimum version | **MySQL 8.0.16+** or **MariaDB 10.6+** | **PostgreSQL 14+** |
| Why | The script needs enforced CHECK constraints, JSON columns and expression defaults. **Do not use MySQL 5.7**, which silently ignores CHECK constraints. | |
| Character set | `utf8mb4` with `utf8mb4_unicode_ci` (the script sets it). This is needed for ₦, dashes, accents and emoji. | UTF-8 |
| Extra step | None | On Supabase, also run `03-supabase-security.sql` |

Not recommended:
- **SQLite.** It is a single file, so it has the same problem as today on serverless hosts.
- **MongoDB/Firestore.** Possible (`data/seed-data.json` shows the documents), but no scripts are provided and you lose the safety rules.

## 6. Design conventions

Read these once; they apply to every table.

- **Names.** Tables and columns use `snake_case`. For every column, the reference also shows the field name the website uses today ("Today's JSON field", in camelCase).
- **IDs are text created by the website**, up to 100 characters. Examples: `msg-mgz3k2a1f4c9`, `reg-mgz3k9q0b2e1`, `sub-...`, `event-<slug>`, `faq-3`. Keep them as they are, because the admin screens and the migration depend on them. Only the two notes tables use auto-increment numbers.
- **"Not filled in" means empty string.** Most text columns are `NOT NULL DEFAULT ''`, which matches how the website treats blank fields. Date-only columns use `NULL` when empty.
- **Time.** All timestamps are in **UTC**: `timestamptz` on PostgreSQL, `DATETIME(3)` on MySQL/MariaDB. On MySQL, **the website's connection must use time zone `+00:00`**. Date rules, such as "is this event upcoming?", are also checked in UTC.
- **Order matters.** Every list the admin can reorder has a `sort_order` column (0 = first), and the site shows items in that order. The one exception is news, which is always shown newest first by date.
- **`created_at` / `updated_at`** exist on every table. `updated_at` updates itself (a trigger on PostgreSQL, `ON UPDATE` on MySQL).
- **JSON columns** are used only for short ordered lists that are always read and saved together: article paragraphs, partner and programme description paragraphs, programme objectives and key facts, and the hero's rotating words. They must always contain a JSON **array**, and the database enforces this. You may use child tables instead if you prefer; the data is the same.
- **Allowed values.** Workflow fields (statuses, types, colours, modes, pillars) are enforced with case-sensitive CHECK constraints. Dropdown values that come from the public forms (such as contact category or gender) are documented but **not** enforced, so a future change to a form can never make submissions fail.
- **Single-row tables.** `announcement`, `hero_content`, `site_settings` and `admin_account` enforce `id = 1`.
- **Readable constraint names.** Prefixes are `pk_` primary key, `uq_` unique, `ck_` check, `fk_` foreign key, `ix_` index and `trg_` trigger.
- **Tags used in section 8:**
  - **[FIX]**: the website already asks for this but currently throws it away, so the database must store it (section 9).
  - **[NEW]**: a new column that is not in today's data.
  - **[HARDCODED]**: a value currently written in the website code, included so the database holds the complete record.

**Type legend**

| In this document | PostgreSQL | MySQL / MariaDB |
|---|---|---|
| `varchar(n)` | `varchar(n)` | `VARCHAR(n)` (n characters) |
| `text` | `text` | `TEXT` |
| `boolean` | `boolean` | `BOOLEAN` (stored as 0/1) |
| `integer`, `smallint` | `integer`, `smallint` | `INT`, `SMALLINT` |
| `bigint, auto-increment` | `bigint GENERATED BY DEFAULT AS IDENTITY` | `BIGINT UNSIGNED AUTO_INCREMENT` |
| `date` | `date` | `DATE` |
| `timestamp` | `timestamptz` | `DATETIME(3)`, in UTC |
| `json (...)` | `jsonb` | `JSON` |

## 7. The 24 tables at a glance and how they relate

| # | Table | What it holds | Rows |
|---|---|---|---|
| | **A. Site-wide settings** | | |
| 1 | `announcement` | The coloured strip at the very top of every page (e.g. 'Registration is open'). | Exactly 1 row |
| 2 | `hero_content` | Headline, animated words, buttons and photos at the top of the homepage. | Exactly 1 row |
| 3 | `site_settings` | Organisation name, contact numbers and registration notes used across the site and in emails. | Exactly 1 row |
| 4 | `site_offices` | Office addresses listed in the footer and on the contact page. | 3 today (Abakaliki head office, Abuja, Lagos) |
| 5 | `site_social_links` | Social icons in the footer and contact page. | 5 today |
| 6 | `site_external_links` | Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer. | 2 today |
| | **B. Website content (edited in the admin dashboard)** | | |
| 7 | `stats` | The big numbers (students reached, schools, partners...). | 4 today |
| 8 | `programmes` | SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>. | 4 today |
| 9 | `events` | Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown. | 7 today |
| 10 | `news_categories` | The fixed list of article categories, with the descriptions shown on the news page filters. | 9 |
| 11 | `news_posts` | News and blog articles. Each has a page at /news/<slug>. | 7 today |
| 12 | `gallery_categories` | The fixed list of photo categories used as filter buttons on the gallery. | 8 |
| 13 | `gallery_items` | Photos in the gallery mosaic. | 25 today |
| 14 | `videos` | YouTube videos shown on the gallery page. | 8 today |
| 15 | `faqs` | Questions and answers. | 11 today |
| 16 | `testimonials` | Quotes from schools, teachers and students. | 4 today |
| 17 | `partners` | Partner organisations with logos and descriptions. | 4 today |
| | **C. Form submissions (written by website visitors)** | | |
| 18 | `contact_messages` | Messages sent through the contact form (/contact). | Grows over time (hundreds per year) |
| 19 | `contact_message_notes` | The timeline under each message: internal notes typed by the admin, and every email reply that was sent. | 0-several per message |
| 20 | `registrations` | Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations. | Grows over time (hundreds to thousands per year) |
| 21 | `registration_notes` | The timeline under each registration: internal notes and every email reply sent. | 0-several per registration |
| 22 | `newsletter_subscribers` | Emails from the newsletter box (footer/home) and the 'Notify me' box on /stem-guide-for-schools. | Grows over time (thousands) |
| | **D. Admin account and uploaded files** | | |
| 23 | `admin_account` | The single password that opens /admin. Only a salted hash is stored, never the password. | 0 or 1. **Leave it EMPTY when you create the database.** |
| 24 | `media_files` | Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database. | Grows over time |

**Relationships.** All other tables stand alone.

```
news_categories ----1:N----> news_posts             news_posts.category    -> news_categories.name
gallery_categories -1:N----> gallery_items          gallery_items.category -> gallery_categories.name
                                                    (renaming a category cascades; deleting one that is in use is blocked)
contact_messages ---1:N----> contact_message_notes  deleting a message deletes its notes
registrations ------1:N----> registration_notes     deleting a registration deletes its notes
programmes ---------1:N----> registrations          optional link: deleting a programme sets registrations.programme_id to NULL
events -------------1:N----> registrations          optional link: deleting an event sets registrations.event_id to NULL
```

Each single-row table holds exactly one row. `site_offices`, `site_social_links` and `site_external_links` belong to the single `site_settings` row, so no foreign key is needed.

## 8. Table reference: every table, every column

### A. Site-wide settings

#### `announcement` - Announcement bar

The coloured strip at the very top of every page (e.g. 'Registration is open').

| | |
|---|---|
| **Written by** | Admin > Announcement |
| **Read by** | Every public page, and the public endpoint GET /api/announcement |
| **Rows** | Exactly 1 row |
| **Today stored in** | `data/store.json` → `announcement` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | smallint | NOT NULL | `1` | **primary key**; must be 1 |  | Always 1 - this table holds exactly one row. |
| `enabled` | boolean | NOT NULL | `true` |  | `enabled` | Show the bar on the site. |
| `tone` | varchar(10) | NOT NULL | `'info'` | one of: `info`, `success`, `warning`, `urgent` | `tone` | Colour of the bar. |
| `label` | varchar(60) | NOT NULL | `''` |  | `label` | Small badge text before the message, e.g. '5th Edition'. |
| `message` | varchar(500) | NOT NULL | `''` |  | `message` | The announcement text. |
| `href` | varchar(1024) | NOT NULL | `''` |  | `href` | Where the link goes, e.g. /register. |
| `link_label` | varchar(80) | NOT NULL | `''` |  | `linkLabel` | Link text. The link only shows when both href and link_label are filled. |
| `starts_at` | date | NULL | - |  | `startsAt` | 'Hide until' date. NULL = no start limit. |
| `ends_at` | date | NULL | - |  | `endsAt` | 'Hide after' date. The bar still shows for the whole of this day. NULL = no end limit. |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Rules:**
- Visible only when `enabled = true` AND (`starts_at` IS NULL OR `starts_at` <= today) AND (`ends_at` IS NULL OR `ends_at` >= today). "Today" is the current date in **UTC**.

#### `hero_content` - Homepage hero

Headline, animated words, buttons and photos at the top of the homepage.

| | |
|---|---|
| **Written by** | Admin > Homepage hero |
| **Read by** | Homepage (/) |
| **Rows** | Exactly 1 row |
| **Today stored in** | `data/store.json` → `hero` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | smallint | NOT NULL | `1` | **primary key**; must be 1 |  | Always 1 - this table holds exactly one row. |
| `badge_label` | varchar(60) | NOT NULL | `''` |  | `badgeLabel` | Small pill label, e.g. 'New'. |
| `badge_text` | varchar(255) | NOT NULL | `''` |  | `badgeText` | Text next to the pill. |
| `badge_href` | varchar(1024) | NOT NULL | `''` |  | `badgeHref` | Where the badge links to. |
| `headline` | varchar(500) | NOT NULL | `''` |  | `headline` | First part of the big heading. The rotating word is shown after it. |
| `rotating_words` | json (array of text) | NOT NULL | `[]` | must be a JSON array | `rotatingWords` | Words that animate after the headline, in display order. |
| `subheading` | text | NOT NULL | `''` |  | `subheading` | Paragraph under the headline. |
| `primary_cta_label` | varchar(80) | NOT NULL | `''` |  | `primaryCtaLabel` | Main button text. |
| `primary_cta_href` | varchar(1024) | NOT NULL | `''` |  | `primaryCtaHref` | Main button link. |
| `secondary_cta_label` | varchar(80) | NOT NULL | `''` |  | `secondaryCtaLabel` | Second button text. |
| `secondary_cta_href` | varchar(1024) | NOT NULL | `''` |  | `secondaryCtaHref` | Second button link. |
| `background_image` | varchar(1024) | NOT NULL | `''` |  | `backgroundImage` | Background photo (image path/URL). |
| `feature_image` | varchar(1024) | NOT NULL | `''` |  | `featureImage` | Main feature photo (image path/URL). |
| `feature_eyebrow` | varchar(255) | NOT NULL | `''` |  | `featureEyebrow` | Small label printed over the feature photo. |
| `feature_caption` | varchar(255) | NOT NULL | `''` |  | `featureCaption` | Caption under the feature photo. |
| `secondary_image` | varchar(1024) | NOT NULL | `''` |  | `secondaryImage` | Floating second photo (desktop only). |
| `secondary_image_caption` | varchar(255) | NOT NULL | `''` |  | `secondaryImageCaption` | Caption for the floating photo. |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

#### `site_settings` - Brand and contact details

Organisation name, contact numbers and registration notes used across the site and in emails.

| | |
|---|---|
| **Written by** | Admin > Brand & contact |
| **Read by** | Header, footer, floating WhatsApp/call buttons (every page), contact page |
| **Rows** | Exactly 1 row |
| **Today stored in** | `data/store.json` → `site` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | smallint | NOT NULL | `1` | **primary key**; must be 1 |  | Always 1 - this table holds exactly one row. |
| `name` | varchar(120) | NOT NULL | `''` |  | `name` | Organisation name, e.g. AFRISTEM. |
| `tagline` | varchar(255) | NOT NULL | `''` |  | `tagline` | Short tagline. |
| `description` | text | NOT NULL | `''` |  | `description` | Meta description / short 'about' text. |
| `email` | varchar(200) | NOT NULL | `''` |  | `email` | Public contact email. |
| `primary_phone` | varchar(40) | NOT NULL | `''` |  | `primaryPhone` | Main phone (header, footer, call button). |
| `whatsapp` | varchar(40) | NOT NULL | `''` |  | `whatsapp` | WhatsApp number. The site keeps only the digits to build the wa.me link. |
| `secondary_phone` | varchar(40) | NOT NULL | `''` |  | `secondaryPhone` | Second phone number. |
| `address` | varchar(500) | NOT NULL | `''` |  | `address` | Head office address (one line). |
| `registration_note` | text | NOT NULL | `''` |  | `registrationNote` | Note shown on the registration page. |
| `registration_opens` | date | NULL | - |  | `registrationOpens` | Registration opening date. NULL = not set. |
| `registration_closes` | date | NULL | - |  | `registrationCloses` | Registration closing date. NULL = not set. |
| `footer_note` | varchar(500) | NOT NULL | `''` |  | `footerNote` | Small line in the footer. |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

#### `site_offices` - Offices

Office addresses listed in the footer and on the contact page.

| | |
|---|---|
| **Written by** | Admin > Brand & contact > Offices |
| **Read by** | Footer (every page), contact page |
| **Rows** | 3 today (Abakaliki head office, Abuja, Lagos) |
| **Today stored in** | `data/store.json` → `site.offices[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Text id, e.g. 'abakaliki', or generated 'office-xxxxxxx'. |
| `name` | varchar(160) | NOT NULL | `''` |  | `(hardcoded today)` | **[NEW]** Office display name, e.g. 'South East Nigeria Office'. Shown on the contact page (the city is used when empty). |
| `city` | varchar(120) | NOT NULL | `''` |  | `city` | City, e.g. Abakaliki. |
| `address` | varchar(500) | NOT NULL | `''` |  | `address` | Full address (one line). |
| `phone` | varchar(40) | NOT NULL | `''` |  | `phone` | Office phone. |
| `map_query` | varchar(500) | NOT NULL | `''` |  | `(hardcoded today)` | **[NEW]** Text used for the Google Maps embed on the contact page. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_site_offices_sort_order` (sort_order)

**Rules:**
- The first office (lowest `sort_order`) is treated as the head office in the footer.

#### `site_social_links` - Social media links

Social icons in the footer and contact page.

| | |
|---|---|
| **Written by** | Admin > Brand & contact > Social links |
| **Read by** | Footer (every page), contact page |
| **Rows** | 5 today |
| **Today stored in** | `data/store.json` → `site.socials[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Text id, e.g. 'facebook', or generated 'social-xxxxxxx'. |
| `label` | varchar(80) | NOT NULL | `''` |  | `label` | Name, e.g. Facebook. |
| `href` | varchar(1024) | NOT NULL | `''` |  | `href` | Profile URL. |
| `icon` | varchar(20) | NOT NULL | `'link'` | usual values: `facebook`, `instagram`, `x`, `youtube`, `linkedin`, `tiktok`, `whatsapp`, `link` (not enforced) | `icon` | Which icon to draw. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_site_social_links_sort_order` (sort_order)

#### `site_external_links` - External (sister) sites

Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer.

| | |
|---|---|
| **Written by** | Admin > Brand & contact > External sites |
| **Read by** | Footer (every page) |
| **Rows** | 2 today |
| **Today stored in** | `data/store.json` → `site.externalLinks[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Text id, e.g. 'prime-stem', or generated 'ext-xxxxxxx'. |
| `label` | varchar(160) | NOT NULL | `''` |  | `label` | Link text. |
| `href` | varchar(1024) | NOT NULL | `''` |  | `href` | Full URL (opens in a new tab). |
| `description` | text | NOT NULL | `''` |  | `description` | Short description. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_site_external_links_sort_order` (sort_order)

### B. Website content (edited in the admin dashboard)

#### `stats` - Impact statistics

The big numbers (students reached, schools, partners...).

| | |
|---|---|
| **Written by** | Admin > Statistics |
| **Read by** | Homepage hero and 'who we are' section |
| **Rows** | 4 today |
| **Today stored in** | `data/store.json` → `stats[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | e.g. 'stat-1'. |
| `value` | varchar(40) | NOT NULL | `''` |  | `value` | Display text, e.g. '5,867+'. The site animates the leading number and keeps the rest as a suffix. |
| `label` | varchar(120) | NOT NULL | `''` |  | `label` | e.g. 'Students Reached'. |
| `icon` | varchar(30) | NOT NULL | `'sparkles'` | usual values: `sparkles`, `users`, `school`, `trophy`, `flask`, `cpu`, `globe`, `star` (not enforced) | `icon` | Icon name (stored, not displayed yet). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_stats_sort_order` (sort_order)

**Rules:**
- **Order matters:** the homepage hero reads the 1st, 2nd and 3rd stats as Students, Schools and Partners. Keep `sort_order` stable.

#### `programmes` - Flagship programmes

SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>.

| | |
|---|---|
| **Written by** | Admin > Programmes |
| **Read by** | Homepage, /programmes, /programmes/<slug>, registration form |
| **Rows** | 4 today |
| **Today stored in** | data/store.json → programmes[] (the long-form fields are hardcoded in src/content/programmes.ts) |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Seed rows use the slug as id; admin-created rows get 'prog-xxxxxxx'. |
| `slug` | varchar(160) | NOT NULL | `''` | **unique**; must not be empty | `slug` | URL part: /programmes/<slug>. Unique, must not be empty. |
| `name` | varchar(200) | NOT NULL | `''` |  | `name` | Programme name. |
| `subtitle` | varchar(255) | NOT NULL | `''` |  | `subtitle` | e.g. 'Science Spelling Bee'. |
| `tagline` | varchar(255) | NOT NULL | `''` |  | `tagline` | Short slogan. |
| `short_description` | text | NOT NULL | `''` |  | `shortDescription` | One-line summary used on cards. |
| `eligibility` | text | NOT NULL | `''` |  | `eligibility` | Who can take part. |
| `format` | varchar(255) | NOT NULL | `''` |  | `format` | Structure, e.g. 'School rounds > Regional finals > Grand finale'. |
| `age_range` | varchar(120) | NOT NULL | `''` |  | `ageRange` | Age/class range, e.g. 'Ages 6 - 14'. |
| `image` | varchar(1024) | NOT NULL | `''` |  | `image` | Main image (path/URL). |
| `image_alt` | varchar(255) | NOT NULL | `''` |  | `imageAlt` | Image description for screen readers. |
| `pillar` | varchar(20) | NOT NULL | `'STEM'` | one of: `SCIENCE`, `TECHNOLOGY`, `STEM`, `CHEMISTRY` | `pillar` | Which STEM pillar the programme represents. |
| `cta_label` | varchar(120) | NOT NULL | `'Register interest'` |  | `ctaLabel` | Button text. |
| `highlights` | json (array of {label, value}) | NOT NULL | `[]` | must be a JSON array | `highlights` | Key facts, e.g. [{"label":"Exam date","value":"November 14, 2026"}]. The admin screen edits them as one 'Label: Value' per line. |
| `prize_note` | varchar(500) | NOT NULL | `''` |  | `prizeNote` | Optional headline prize line. Empty = none. |
| `poster` | varchar(1024) | NOT NULL | `''` |  | `poster` | Optional full poster image. Empty = none. |
| `register_href` | varchar(1024) | NOT NULL | `'/register'` |  | `registerHref` | Where the register button goes. |
| `featured` | boolean | NOT NULL | `true` |  | `featured` | 'Show on homepage'. |
| `status` | varchar(20) | NOT NULL | `'open'` | one of: `open`, `closing-soon`, `closed`, `coming-soon` | `status` | Registration status. |
| `pillar_blurb` | varchar(255) | NOT NULL | `''` |  | `pillarBlurb (code only)` | **[HARDCODED]** One line describing the pillar. |
| `description` | json (array of text) | NOT NULL | `[]` | must be a JSON array | `description (code only)` | **[HARDCODED]** Long description paragraphs for the programme page, in order. |
| `objectives` | json (array of text) | NOT NULL | `[]` | must be a JSON array | `objectives (code only)` | **[HARDCODED]** Bullet list of objectives, in order. |
| `accent` | varchar(10) | NOT NULL | `'sun'` | usual values: `sun`, `sky`, `mint`, `violet`, `coral` (not enforced) | `accent (code only)` | **[HARDCODED]** Colour theme of the programme page. |
| `icon` | varchar(10) | NOT NULL | `'trophy'` | usual values: `spell`, `code`, `trophy`, `flask` (not enforced) | `icon (code only)` | **[HARDCODED]** Icon shown on the programme card. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_programmes_sort_order` (sort_order)

**Rules:**
- Columns marked **HARDCODED** exist only in the website code today (`src/content/programmes.ts`), not in the admin. They are included so the database can hold the *complete* programme and a programme added later can have a full page. They are filled by the seed file.

#### `events` - Events

Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown.

| | |
|---|---|
| **Written by** | Admin > Events |
| **Read by** | Homepage (next 4 upcoming), /events (upcoming + past), programme pages (related events), registration form (event dropdown) |
| **Rows** | 7 today |
| **Today stored in** | `data/store.json` → `events[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Seed rows: 'event-<slug>'; admin-created: 'event-xxxxxxx'. |
| `slug` | varchar(160) | NOT NULL | `''` | **unique**; must not be empty | `slug` | Unique identifier text. The registration form sends it as the chosen event. |
| `title` | varchar(255) | NOT NULL | `''` |  | `title` | Event name. |
| `start_date` | date | NOT NULL | - |  | `start` | Start date. Used for sorting, the countdown and the upcoming/past split. Required. |
| `end_date` | date | NULL | - |  | `end` | End date for multi-day events. NULL = single day. |
| `display_date` | varchar(120) | NOT NULL | `''` |  | `displayDate` | Human-readable date shown on the site, e.g. 'Oct 19 - 30, 2026'. |
| `location` | varchar(255) | NOT NULL | `''` |  | `location` | Venue or 'Online (Zoom)'. |
| `mode` | varchar(10) | NOT NULL | `'Physical'` | one of: `Physical`, `Virtual`, `Hybrid` | `mode` | Physical, Virtual or Hybrid. |
| `description` | text | NOT NULL | `''` |  | `description` | Event description. |
| `deadline` | varchar(120) | NOT NULL | `''` |  | `deadline` | Registration deadline as display text, e.g. 'Oct 28, 2026'. Empty = none. |
| `register_href` | varchar(1024) | NOT NULL | `'/register'` |  | `registerHref` | Where the Register button goes. |
| `tag` | varchar(80) | NOT NULL | `''` |  | `tag` | Label pill, e.g. 'Awards', 'Educators'. |
| `image` | varchar(1024) | NOT NULL | `''` |  | `image` | Event image (path/URL). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_events_start_date` (start_date) · `ix_events_sort_order` (sort_order)

**Rules:**
- **Upcoming** = `COALESCE(end_date, start_date) >= today (UTC)`, sorted by `start_date` ascending. **Past** = the rest, sorted by `start_date` descending.
- The homepage shows the first 4 upcoming events; the events page shows a countdown to the next one.

#### `news_categories` - News categories (lookup)

The fixed list of article categories, with the descriptions shown on the news page filters.

| | |
|---|---|
| **Written by** | Seed only (no admin screen yet) |
| **Read by** | /news (category filter), admin news form (dropdown) |
| **Rows** | 9 |
| **Today stored in** | postCategories (hardcoded in src/content/data.ts) |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `name` | varchar(60) | NOT NULL | - | **primary key** | `name` | Category name, e.g. 'STEM Education'. Referenced by news_posts.category. |
| `description` | varchar(255) | NOT NULL | `''` |  | `description` | Short explanation shown on the news page. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |

**Indexes:** `ix_news_categories_sort_order` (sort_order)

#### `news_posts` - News articles

News and blog articles. Each has a page at /news/<slug>.

| | |
|---|---|
| **Written by** | Admin > News |
| **Read by** | Homepage (latest 3), /news, /news/<slug>, sitemap.xml |
| **Rows** | 7 today |
| **Today stored in** | `data/store.json` → `news[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Seed rows: 'post-<slug>'; admin-created: 'post-xxxxxxx'. |
| `slug` | varchar(160) | NOT NULL | `''` | **unique**; must not be empty | `slug` | URL part: /news/<slug>. Unique, must not be empty. |
| `title` | varchar(300) | NOT NULL | `''` |  | `title` | Headline. |
| `excerpt` | text | NOT NULL | `''` |  | `excerpt` | Short summary for cards and SEO. |
| `category` | varchar(60) | NOT NULL | `'AFRISTEM News'` | → `news_categories.name` (on delete restrict) | `category` | Must be one of news_categories.name. |
| `published_on` | date | NOT NULL | - |  | `date` | Publication date. All lists are sorted by this, newest first. Required. |
| `display_date` | varchar(120) | NOT NULL | `''` |  | `displayDate` | Human-readable date, e.g. 'Oct 1, 2026'. |
| `read_time` | varchar(40) | NOT NULL | `'3 min read'` |  | `readTime` | e.g. '4 min read'. |
| `image` | varchar(1024) | NOT NULL | `''` |  | `image` | Cover image (path/URL). |
| `author` | varchar(120) | NOT NULL | `'AFRISTEM Team'` |  | `author` | Author name. |
| `body` | json (array of text) | NOT NULL | `[]` | must be a JSON array | `body` | Article paragraphs, in order (one string per paragraph). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_news_posts_published_on` (published_on) · `ix_news_posts_category` (category) · `ix_news_posts_sort_order` (sort_order)

**Rules:**
- Public lists ignore `sort_order` and sort by `published_on` DESC. The newest article is shown as 'Featured' on /news.

#### `gallery_categories` - Gallery categories (lookup)

The fixed list of photo categories used as filter buttons on the gallery.

| | |
|---|---|
| **Written by** | Seed only (no admin screen yet) |
| **Read by** | /gallery (filter buttons), admin gallery form (dropdown) |
| **Rows** | 8 |
| **Today stored in** | galleryCategories (hardcoded in src/content/data.ts) |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `name` | varchar(60) | NOT NULL | - | **primary key** | `name` | Category name, e.g. 'Competitions'. Referenced by gallery_items.category. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |

**Indexes:** `ix_gallery_categories_sort_order` (sort_order)

#### `gallery_items` - Gallery photos

Photos in the gallery mosaic.

| | |
|---|---|
| **Written by** | Admin > Gallery |
| **Read by** | /gallery |
| **Rows** | 25 today |
| **Today stored in** | `data/store.json` → `gallery[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Seed rows: 'photo-<n>'; admin-created: 'photo-xxxxxxx'. |
| `src` | varchar(1024) | NOT NULL | `''` |  | `src` | Image path/URL. Should not be empty. |
| `alt` | varchar(500) | NOT NULL | `''` |  | `alt` | Describes the photo for screen readers. |
| `caption` | varchar(255) | NOT NULL | `''` |  | `caption` | Caption shown on hover and in the lightbox. |
| `category` | varchar(60) | NOT NULL | `'Events'` | → `gallery_categories.name` (on delete restrict) | `category` | Must be one of gallery_categories.name. |
| `span` | varchar(4) | NOT NULL | `''` | one of: `''`, `wide`, `tall` | `span` | Tile shape in the mosaic: '' = normal, 'wide' = two columns, 'tall' = two rows. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_gallery_items_category` (category) · `ix_gallery_items_sort_order` (sort_order)

#### `videos` - Videos

YouTube videos shown on the gallery page.

| | |
|---|---|
| **Written by** | Admin > Videos |
| **Read by** | /gallery (videos section) |
| **Rows** | 8 today |
| **Today stored in** | `data/store.json` → `videos[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | e.g. 'bootcamp-2023' or 'video-xxxxxxx'. |
| `title` | varchar(255) | NOT NULL | `''` |  | `title` | Video title. |
| `description` | text | NOT NULL | `''` |  | `description` | Short description. |
| `youtube_id` | varchar(255) | NOT NULL | `''` |  | `youtubeId` | The 11-character YouTube ID **or** a full YouTube link (watch, youtu.be, embed, shorts). The site extracts the ID. |
| `thumb` | varchar(1024) | NOT NULL | `''` |  | `thumb` | Optional thumbnail image. Empty = use YouTube's own thumbnail. |
| `category` | varchar(80) | NOT NULL | `'Highlights'` |  | `category` | Free text, e.g. Bootcamp, Competition, Inside AFRISTEM. |
| `featured` | boolean | NOT NULL | `false` |  | `featured` | 'Feature on homepage' (stored, not used by the public site yet). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_videos_sort_order` (sort_order)

#### `faqs` - FAQs

Questions and answers.

| | |
|---|---|
| **Written by** | Admin > FAQs |
| **Read by** | /faq, homepage FAQ teaser, contact page (first 5), programme pages |
| **Rows** | 11 today |
| **Today stored in** | `data/store.json` → `faqs[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | e.g. 'faq-1'. |
| `question` | varchar(500) | NOT NULL | `''` |  | `question` | The question. |
| `answer` | text | NOT NULL | `''` |  | `answer` | The answer. |
| `category` | varchar(80) | NOT NULL | `'General'` |  | `category` | Free text grouping (not displayed yet). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_faqs_sort_order` (sort_order)

#### `testimonials` - Testimonials

Quotes from schools, teachers and students.

| | |
|---|---|
| **Written by** | Admin > Testimonials |
| **Read by** | Homepage testimonials section |
| **Rows** | 4 today |
| **Today stored in** | `data/store.json` → `testimonials[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | e.g. 'testimonial-1'. |
| `quote` | text | NOT NULL | `''` |  | `quote` | The quote. |
| `name` | varchar(120) | NOT NULL | `''` |  | `name` | Person (or role) quoted. |
| `role` | varchar(160) | NOT NULL | `''` |  | `role` | e.g. 'Science Teacher'. |
| `org` | varchar(160) | NOT NULL | `''` |  | `org` | School / organisation. Shown after the role. |
| `image` | varchar(1024) | NOT NULL | `''` |  | `image` | Optional photo (not displayed yet). |
| `initials` | varchar(10) | NOT NULL | `''` |  | `initials` | Avatar letters (up to 2). If empty the site uses the first letters of the first two words of the name. |
| `featured` | boolean | NOT NULL | `false` |  | `featured` | 'Feature' flag (stored, not used by the public site yet). |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_testimonials_sort_order` (sort_order)

#### `partners` - Partners and sponsors

Partner organisations with logos and descriptions.

| | |
|---|---|
| **Written by** | Admin > Partners |
| **Read by** | Homepage partner strip, /partners |
| **Rows** | 4 today |
| **Today stored in** | `data/store.json` → `partners[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Seed rows: 'partner-<n>'; admin-created: 'partner-xxxxxxx'. |
| `slug` | varchar(160) | NOT NULL | `''` | **unique**; must not be empty | `slug` | Unique identifier text. |
| `name` | varchar(200) | NOT NULL | `''` |  | `name` | Organisation name. |
| `logo` | varchar(1024) | NOT NULL | `''` |  | `logo` | Logo image (path/URL). |
| `type` | varchar(80) | NOT NULL | `'Partner'` |  | `type` | Free text, e.g. 'Strategic Partner'. |
| `description` | json (array of text) | NOT NULL | `[]` | must be a JSON array | `description` | Description paragraphs, in order. |
| `href` | varchar(1024) | NOT NULL | `''` |  | `href` | Website or internal page. |
| `cta_label` | varchar(80) | NOT NULL | `'Learn more'` |  | `ctaLabel` | Button text. |
| `external` | boolean | NOT NULL | `false` |  | `external` | Open the link in a new tab. |
| `country` | varchar(80) | NOT NULL | `''` |  | `country` | Optional country. Empty = not shown. |
| `sort_order` | integer | NOT NULL | `0` |  |  | Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_partners_sort_order` (sort_order)

### C. Form submissions (written by website visitors)

#### `contact_messages` - Contact form messages

Messages sent through the contact form (/contact).

| | |
|---|---|
| **Written by** | Website visitors (POST /api/contact). Admin changes status, adds notes, replies by email, deletes. |
| **Read by** | Admin > Submissions > Contact messages (search, filter by status, CSV export) |
| **Rows** | Grows over time (hundreds per year) |
| **Today stored in** | `data/store.json` → `submissions.contact[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Generated by the app: 'msg-<time><random>'. |
| `name` | varchar(120) | NOT NULL | - | must not be empty | `name` | Sender's full name. Required. |
| `email` | varchar(200) | NOT NULL | - | must not be empty | `email` | Sender's email. Required, validated as an email address. |
| `phone` | varchar(40) | NOT NULL | `''` |  | `phone` | Optional phone. |
| `organisation` | varchar(160) | NOT NULL | `''` |  | `organisation (sent by form, currently discarded)` | **[FIX]** Organisation / school (optional). |
| `category` | varchar(80) | NOT NULL | `'General Enquiry'` | usual values: `Student`, `Parent`, `School`, `Educator`, `STEM Professional`, `Organization`, `Partner`, `General Enquiry` (not enforced) | `category` | 'I am a...' dropdown value. |
| `subject` | varchar(200) | NOT NULL | - | must not be empty | `subject` | Subject. Required. |
| `message` | text | NOT NULL | - | must not be empty | `message` | Message body. Required. The app caps it at 5,000 characters. |
| `status` | varchar(20) | NOT NULL | `'new'` | one of: `new`, `in-progress`, `replied`, `closed` | `status` | Inbox workflow status. |
| `created_at` | timestamp | NOT NULL | now |  | `createdAt` | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_contact_messages_created_at` (created_at) · `ix_contact_messages_status` (status) · `ix_contact_messages_email` (email)

**Rules:**
- New messages always start as `new`. Sending an email reply moves a `new` message to `replied` automatically.
- Deleting a message deletes its notes (cascade).

#### `contact_message_notes` - Notes and replies on contact messages

The timeline under each message: internal notes typed by the admin, and every email reply that was sent.

| | |
|---|---|
| **Written by** | Admin (Add note / Send reply) |
| **Read by** | Admin message detail view |
| **Rows** | 0-several per message |
| **Today stored in** | `data/store.json` → `submissions.contact[].notes[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | bigint, auto-increment | NOT NULL | auto | **primary key** | `(none - new)` | Auto-increment number. |
| `contact_message_id` | varchar(100) | NOT NULL | - | → `contact_messages.id` (on delete cascade) | `(parent)` | The message this note belongs to. |
| `kind` | varchar(10) | NOT NULL | `'note'` | one of: `note`, `reply` | `(derived)` | 'note' = internal note; 'reply' = an email reply that was sent to the person. |
| `reply_subject` | varchar(255) | NOT NULL | `''` |  | `(inside text)` | Email subject. Replies only; empty for notes. |
| `email_status` | varchar(20) | NULL | - | one of: `sent`, `logged_only`, `failed` | `(inside text)` | **[FIX]** Replies only (NULL for notes): sent = delivered to the email provider; logged_only = no email key configured, so nothing was sent; failed = provider rejected it. |
| `body` | text | NOT NULL | - | must not be empty | `text` | The note text, or the reply message that was emailed. |
| `author` | varchar(80) | NOT NULL | `'admin'` |  | `by` | Who wrote it. Always 'admin' today (single admin account). |
| `created_at` | timestamp | NOT NULL | now |  | `at` | When the row was created (UTC). |

**Indexes:** `ix_contact_message_notes_contact_message_id_created_at` (contact_message_id, created_at)

#### `registrations` - Programme / event registrations

Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations.

| | |
|---|---|
| **Written by** | Website visitors (POST /api/register). Admin changes status, adds notes, replies by email, deletes. |
| **Read by** | Admin > Submissions > Registrations (search, filter by status, CSV export) |
| **Rows** | Grows over time (hundreds to thousands per year) |
| **Today stored in** | `data/store.json` → `submissions.register[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Generated by the app: 'reg-<time><random>'. |
| `reference` | varchar(20) | NOT NULL | - | **unique**; must not be empty | `reference` | Reference shown to the registrant, format AFR-<year>-<5 letters/digits>, e.g. AFR-2026-1F4C9. Unique. |
| `type` | varchar(20) | NOT NULL | - | one of: `student`, `school`, `educator`, `professional`, `partner` | `type` | 'I am registering as a...'. Required. |
| `programme_slug` | varchar(160) | NOT NULL | `''` |  | `programme` | Programme chosen (its slug), kept as text so the record survives programme edits or deletion. Empty = none. |
| `programme_id` | varchar(100) | NULL | - | → `programmes.id` (on delete set null) | `(resolved from programme)` | **[NEW]** Link to programmes.id when programme_slug matches a programme. NULL otherwise. |
| `event_ref` | varchar(160) | NOT NULL | `''` |  | `event (sent by form, currently discarded)` | **[FIX]** Event chosen (an events.slug; older short codes in shared links are translated by the register page). Empty = none. |
| `event_id` | varchar(100) | NULL | - | → `events.id` (on delete set null) | `(resolved from event)` | **[NEW]** Link to events.id when event_ref matches an event slug. NULL otherwise. |
| `category` | varchar(80) | NOT NULL | `''` | usual values: `Primary (Junior)`, `Primary (Senior)`, `Junior Secondary`, `Senior Secondary`, `Educator / Adult` (not enforced) | `category (currently discarded)` | **[FIX]** Participant category. Optional. |
| `preferred_format` | varchar(20) | NOT NULL | `''` | usual values: `Physical`, `Online`, `Hybrid` (not enforced) | `format (currently discarded)` | **[FIX]** Preferred format. Optional. |
| `full_name` | varchar(120) | NOT NULL | - | must not be empty | `fullName (today only split into first/last)` | **[FIX]** Full name exactly as typed (for schools: the contact person). Required. |
| `first_name` | varchar(120) | NOT NULL | `''` |  | `firstName` | First word of full_name. |
| `last_name` | varchar(120) | NOT NULL | `''` |  | `lastName` | Everything after the first word of full_name. |
| `date_of_birth` | date | NULL | - |  | `dob (currently discarded)` | **[FIX]** Students only (required for students on the form). Used to decide if a parent/guardian is needed (under 18). |
| `gender` | varchar(20) | NOT NULL | `''` | usual values: `Female`, `Male`, '' (prefer not to say) (not enforced) | `gender (currently discarded)` | **[FIX]** Students only. Optional. |
| `email` | varchar(200) | NOT NULL | - | must not be empty | `email` | Email. Required, validated as an email address. |
| `phone` | varchar(40) | NOT NULL | - | must not be empty | `phone` | Phone. Required. |
| `school_name` | varchar(160) | NOT NULL | `''` |  | `schoolName (form) / school (stored)` | **[FIX]** School name. Required on the form for students and schools. |
| `grade` | varchar(80) | NOT NULL | `''` |  | `grade (currently discarded)` | **[FIX]** Students: class/grade, e.g. 'JSS 2'. Required for students. |
| `school_location` | varchar(200) | NOT NULL | `''` |  | `schoolLocation (currently discarded)` | **[FIX]** 'City, State, Country' free text. Required for schools. |
| `state` | varchar(80) | NOT NULL | `''` |  | `state` | State (exists in today's record; the current form does not ask for it). |
| `city` | varchar(80) | NOT NULL | `''` |  | `city` | City (exists in today's record; the current form does not ask for it). |
| `role` | varchar(80) | NOT NULL | `''` |  | `role` | Educators / professionals / partners: 'Role / Profession' (required for them). |
| `organisation` | varchar(160) | NOT NULL | `''` |  | `organisation (currently discarded)` | **[FIX]** Educators / professionals / partners: organisation. Optional. |
| `participants` | varchar(20) | NOT NULL | `''` |  | `participants` | Number of participants (exists in today's record; the current form puts this in applicant_notes instead). |
| `applicant_notes` | text | NOT NULL | `''` |  | `notes (a text string)` | Free-text notes from the applicant, e.g. schools: 'Estimated number of students & any notes'. The app caps it at 3,000 characters. |
| `guardian_name` | varchar(120) | NOT NULL | `''` |  | `guardianName (currently discarded)` | **[FIX]** Parent/guardian name. Required on the form for students under 18. |
| `guardian_phone` | varchar(40) | NOT NULL | `''` |  | `guardianPhone (currently discarded)` | **[FIX]** Parent/guardian phone. Required on the form for students under 18. |
| `guardian_email` | varchar(200) | NOT NULL | `''` |  | `guardianEmail (currently discarded)` | **[FIX]** Parent/guardian email. Optional. |
| `guardian_relationship` | varchar(40) | NOT NULL | `''` | usual values: `Mother`, `Father`, `Guardian`, `Teacher`, `Other` (not enforced) | `guardianRelationship (currently discarded)` | **[FIX]** Relationship to the participant. Optional. |
| `consent_given` | boolean | NOT NULL | `false` |  | `consent ('yes', checked but not stored)` | **[FIX]** Applicant ticked the Privacy Policy / Terms box. The server refuses registrations without it, so the app must store TRUE. |
| `consent_at` | timestamp | NULL | - |  | `(new)` | **[NEW]** When consent was given (= submission time). |
| `status` | varchar(20) | NOT NULL | `'new'` | one of: `new`, `contacted`, `confirmed`, `waitlist`, `declined` | `status` | Workflow status. |
| `created_at` | timestamp | NOT NULL | now |  | `createdAt` | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_registrations_created_at` (created_at) · `ix_registrations_status` (status) · `ix_registrations_email` (email) · `ix_registrations_programme_slug` (programme_slug) · `ix_registrations_programme_id` (programme_id) · `ix_registrations_event_id` (event_id)

**Rules:**
- New registrations always start as `new`. Sending an email reply moves a `new` registration to `contacted` automatically.
- The `reference` is generated by the app as `AFR-<year>-<5 uppercase letters/digits>` (random). Because it is random, the app must retry with a new one if the UNIQUE constraint rejects it.
- Deleting a registration deletes its notes (cascade). Deleting a programme or event keeps the registration and sets `programme_id` / `event_id` to NULL.

#### `registration_notes` - Notes and replies on registrations

The timeline under each registration: internal notes and every email reply sent.

| | |
|---|---|
| **Written by** | Admin (Add note / Send reply) |
| **Read by** | Admin registration detail view |
| **Rows** | 0-several per registration |
| **Today stored in** | `data/store.json` → `submissions.register[].thread[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | bigint, auto-increment | NOT NULL | auto | **primary key** | `(none - new)` | Auto-increment number. |
| `registration_id` | varchar(100) | NOT NULL | - | → `registrations.id` (on delete cascade) | `(parent)` | The registration this note belongs to. |
| `kind` | varchar(10) | NOT NULL | `'note'` | one of: `note`, `reply` | `(derived)` | 'note' = internal note; 'reply' = an email reply that was sent to the person. |
| `reply_subject` | varchar(255) | NOT NULL | `''` |  | `(inside text)` | Email subject. Replies only; empty for notes. |
| `email_status` | varchar(20) | NULL | - | one of: `sent`, `logged_only`, `failed` | `(inside text)` | **[FIX]** Replies only (NULL for notes): sent, logged_only (no email key configured) or failed. |
| `body` | text | NOT NULL | - | must not be empty | `text` | The note text, or the reply message that was emailed. |
| `author` | varchar(80) | NOT NULL | `'admin'` |  | `by` | Who wrote it. Always 'admin' today. |
| `created_at` | timestamp | NOT NULL | now |  | `at` | When the row was created (UTC). |

**Indexes:** `ix_registration_notes_registration_id_created_at` (registration_id, created_at)

#### `newsletter_subscribers` - Newsletter subscribers

Emails from the newsletter box (footer/home) and the 'Notify me' box on /stem-guide-for-schools.

| | |
|---|---|
| **Written by** | Website visitors (POST /api/newsletter). Admin toggles subscribed/unsubscribed, deletes. |
| **Read by** | Admin > Submissions > Newsletter (CSV export) |
| **Rows** | Grows over time (thousands) |
| **Today stored in** | `data/store.json` → `submissions.newsletter[]` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `id` | Generated by the app: 'sub-<time><random>'. |
| `email` | varchar(200) | NOT NULL | - | **unique**; must not be empty; lowercase; unique ignoring case | `email` | Email address, stored in lowercase. Unique (one row per person). |
| `status` | varchar(20) | NOT NULL | `'subscribed'` | one of: `subscribed`, `unsubscribed` | `status` | Subscription status. |
| `source` | varchar(40) | NOT NULL | `'newsletter'` | usual values: `newsletter`, `stem-guide`, `import`, `admin` (not enforced) | `(new)` | **[NEW]** Which form they used: newsletter (footer / homepage box) or stem-guide ('Notify me' on /stem-guide-for-schools). |
| `created_at` | timestamp | NOT NULL | now |  | `createdAt` | When the row was created (UTC). |
| `unsubscribed_at` | timestamp | NULL | - |  | `(new)` | **[NEW]** When they were marked unsubscribed. NULL while subscribed. |
| `updated_at` | timestamp | NOT NULL | now |  |  | Last change (UTC). Maintained automatically. |

**Indexes:** `ix_newsletter_subscribers_status` (status) · `ix_newsletter_subscribers_created_at` (created_at)

**Rules:**
- One row per email (case-insensitive). Signing up again must **update** the existing row back to `subscribed` (upsert), not insert a second row. (Today a re-subscribe after unsubscribing creates a duplicate.)

### D. Admin account and uploaded files

#### `admin_account` - Admin dashboard password

The single password that opens /admin. Only a salted hash is stored, never the password.

| | |
|---|---|
| **Written by** | The app: on the first successful login (creates the row) and on Admin > Settings > change password |
| **Read by** | POST /api/admin/login |
| **Rows** | 0 or 1. **Leave it EMPTY when you create the database.** |
| **Today stored in** | `data/store.json` → `admin.user` |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | smallint | NOT NULL | `1` | **primary key**; must be 1 |  | Always 1 - this table holds exactly one row. |
| `password_hash` | varchar(128) | NOT NULL | - |  | `passwordHash` | PBKDF2-HMAC-SHA256, 120,000 iterations, 32-byte output, base64url without padding (43 characters). |
| `password_salt` | varchar(64) | NOT NULL | - |  | `salt` | 16 random bytes as base64url (22 characters). Note: the UTF-8 bytes of this salt *string* are what is fed to PBKDF2. |
| `hash_algorithm` | varchar(30) | NOT NULL | `'pbkdf2-sha256'` |  | `(new)` | Documents the algorithm (for future upgrades). |
| `hash_iterations` | integer | NOT NULL | `120000` |  | `(new)` | PBKDF2 iteration count used for this hash. |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |
| `updated_at` | timestamp | NOT NULL | now |  | `updatedAt` | When the password was last set (UTC). |

**Rules:**
- Login is password-only (no username). While the table is empty, the app accepts the password from the server setting `ADMIN_PASSWORD` (or the built-in default) and, on success, writes this row so the password can be changed later.
- To reset a forgotten password: delete the row, then log in with `ADMIN_PASSWORD`.

#### `media_files` - Uploaded images

Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database.

| | |
|---|---|
| **Written by** | Admin image uploads (POST /api/admin/upload) |
| **Read by** | Admin media library picker; GET /api/media/<file_name> (public image URLs) |
| **Rows** | Grows over time |
| **Today stored in** | (none - today the app just lists the files in data/uploads/) |

| Column | Type | Null? | Default | Rules / allowed values | Today's JSON field | Description |
|---|---|---|---|---|---|---|
| `id` | varchar(100) | NOT NULL | - | **primary key** | `(new)` | e.g. 'media-<file name without .jpg>'. |
| `file_name` | varchar(255) | NOT NULL | - | **unique** | `(file name)` | Stored file name, e.g. 'mgz3k2a1-3fa9c1.jpg'. Unique. |
| `url` | varchar(1024) | NOT NULL | - |  | `(returned url)` | URL saved into content, e.g. '/api/media/mgz3k2a1-3fa9c1.jpg' or a full CDN URL. |
| `storage` | varchar(20) | NOT NULL | `'local'` | usual values: `local`, `s3`, `r2`, `supabase`, `cloudinary`, `database` (not enforced) | `(new)` | Where the bytes live. |
| `mime_type` | varchar(60) | NOT NULL | `'image/jpeg'` |  | `(new)` | Uploads are always converted to JPEG today. |
| `size_bytes` | integer | NOT NULL | `0` |  | `bytes` | File size after processing. |
| `width` | integer | NULL | - |  | `(new)` | Pixels (optional). |
| `height` | integer | NULL | - |  | `(new)` | Pixels (optional). |
| `original_name` | varchar(255) | NOT NULL | `''` |  | `(new)` | Original file name the admin uploaded (optional). |
| `created_at` | timestamp | NOT NULL | now |  |  | When the row was created (UTC). |

**Indexes:** `ix_media_files_created_at` (created_at)


## 9. Data the website collects but currently loses

> ✅ **Fixed on 23 October 2026** — the database-backed website now stores every field below. The table records what the old JSON-file version did.
>
> The forms ask visitors for the details below. The old version only sent them once in a notification email and **never saved** them. The new tables have columns for all of them (section 13).

| Form | Field(s) | What happens today | Column(s) now |
|---|---|---|---|
| Registration | School name | **Lost.** The form sends `schoolName` but the server reads `school`. | `registrations.school_name` |
| Registration | Event chosen | Emailed only | `event_ref`, `event_id` |
| Registration | Category, preferred format | Emailed only | `category`, `preferred_format` |
| Registration | Date of birth, gender, class/grade | Emailed only | `date_of_birth`, `gender`, `grade` |
| Registration | School location (schools) | Emailed only | `school_location` |
| Registration | Parent/guardian name, phone, email, relationship (under-18s) | Emailed only | `guardian_name`, `guardian_phone`, `guardian_email`, `guardian_relationship` |
| Registration | Organisation (educators, professionals, partners) | Emailed only | `organisation` |
| Registration | Full name as typed | Only split into first and last name | `full_name` |
| Registration | Consent to the Privacy Policy and Terms | Checked but never recorded | `consent_given`, `consent_at` |
| Contact | Organisation / school | Thrown away | `contact_messages.organisation` |
| Newsletter | Which form was used (newsletter, or "notify me" on the STEM Guide page) | The two cannot be told apart | `newsletter_subscribers.source` |
| Newsletter | Signing up again after unsubscribing | Creates a duplicate row | One row per email (unique), updated instead of inserted |
| Email replies | A reply that **failed** to send | Recorded as "Reply sent" | `email_status` = `sent` / `logged_only` / `failed` |

**Why it matters:** the website's Privacy Policy says that registering a participant under 18 requires a parent/guardian's details and consent. Today neither is stored anywhere. The new columns make that record possible, which matters under the Nigeria Data Protection Act 2023.

## 10. Uploaded images (file storage)

**How uploads work today:**
1. The admin uploads an image (images only, up to **12 MB**).
2. The server auto-rotates it, resizes it to at most **1800 px wide** and converts it to **JPEG (quality 82)**.
3. It is saved as `<random>.jpg` in `data/uploads/`.
4. The server returns the URL `/api/media/<file>.jpg`, which is served publicly with a 1-year cache.

**Image values in the content tables are plain text, in one of three forms:**

| The value looks like | Where the image lives | What to do |
|---|---|---|
| `/images/awards/group-winners.jpg` | Inside the website code (`public/images`) | Nothing. Leave it as is; all the starting content uses these. |
| `/api/media/mgz3k2a1-3fa9c1.jpg` | Uploaded by the admin (`data/uploads/`) | Keep it in permanent storage (see below) |
| `https://...` | Elsewhere on the internet | Nothing |

**What is needed:** a home for uploaded image files that survives redeploys. Options:
- **Supabase Storage**, **Cloudflare R2**, **AWS S3** or **Cloudinary**, using a public-read bucket
- a permanent folder on the server, if the site stays on a single Hostinger server

Record each file in `media_files`. Storing images inside the database (`bytea`/`LONGBLOB`) works but is not recommended, because it bloats backups.

**If the live site already has uploads:**
1. Copy `data/uploads/*` into the new storage.
2. Register the files with the migration tool (`--uploads-dir`, section 12).
3. Either keep the `/api/media/...` URLs, since the website can keep serving them from the new storage, or switch to the storage's public URLs. If you switch, update every content column that contains the old URLs.

## 11. Admin password and security

### The admin password (`admin_account`)

**How the password is stored:**
- The dashboard has **one password and no username**. Only a salted hash is stored.
- The hash is **PBKDF2-HMAC-SHA256 with 120,000 iterations and a 32-byte key**, written as base64url without padding.
- The salt is 16 random bytes in base64url. The UTF-8 bytes of the salt *text* are what is fed to PBKDF2.
- Passwords are Unicode-normalised (NFC) before hashing. A new password must be at least 8 characters.

**Leave the table empty when you create it.**
- While the table is empty, the website accepts the password set on the server as `ADMIN_PASSWORD`.
- If `ADMIN_PASSWORD` is not set, the website accepts a **built-in default that is written in the website code**.
- The first successful login stores the hash in this table.

> ⚠️ So before the site goes live on the new database:
> 1. Make sure the server has a strong `ADMIN_PASSWORD`.
> 2. Log in once straight away.
> 3. Change the password in **Admin → Settings**.

**Forgotten password:** delete the row, then log in with `ADMIN_PASSWORD`.

**Optional: pre-set the password yourself**, then give it to the owner securely. First generate a salt and hash:
```bash
node -e "const c=require('crypto');const pw=process.argv[1].normalize('NFC');const salt=c.randomBytes(16).toString('base64url');const hash=c.pbkdf2Sync(pw,salt,120000,32,'sha256').toString('base64url');console.log(JSON.stringify({salt,hash}))" 'A-Strong-Password-Here'
```
Then insert them:
```sql
INSERT INTO admin_account (id, password_hash, password_salt) VALUES (1, '<hash>', '<salt>');
```
This was tested: hashes made this way are accepted by the website's login.

**Other notes:**
- Login sessions are signed cookies valid for 12 hours, so there is **no sessions table**.
- The website never sends the hash to the browser. Keep it that way.

### Database security checklist

- [ ] **A dedicated database user for the website**, with only `SELECT, INSERT, UPDATE, DELETE` on these 24 tables and no `DROP`/`ALTER`. Use a separate admin user for schema changes.
- [ ] **Encrypted connections** (SSL/TLS) whenever the database is reached over the internet. Restrict network access too; on Hostinger the site connects locally.
- [ ] **Automatic daily backups**, kept for at least 30 days, plus one test restore.
- [ ] **Personal data protection.** Registrations include children's dates of birth and parents' contacts, and the Nigeria Data Protection Act 2023 applies. Limit access to people who need it, don't copy live data to test machines, and honour deletion requests. Deleting a registration also deletes its notes automatically.
- [ ] **Supabase:** run `03-supabase-security.sql`. It was tested: the public `anon` key can no longer read or write anything, and the website's server connection still works. Never put the `service_role` key in browser code.

## 12. Moving existing data from the live site

This is only needed if the website is already running and has real submissions or admin edits. Otherwise skip it and use `02-seed.sql`.

1. In the admin dashboard, go to **Settings → "Download everything (JSON)"**, or copy `data/store.json` from the server.
   > ⚠️ This file contains personal data and the admin password hash. Handle it like a password.
2. If there are uploaded images, also copy the server folder `data/uploads/`.
3. Convert the backup (Node.js 18+, nothing to install):
   ```bash
   node tools/store-json-to-sql.mjs backup.json --dialect=mysql    --uploads-dir=./uploads > import.sql
   node tools/store-json-to-sql.mjs backup.json --dialect=postgres --uploads-dir=./uploads > import.sql
   ```
4. On an **empty** database, run `01-schema.sql` and then `import.sql`, **instead of** `02-seed.sql`.
5. Read the warnings it prints, such as merged newsletter duplicates. If a value is too long for its column, the tool stops and writes nothing, so data is never cut off silently.
6. Do this at a quiet time, with no admin edits between the download and the switch-over.

**What the tool does with today's data:**

| Today (`store.json`) | Goes to |
|---|---|
| `announcement`, `hero`, `site` (+ its `offices`, `socials`, `externalLinks`) | The single-row tables and the three `site_*` lists |
| `stats`, `events`, `news`, `gallery`, `videos`, `faqs`, `testimonials`, `partners` | The table with the same purpose. Position in the list becomes `sort_order`. |
| `programmes[]` (`highlights` is text, one "Label: Value" per line) | `programmes`. `highlights` becomes a JSON array of `{label, value}`. The long-form fields come from the website code, which is built into the tool. |
| `submissions.contact[]` | `contact_messages` |
| `submissions.contact[].notes[]` | `contact_message_notes`. Notes that start with "Reply sent..." become `kind='reply'`, with the subject, body and `email_status` split out. |
| `submissions.register[]` | `registrations`. `school` → `school_name`; first + last name → `full_name`; the `notes` text → `applicant_notes`. |
| `submissions.register[].thread[]` | `registration_notes`, with the same reply detection |
| Consent on older registrations | `consent_given = TRUE`, `consent_at = created_at`. The site refused registrations without consent, so every saved one had it. |
| `submissions.newsletter[]` | `newsletter_subscribers`, one row per email (case-insensitive). The newest status wins and the earliest sign-up date is kept. |
| `admin.user` | `admin_account`, so the current admin password keeps working |
| Files in `data/uploads/` | `media_files` (with `--uploads-dir`) |

## 13. How the website will use the database

*This section is for whoever connects the website code to the database. The database person can skip it, but it explains why the tables look the way they do.*

### 13.1 Reads (public pages)

| Page / endpoint | Tables | How |
|---|---|---|
| Every page (header, footer, floating buttons) | `announcement`, `site_settings`, `site_offices`, `site_social_links`, `site_external_links` | Visible announcement (13.4); the settings row; lists by `sort_order` |
| `/` homepage | `hero_content`, `stats`, `programmes`, `events`, `testimonials`, `partners`, `news_posts`, `faqs` | The first 3 stats feed the hero; the first 4 upcoming events; the latest 3 articles |
| `/programmes`, `/programmes/<slug>` | `programmes` (+ related upcoming `events`, `faqs`) | By `sort_order`; by `slug` |
| `/events` | `events` | Upcoming (soonest first), then past (latest first); countdown to the next one |
| `/news`, `/news/<slug>` | `news_posts`, `news_categories` | All by `published_on` DESC; by `slug`, plus the 3 latest others |
| `/gallery` | `gallery_items`, `gallery_categories`, `videos` | By `sort_order` |
| `/faq`, `/contact`, `/partners`, `/about` | `faqs`; `site_*` + the first 5 `faqs`; `partners`; `stats` | By `sort_order` |
| `/register` | `programmes`, `events` | For the choice lists |
| `/sitemap.xml` | `programmes`, `news_posts` | Slugs |
| `GET /api/announcement` (public JSON, any origin) | `announcement` | Visible announcement |
| `GET /api/media/<file>` | `media_files` + storage | By `file_name` |

### 13.2 Public writes (website visitors)

**`POST /api/contact`** inserts into `contact_messages`.
- Required: name, email, category, subject, message.
- The email must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- Text is trimmed and cut to: name 120, email 200, phone 40, category 80, subject 200, message 5,000 characters.
- If the hidden `website` field is filled, it is a bot: reply OK but save nothing.
- Maximum 5 per IP per 10 minutes.
- The message is saved first, then a notification email goes to the office. If the email fails, the message is still saved.

**`POST /api/register`** inserts into `registrations`.
- Required: type, fullName, email, phone, and consent = "yes".
- The same email check and hidden-field check apply.
- Limits: fullName 120, programme 160, school 160, state/city/role 80, participants 20, notes 3,000 characters. For the new fields, use the column sizes.
- Generates the `reference` and returns it to the visitor.
- Maximum 6 per IP per 10 minutes. A notification email goes to the office.

**`POST /api/newsletter`** upserts into `newsletter_subscribers`.
- The email is lowercased; maximum 200 characters.
- Maximum 8 per IP per 10 minutes.
- If `NEWSLETTER_WEBHOOK_URL` is set, the email is also forwarded there. Otherwise the office gets a notification email.

**Form rules on `/register`** (checked in the browser):
- Students and schools must choose a programme **or** an event.
- Students need their school name and class. They also need a parent/guardian name and phone if they are under 18 or give no date of birth.
- Schools need the school name and location.
- Educators, professionals and partners need their role.

### 13.3 Admin operations (all require the admin session)

| Admin action | Endpoint today | Database work |
|---|---|---|
| Save a single-row section (announcement, hero, brand & contact) | `PUT /api/admin/content` | `UPDATE ... WHERE id = 1`. Brand & contact also saves the 3 `site_*` lists. |
| Save a list (stats, programmes, events, news, gallery, videos, FAQs, testimonials, partners) | `PUT /api/admin/content` | **In one transaction:** delete the ids that are no longer in the list, update the existing ids, insert the new ones, and set `sort_order` to each item's position. See the warnings below. |
| "Reset to defaults" | `POST /api/admin/content` | Replace that section with the starting content (the same rows as in `02-seed.sql`) |
| View the inbox | `GET /api/admin/submissions` | `SELECT ... ORDER BY created_at DESC`. Add paging and server-side search (name, email, school, reference, subject) instead of loading everything. |
| Change a status | `PATCH /api/admin/submissions` | `UPDATE ... SET status` |
| Add an internal note | `PATCH /api/admin/submissions` | `INSERT` into the notes table (`kind='note'`) |
| Reply by email | `POST /api/admin/reply` | Send the email, then `INSERT` a note (`kind='reply'`, subject, `email_status`). If the status is `new`, change it to `replied` for a contact message or `contacted` for a registration. |
| Delete a submission | `DELETE /api/admin/submissions` | `DELETE` (its notes are deleted too) |
| Toggle a newsletter subscriber | `PATCH /api/admin/submissions` | `UPDATE status` (and `unsubscribed_at`) |
| Export CSV / "Download everything (JSON)" | `GET /api/admin/export` | `SELECT`. The JSON backup includes the admin password hash, so keep it admin-only. |
| Upload an image / open the media library | `POST /api/admin/upload`, `GET /api/admin/media` | Store the file, then `INSERT` into `media_files`. The library lists `media_files` plus the site's built-in `/images`. |
| Log in / change the password | `POST /api/admin/login`, `POST /api/admin/password` | Read `admin_account`; insert the row on the first login; update it when the password changes |

Admin dashboard sections map to tables as follows: `announcement`→`announcement`, `hero`→`hero_content`, `site`→`site_settings` + the 3 `site_*` lists, `news`→`news_posts`, `gallery`→`gallery_items`. The rest (`stats`, `programmes`, `events`, `videos`, `faqs`, `testimonials`, `partners`) map to the table with the same name.

> ⚠️ **Never save a list by deleting everything and inserting it again.** Deleting programmes or events unlinks the registrations attached to them (`ON DELETE SET NULL`) and resets `created_at`. Delete only the removed ids.

> ⚠️ **On MySQL/MariaDB, do not save content lists with `INSERT ... ON DUPLICATE KEY UPDATE`.** It also fires when a *different* row has the same unique slug, and then silently overwrites that other row. Testing confirmed this. Use a plain `UPDATE` for existing ids and an `INSERT` for new ones.
> - PostgreSQL's `ON CONFLICT (id) DO UPDATE` is safe, because a slug clash raises an error.
> - For `newsletter_subscribers`, `ON DUPLICATE KEY UPDATE` is fine and intended, because email is its only unique column besides the id.

> Slugs and registration references must be unique. When a slug clashes, show the admin a friendly message. When a reference clashes, generate a new one and retry.

### 13.4 The business rules as SQL (tested on both engines)

"Today" always means the current date in UTC:
- **PostgreSQL:** `(now() AT TIME ZONE 'UTC')::date`
- **MySQL/MariaDB:** `UTC_DATE()`

In the queries below, `TODAY` stands for that expression. Placeholders are shown in each driver's usual style.

```sql
-- Visible announcement
SELECT * FROM announcement
WHERE enabled = TRUE
  AND (starts_at IS NULL OR starts_at <= TODAY)
  AND (ends_at   IS NULL OR ends_at   >= TODAY);

-- Upcoming events (soonest first) and past events (latest first)
SELECT * FROM events WHERE COALESCE(end_date, start_date) >= TODAY ORDER BY start_date;
SELECT * FROM events WHERE COALESCE(end_date, start_date) <  TODAY ORDER BY start_date DESC;

-- Latest 3 articles
SELECT * FROM news_posts ORDER BY published_on DESC LIMIT 3;

-- Inbox badges
SELECT (SELECT COUNT(*) FROM contact_messages WHERE status = 'new') AS new_messages,
       (SELECT COUNT(*) FROM registrations   WHERE status = 'new') AS new_registrations;

-- Newsletter sign-up: insert, or re-subscribe an existing email
-- PostgreSQL:
INSERT INTO newsletter_subscribers (id, email, source) VALUES ($1, lower($2), $3)
ON CONFLICT (email) DO UPDATE SET status = 'subscribed', unsubscribed_at = NULL;
-- MySQL / MariaDB:
INSERT INTO newsletter_subscribers (id, email, source) VALUES (?, LOWER(?), ?)
ON DUPLICATE KEY UPDATE status = 'subscribed', unsubscribed_at = NULL;

-- Record an email reply on a contact message (one transaction)
INSERT INTO contact_message_notes (contact_message_id, kind, reply_subject, email_status, body)
VALUES (:id, 'reply', :subject, 'sent', :message);
UPDATE contact_messages SET status = 'replied' WHERE id = :id AND status = 'new';
```

### 13.5 Server settings (environment variables)

| Variable | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | The Supabase project URL | **Set on Vercel** |
| `SUPABASE_SECRET_KEY` | Secret / service_role key used by the server to call the functions in `04-supabase-api.sql`. Never in browser code. | **Set on Vercel** (sensitive) |
| `ADMIN_SECRET` | Secret (16+ characters) that signs the login cookies | **Set on Vercel** (sensitive) |
| `ADMIN_PASSWORD` | Password accepted while `admin_account` is empty (otherwise the shipped default) | Optional |
| `RESEND_API_KEY` | Sends notification, confirmation and reply emails. Without it nothing is emailed (submissions are still saved). | Recommended |
| `CONTACT_TO_EMAIL` | Office inbox for notifications (default contact@afristemglobal.com) | Optional |
| `MAIL_FROM` | Sender address for emails | Optional |
| `NEWSLETTER_WEBHOOK_URL` | Optional: forwards newsletter sign-ups to another service | Optional |
| `NEXT_PUBLIC_SITE_URL` | Public website address (default https://afristemglobal.org) | Optional |
| `DATA_DIR` | Only for serving uploads left on the disk of an old single-server install | Legacy |

### 13.6 Related issues in the website code (fixed during the switch)

All of these were fixed when the website was connected to the database (23 October 2026):

1. **Pages that showed built-in copies** (`/about` stats, `/contact` details/offices/socials/FAQs, `/partners`, the `/register` lists, programme related events and FAQs, `sitemap.xml`, the site-wide SEO title and description) now read the database.
2. **Programmes added in the admin get their own page**, and the admin's pillar, status (open / closing soon / closed / coming soon), "show on homepage" and register-link settings are used. The long-form fields (description, objectives, pillar blurb, colour, icon) are editable in the admin.
3. **Event "Register" links use the real event slugs**; the old short codes in already-shared links are translated by the register page.
4. **The registration confirmation is accurate:** the registrant sees their reference number, and receives a confirmation email when email delivery is configured — the page only says an email was sent when one really was.
5. **Admin gaps:** all 9 news categories are offered (from `news_categories`), and the event registration deadline is editable.
6. **Data that was thrown away is stored** (section 9): every registration field, the school name, the contact form's organisation, the newsletter form used, one row per subscriber, and the real delivery result of every email reply.

## 14. Verification: how to prove it is done

Run this after `01-schema.sql` and `02-seed.sql`. It works on both engines.

```sql
SELECT 'announcement' AS table_name, COUNT(*) AS row_count FROM announcement
UNION ALL SELECT 'hero_content', COUNT(*) FROM hero_content
UNION ALL SELECT 'site_settings', COUNT(*) FROM site_settings
UNION ALL SELECT 'site_offices', COUNT(*) FROM site_offices
UNION ALL SELECT 'site_social_links', COUNT(*) FROM site_social_links
UNION ALL SELECT 'site_external_links', COUNT(*) FROM site_external_links
UNION ALL SELECT 'stats', COUNT(*) FROM stats
UNION ALL SELECT 'programmes', COUNT(*) FROM programmes
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'news_categories', COUNT(*) FROM news_categories
UNION ALL SELECT 'news_posts', COUNT(*) FROM news_posts
UNION ALL SELECT 'gallery_categories', COUNT(*) FROM gallery_categories
UNION ALL SELECT 'gallery_items', COUNT(*) FROM gallery_items
UNION ALL SELECT 'videos', COUNT(*) FROM videos
UNION ALL SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'partners', COUNT(*) FROM partners
UNION ALL SELECT 'contact_messages', COUNT(*) FROM contact_messages
UNION ALL SELECT 'contact_message_notes', COUNT(*) FROM contact_message_notes
UNION ALL SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL SELECT 'registration_notes', COUNT(*) FROM registration_notes
UNION ALL SELECT 'newsletter_subscribers', COUNT(*) FROM newsletter_subscribers
UNION ALL SELECT 'admin_account', COUNT(*) FROM admin_account
UNION ALL SELECT 'media_files', COUNT(*) FROM media_files
```

Expected results:

| Table | Rows | Table | Rows |
|---|---|---|---|
| `announcement` | 1 | `gallery_items` | 25 |
| `hero_content` | 1 | `videos` | 8 |
| `site_settings` | 1 | `faqs` | 11 |
| `site_offices` | 3 | `testimonials` | 4 |
| `site_social_links` | 5 | `partners` | 4 |
| `site_external_links` | 2 | `contact_messages` | 0 |
| `stats` | 4 | `contact_message_notes` | 0 |
| `programmes` | 4 | `registrations` | 0 |
| `events` | 7 | `registration_notes` | 0 |
| `news_categories` | 9 | `newsletter_subscribers` | 0 |
| `news_posts` | 7 | `admin_account` | 0 |
| `gallery_categories` | 8 | `media_files` | 0 |

The total is **104 rows**. The submission, admin and media tables start at 0, unless you imported a live backup.

Quick spot checks:

```sql
SELECT message FROM announcement;   -- must show "₦2,000" correctly, not "â‚¦2,000"
SELECT slug, start_date FROM events ORDER BY start_date LIMIT 3;
SELECT slug, published_on FROM news_posts ORDER BY published_on DESC LIMIT 3;
```

The ₦ check catches the most common mistake: a connection or import that does not use UTF-8 / utf8mb4.

## 15. What to send back to the site owner

Send passwords and keys through a password manager or a one-time secret link, **not** by plain email or WhatsApp.

- [ ] The engine and version, e.g. "MariaDB 10.11" or "PostgreSQL 16 on Supabase"
- [ ] The host, port and database name
- [ ] The website's database user and password (with limited rights, see section 11)
- [ ] A ready-to-use connection string, e.g. `mysql://USER:PASSWORD@HOST:3306/DBNAME` or `postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require`
- [ ] SSL requirements, and a CA certificate if the provider needs one
- [ ] Image storage details: provider, bucket name, public base URL, access key ID and secret
- [ ] The backup schedule, how long backups are kept, and how to restore one
- [ ] The output of the verification query in section 14
- [ ] Confirmation that `admin_account` is empty, or how a pre-set password was delivered

---

## Appendix A: All allowed values

**Enforced by the database**

| Column | Allowed values |
|---|---|
| `announcement.tone` | `info`, `success`, `warning`, `urgent` |
| `programmes.pillar` | `SCIENCE`, `TECHNOLOGY`, `STEM`, `CHEMISTRY` |
| `programmes.status` | `open`, `closing-soon`, `closed`, `coming-soon` |
| `events.mode` | `Physical`, `Virtual`, `Hybrid` |
| `gallery_items.span` | `''` (normal tile), `wide`, `tall` |
| `gallery_items.category` | rows of `gallery_categories`: Programmes, Competitions, Training, Workshops, Students, Schools, STEM Projects, Events |
| `news_posts.category` | rows of `news_categories`: AFRISTEM News, STEM Education, Innovation, Competitions, STEM Careers, Student Stories, School Stories, Opportunities, Resources |
| `contact_messages.status` | `new`, `in-progress`, `replied`, `closed` |
| `registrations.type` | `student`, `school`, `educator`, `professional`, `partner` |
| `registrations.status` | `new`, `contacted`, `confirmed`, `waitlist`, `declined` |
| `newsletter_subscribers.status` | `subscribed`, `unsubscribed` |
| `contact_message_notes.kind`, `registration_notes.kind` | `note`, `reply` |
| `contact_message_notes.email_status`, `registration_notes.email_status` | `sent`, `logged_only`, `failed` (NULL for plain notes) |

**Documented only (not enforced)**

| Column | Usual values |
|---|---|
| `site_social_links.icon` | `facebook`, `instagram`, `x`, `youtube`, `linkedin`, `tiktok`, `whatsapp`, `link` |
| `stats.icon` | `sparkles`, `users`, `school`, `trophy`, `flask`, `cpu`, `globe`, `star` |
| `programmes.accent` | `sun`, `sky`, `mint`, `violet`, `coral` |
| `programmes.icon` | `spell`, `code`, `trophy`, `flask` |
| `contact_messages.category` | Student, Parent, School, Educator, STEM Professional, Organization, Partner, General Enquiry |
| `registrations.category` | Primary (Junior), Primary (Senior), Junior Secondary, Senior Secondary, Educator / Adult |
| `registrations.preferred_format` | Physical, Online, Hybrid |
| `registrations.gender` | Female, Male, `''` (prefer not to say) |
| `registrations.guardian_relationship` | Mother, Father, Guardian, Teacher, Other |
| `newsletter_subscribers.source` | `newsletter`, `stem-guide`, `import`, `admin` |
| `media_files.storage` | `local`, `s3`, `r2`, `supabase`, `cloudinary`, `database` |
| `videos.category` | Free text. Today: Bootcamp, Competition, Inside AFRISTEM, Highlights |
| `faqs.category` | Free text. Today: General |

Registration type labels shown on the form:

| Value | Label |
|---|---|
| `student` | Student / Participant |
| `school` | School (bulk registration) |
| `educator` | Educator |
| `professional` | STEM Professional |
| `partner` | Organisation / Partner |

## Appendix B: What each public form sends

These are the exact JSON bodies the website's forms send, with the field names as sent. The hidden `website` field is an anti-spam trap; real visitors always leave it empty.

**Contact form**: `POST /api/contact`
```json
{ "name": "Adaeze Okafor", "email": "adaeze@example.com", "phone": "+234 800 000 0000",
  "organisation": "Bright Future Academy", "category": "School",
  "subject": "Partnership enquiry", "message": "Hello...", "website": "" }
```

**Registration form**: `POST /api/register`. Every field is always sent, left empty when it does not apply.
```json
{ "type": "student", "programme": "stem-kids-championship", "event": "",
  "category": "Junior Secondary", "format": "Physical",
  "fullName": "Emeka John Obi", "dob": "2012-05-01", "gender": "Male",
  "phone": "+234 803 000 0000", "email": "emeka@example.com",
  "schoolName": "Unity School", "grade": "JSS 2", "schoolLocation": "Abuja, FCT, Nigeria",
  "guardianName": "Mrs Obi", "guardianPhone": "+234 805 000 0000",
  "guardianEmail": "obi@example.com", "guardianRelationship": "Mother",
  "role": "", "organisation": "", "notes": "", "consent": "yes", "website": "" }
```
The response is `{ "ok": true, "reference": "AFR-2026-1F4C9" }`.

Registration field → column:

| Form field | Column |
|---|---|
| `type` | `type` |
| `programme` | `programme_slug` (+ `programme_id`) |
| `event` | `event_ref` (+ `event_id`) |
| `category` | `category` |
| `format` | `preferred_format` |
| `fullName` | `full_name` (+ `first_name`, `last_name`) |
| `dob` | `date_of_birth` |
| `gender` | `gender` |
| `phone` | `phone` |
| `email` | `email` |
| `schoolName` | `school_name` |
| `grade` | `grade` |
| `schoolLocation` | `school_location` |
| `guardianName` | `guardian_name` |
| `guardianPhone` | `guardian_phone` |
| `guardianEmail` | `guardian_email` |
| `guardianRelationship` | `guardian_relationship` |
| `role` | `role` |
| `organisation` | `organisation` |
| `notes` | `applicant_notes` |
| `consent` | `consent_given` (+ `consent_at`) |
| `website` | not stored |

**Newsletter box and STEM Guide "notify me" box**: `POST /api/newsletter`
```json
{ "email": "you@school.edu.ng" }
```

## Appendix C: Content that stays in the code (optional)

The items below are fixed in the website code and cannot be edited in the admin today, so they do **not** need the database. They are listed so nothing is missing. `data/hardcoded-content.json` holds their current values in case the owner later wants them editable. If so, they would follow the same conventions: an id, the fields, `sort_order` and timestamps.

- Company facts: the legal name "AFRISTEM GLOBAL", RC 9452641, the website address.
- The Services page (6 services, each with bullet points), "Why AFRISTEM" (6 items), "Our approach" (5) and "What we believe" (4).
- The audience pages: Schools, Educators, STEM Professionals.
- The Prime STEM Nigeria programmes: Annual National Science Championship, Laptop for Schools.
- The navigation menu, footer links, registration types and contact categories.
- The Digital Science School page, the STEM Guide for Schools page, and the Privacy, Terms and Cookies pages.

## Appendix D: Future features (not needed now)

The website's roadmap mentions:
- student and teacher accounts
- online exams (CBT) and certificates
- a learning platform
- an equipment shop and memberships
- online payments (Paystack/Flutterwave)

None of these exist yet, so no tables are included. The design leaves room for them:
- A future `users` table can be linked from `registrations` with a nullable `user_id`.
- Payments would go in a `payments` table linked to `registrations`.
- School bulk registrations could get a `registration_participants` child table.
- `admin_account` would become `admin_users` (with email and role) if more than one admin is needed.
