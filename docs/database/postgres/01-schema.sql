-- =====================================================================
--  AFRISTEM Global website - DATABASE SCHEMA
--  Engine : PostgreSQL 14 or newer (Supabase, Neon, Railway, Render, AWS RDS, a VPS...)
--  Run    : psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f 01-schema.sql   (or paste into the Supabase SQL editor)
--  Next   : run 02-seed.sql (initial website content)
--  Tables : 24. Every table and column is explained in ../README.md
--  Generated from the website source code - do not edit by hand.
-- =====================================================================

-- To start again from scratch (DESTROYS ALL DATA) uncomment the next line:
-- DROP TABLE IF EXISTS media_files, admin_account, newsletter_subscribers, registration_notes, registrations, contact_message_notes, contact_messages, partners, testimonials, faqs, videos, gallery_items, gallery_categories, news_posts, news_categories, events, programmes, stats, site_external_links, site_social_links, site_offices, site_settings, hero_content, announcement CASCADE;

BEGIN;

SET client_encoding = 'UTF8';

-- Keeps every updated_at column current on UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- A. SITE-WIDE SETTINGS
-- =====================================================================

-- ---------------------------------------------------------------------
-- announcement: Announcement bar
--   The coloured strip at the very top of every page (e.g. 'Registration is open').
--   Written by: Admin > Announcement
--   Rows: Exactly 1 row
-- ---------------------------------------------------------------------
CREATE TABLE announcement (
  id          smallint       NOT NULL  DEFAULT 1,
  enabled     boolean        NOT NULL  DEFAULT true,
  tone        varchar(10)    NOT NULL  DEFAULT 'info',
  label       varchar(60)    NOT NULL  DEFAULT '',
  message     varchar(500)   NOT NULL  DEFAULT '',
  href        varchar(1024)  NOT NULL  DEFAULT '',
  link_label  varchar(80)    NOT NULL  DEFAULT '',
  starts_at   date           NULL,
  ends_at     date           NULL,
  updated_at  timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_announcement PRIMARY KEY (id),
  CONSTRAINT ck_announcement_singleton CHECK (id = 1),
  CONSTRAINT ck_announcement_tone CHECK (tone IN ('info', 'success', 'warning', 'urgent'))
);
CREATE TRIGGER trg_announcement_updated_at BEFORE UPDATE ON announcement
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE announcement IS 'Announcement bar: The coloured strip at the very top of every page (e.g. ''Registration is open'').';
COMMENT ON COLUMN announcement.id IS 'Always 1 - this table holds exactly one row.';
COMMENT ON COLUMN announcement.enabled IS 'Show the bar on the site.';
COMMENT ON COLUMN announcement.tone IS 'Colour of the bar. Allowed: info, success, warning, urgent.';
COMMENT ON COLUMN announcement.label IS 'Small badge text before the message, e.g. ''5th Edition''.';
COMMENT ON COLUMN announcement.message IS 'The announcement text.';
COMMENT ON COLUMN announcement.href IS 'Where the link goes, e.g. /register.';
COMMENT ON COLUMN announcement.link_label IS 'Link text. The link only shows when both href and link_label are filled.';
COMMENT ON COLUMN announcement.starts_at IS '''Hide until'' date. NULL = no start limit.';
COMMENT ON COLUMN announcement.ends_at IS '''Hide after'' date. The bar still shows for the whole of this day. NULL = no end limit.';
COMMENT ON COLUMN announcement.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- hero_content: Homepage hero
--   Headline, animated words, buttons and photos at the top of the homepage.
--   Written by: Admin > Homepage hero
--   Rows: Exactly 1 row
-- ---------------------------------------------------------------------
CREATE TABLE hero_content (
  id                       smallint       NOT NULL  DEFAULT 1,
  badge_label              varchar(60)    NOT NULL  DEFAULT '',
  badge_text               varchar(255)   NOT NULL  DEFAULT '',
  badge_href               varchar(1024)  NOT NULL  DEFAULT '',
  headline                 varchar(500)   NOT NULL  DEFAULT '',
  rotating_words           jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  subheading               text           NOT NULL  DEFAULT '',
  primary_cta_label        varchar(80)    NOT NULL  DEFAULT '',
  primary_cta_href         varchar(1024)  NOT NULL  DEFAULT '',
  secondary_cta_label      varchar(80)    NOT NULL  DEFAULT '',
  secondary_cta_href       varchar(1024)  NOT NULL  DEFAULT '',
  background_image         varchar(1024)  NOT NULL  DEFAULT '',
  feature_image            varchar(1024)  NOT NULL  DEFAULT '',
  feature_eyebrow          varchar(255)   NOT NULL  DEFAULT '',
  feature_caption          varchar(255)   NOT NULL  DEFAULT '',
  secondary_image          varchar(1024)  NOT NULL  DEFAULT '',
  secondary_image_caption  varchar(255)   NOT NULL  DEFAULT '',
  updated_at               timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_hero_content PRIMARY KEY (id),
  CONSTRAINT ck_hero_content_singleton CHECK (id = 1),
  CONSTRAINT ck_hero_content_rotating_words_array CHECK (jsonb_typeof(rotating_words) = 'array')
);
CREATE TRIGGER trg_hero_content_updated_at BEFORE UPDATE ON hero_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE hero_content IS 'Homepage hero: Headline, animated words, buttons and photos at the top of the homepage.';
COMMENT ON COLUMN hero_content.id IS 'Always 1 - this table holds exactly one row.';
COMMENT ON COLUMN hero_content.badge_label IS 'Small pill label, e.g. ''New''.';
COMMENT ON COLUMN hero_content.badge_text IS 'Text next to the pill.';
COMMENT ON COLUMN hero_content.badge_href IS 'Where the badge links to.';
COMMENT ON COLUMN hero_content.headline IS 'First part of the big heading. The rotating word is shown after it.';
COMMENT ON COLUMN hero_content.rotating_words IS 'Words that animate after the headline, in display order.';
COMMENT ON COLUMN hero_content.subheading IS 'Paragraph under the headline.';
COMMENT ON COLUMN hero_content.primary_cta_label IS 'Main button text.';
COMMENT ON COLUMN hero_content.primary_cta_href IS 'Main button link.';
COMMENT ON COLUMN hero_content.secondary_cta_label IS 'Second button text.';
COMMENT ON COLUMN hero_content.secondary_cta_href IS 'Second button link.';
COMMENT ON COLUMN hero_content.background_image IS 'Background photo (image path/URL).';
COMMENT ON COLUMN hero_content.feature_image IS 'Main feature photo (image path/URL).';
COMMENT ON COLUMN hero_content.feature_eyebrow IS 'Small label printed over the feature photo.';
COMMENT ON COLUMN hero_content.feature_caption IS 'Caption under the feature photo.';
COMMENT ON COLUMN hero_content.secondary_image IS 'Floating second photo (desktop only).';
COMMENT ON COLUMN hero_content.secondary_image_caption IS 'Caption for the floating photo.';
COMMENT ON COLUMN hero_content.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- site_settings: Brand and contact details
--   Organisation name, contact numbers and registration notes used across the site and in emails.
--   Written by: Admin > Brand & contact
--   Rows: Exactly 1 row
-- ---------------------------------------------------------------------
CREATE TABLE site_settings (
  id                   smallint      NOT NULL  DEFAULT 1,
  name                 varchar(120)  NOT NULL  DEFAULT '',
  tagline              varchar(255)  NOT NULL  DEFAULT '',
  description          text          NOT NULL  DEFAULT '',
  email                varchar(200)  NOT NULL  DEFAULT '',
  primary_phone        varchar(40)   NOT NULL  DEFAULT '',
  whatsapp             varchar(40)   NOT NULL  DEFAULT '',
  secondary_phone      varchar(40)   NOT NULL  DEFAULT '',
  address              varchar(500)  NOT NULL  DEFAULT '',
  registration_note    text          NOT NULL  DEFAULT '',
  registration_opens   date          NULL,
  registration_closes  date          NULL,
  footer_note          varchar(500)  NOT NULL  DEFAULT '',
  updated_at           timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_site_settings PRIMARY KEY (id),
  CONSTRAINT ck_site_settings_singleton CHECK (id = 1)
);
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE site_settings IS 'Brand and contact details: Organisation name, contact numbers and registration notes used across the site and in emails.';
COMMENT ON COLUMN site_settings.id IS 'Always 1 - this table holds exactly one row.';
COMMENT ON COLUMN site_settings.name IS 'Organisation name, e.g. AFRISTEM.';
COMMENT ON COLUMN site_settings.tagline IS 'Short tagline.';
COMMENT ON COLUMN site_settings.description IS 'Meta description / short ''about'' text.';
COMMENT ON COLUMN site_settings.email IS 'Public contact email.';
COMMENT ON COLUMN site_settings.primary_phone IS 'Main phone (header, footer, call button).';
COMMENT ON COLUMN site_settings.whatsapp IS 'WhatsApp number. The site keeps only the digits to build the wa.me link.';
COMMENT ON COLUMN site_settings.secondary_phone IS 'Second phone number.';
COMMENT ON COLUMN site_settings.address IS 'Head office address (one line).';
COMMENT ON COLUMN site_settings.registration_note IS 'Note shown on the registration page.';
COMMENT ON COLUMN site_settings.registration_opens IS 'Registration opening date. NULL = not set.';
COMMENT ON COLUMN site_settings.registration_closes IS 'Registration closing date. NULL = not set.';
COMMENT ON COLUMN site_settings.footer_note IS 'Small line in the footer.';
COMMENT ON COLUMN site_settings.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- site_offices: Offices
--   Office addresses listed in the footer and on the contact page.
--   Written by: Admin > Brand & contact > Offices
--   Rows: 3 today (Abakaliki head office, Abuja, Lagos)
-- ---------------------------------------------------------------------
CREATE TABLE site_offices (
  id          varchar(100)  NOT NULL,
  name        varchar(160)  NOT NULL  DEFAULT '',
  city        varchar(120)  NOT NULL  DEFAULT '',
  address     varchar(500)  NOT NULL  DEFAULT '',
  phone       varchar(40)   NOT NULL  DEFAULT '',
  map_query   varchar(500)  NOT NULL  DEFAULT '',
  sort_order  integer       NOT NULL  DEFAULT 0,
  created_at  timestamptz   NOT NULL  DEFAULT now(),
  updated_at  timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_site_offices PRIMARY KEY (id)
);
CREATE INDEX ix_site_offices_sort_order ON site_offices (sort_order);
CREATE TRIGGER trg_site_offices_updated_at BEFORE UPDATE ON site_offices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE site_offices IS 'Offices: Office addresses listed in the footer and on the contact page.';
COMMENT ON COLUMN site_offices.id IS 'Text id, e.g. ''abakaliki'', or generated ''office-xxxxxxx''.';
COMMENT ON COLUMN site_offices.name IS 'Office display name, e.g. ''South East Nigeria Office''. Shown on the contact page (the city is used when empty).';
COMMENT ON COLUMN site_offices.city IS 'City, e.g. Abakaliki.';
COMMENT ON COLUMN site_offices.address IS 'Full address (one line).';
COMMENT ON COLUMN site_offices.phone IS 'Office phone.';
COMMENT ON COLUMN site_offices.map_query IS 'Text used for the Google Maps embed on the contact page.';
COMMENT ON COLUMN site_offices.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN site_offices.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN site_offices.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- site_social_links: Social media links
--   Social icons in the footer and contact page.
--   Written by: Admin > Brand & contact > Social links
--   Rows: 5 today
-- ---------------------------------------------------------------------
CREATE TABLE site_social_links (
  id          varchar(100)   NOT NULL,
  label       varchar(80)    NOT NULL  DEFAULT '',
  href        varchar(1024)  NOT NULL  DEFAULT '',
  icon        varchar(20)    NOT NULL  DEFAULT 'link',
  sort_order  integer        NOT NULL  DEFAULT 0,
  created_at  timestamptz    NOT NULL  DEFAULT now(),
  updated_at  timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_site_social_links PRIMARY KEY (id)
);
CREATE INDEX ix_site_social_links_sort_order ON site_social_links (sort_order);
CREATE TRIGGER trg_site_social_links_updated_at BEFORE UPDATE ON site_social_links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE site_social_links IS 'Social media links: Social icons in the footer and contact page.';
COMMENT ON COLUMN site_social_links.id IS 'Text id, e.g. ''facebook'', or generated ''social-xxxxxxx''.';
COMMENT ON COLUMN site_social_links.label IS 'Name, e.g. Facebook.';
COMMENT ON COLUMN site_social_links.href IS 'Profile URL.';
COMMENT ON COLUMN site_social_links.icon IS 'Which icon to draw.';
COMMENT ON COLUMN site_social_links.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN site_social_links.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN site_social_links.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- site_external_links: External (sister) sites
--   Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer.
--   Written by: Admin > Brand & contact > External sites
--   Rows: 2 today
-- ---------------------------------------------------------------------
CREATE TABLE site_external_links (
  id           varchar(100)   NOT NULL,
  label        varchar(160)   NOT NULL  DEFAULT '',
  href         varchar(1024)  NOT NULL  DEFAULT '',
  description  text           NOT NULL  DEFAULT '',
  sort_order   integer        NOT NULL  DEFAULT 0,
  created_at   timestamptz    NOT NULL  DEFAULT now(),
  updated_at   timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_site_external_links PRIMARY KEY (id)
);
CREATE INDEX ix_site_external_links_sort_order ON site_external_links (sort_order);
CREATE TRIGGER trg_site_external_links_updated_at BEFORE UPDATE ON site_external_links
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE site_external_links IS 'External (sister) sites: Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer.';
COMMENT ON COLUMN site_external_links.id IS 'Text id, e.g. ''prime-stem'', or generated ''ext-xxxxxxx''.';
COMMENT ON COLUMN site_external_links.label IS 'Link text.';
COMMENT ON COLUMN site_external_links.href IS 'Full URL (opens in a new tab).';
COMMENT ON COLUMN site_external_links.description IS 'Short description.';
COMMENT ON COLUMN site_external_links.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN site_external_links.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN site_external_links.updated_at IS 'Last change (UTC). Maintained automatically.';

-- =====================================================================
-- B. WEBSITE CONTENT (EDITED IN THE ADMIN DASHBOARD)
-- =====================================================================

-- ---------------------------------------------------------------------
-- stats: Impact statistics
--   The big numbers (students reached, schools, partners...).
--   Written by: Admin > Statistics
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE stats (
  id          varchar(100)  NOT NULL,
  value       varchar(40)   NOT NULL  DEFAULT '',
  label       varchar(120)  NOT NULL  DEFAULT '',
  icon        varchar(30)   NOT NULL  DEFAULT 'sparkles',
  sort_order  integer       NOT NULL  DEFAULT 0,
  created_at  timestamptz   NOT NULL  DEFAULT now(),
  updated_at  timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_stats PRIMARY KEY (id)
);
CREATE INDEX ix_stats_sort_order ON stats (sort_order);
CREATE TRIGGER trg_stats_updated_at BEFORE UPDATE ON stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE stats IS 'Impact statistics: The big numbers (students reached, schools, partners...).';
COMMENT ON COLUMN stats.id IS 'e.g. ''stat-1''.';
COMMENT ON COLUMN stats.value IS 'Display text, e.g. ''5,867+''. The site animates the leading number and keeps the rest as a suffix.';
COMMENT ON COLUMN stats.label IS 'e.g. ''Students Reached''.';
COMMENT ON COLUMN stats.icon IS 'Icon name (stored, not displayed yet).';
COMMENT ON COLUMN stats.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN stats.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN stats.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- programmes: Flagship programmes
--   SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>.
--   Written by: Admin > Programmes
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE programmes (
  id                 varchar(100)   NOT NULL,
  slug               varchar(160)   NOT NULL  DEFAULT '',
  name               varchar(200)   NOT NULL  DEFAULT '',
  subtitle           varchar(255)   NOT NULL  DEFAULT '',
  tagline            varchar(255)   NOT NULL  DEFAULT '',
  short_description  text           NOT NULL  DEFAULT '',
  eligibility        text           NOT NULL  DEFAULT '',
  format             varchar(255)   NOT NULL  DEFAULT '',
  age_range          varchar(120)   NOT NULL  DEFAULT '',
  image              varchar(1024)  NOT NULL  DEFAULT '',
  image_alt          varchar(255)   NOT NULL  DEFAULT '',
  pillar             varchar(20)    NOT NULL  DEFAULT 'STEM',
  cta_label          varchar(120)   NOT NULL  DEFAULT 'Register interest',
  highlights         jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  prize_note         varchar(500)   NOT NULL  DEFAULT '',
  poster             varchar(1024)  NOT NULL  DEFAULT '',
  register_href      varchar(1024)  NOT NULL  DEFAULT '/register',
  featured           boolean        NOT NULL  DEFAULT true,
  status             varchar(20)    NOT NULL  DEFAULT 'open',
  pillar_blurb       varchar(255)   NOT NULL  DEFAULT '',
  description        jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  objectives         jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  accent             varchar(10)    NOT NULL  DEFAULT 'sun',
  icon               varchar(10)    NOT NULL  DEFAULT 'trophy',
  sort_order         integer        NOT NULL  DEFAULT 0,
  created_at         timestamptz    NOT NULL  DEFAULT now(),
  updated_at         timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_programmes PRIMARY KEY (id),
  CONSTRAINT uq_programmes_slug UNIQUE (slug),
  CONSTRAINT ck_programmes_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_programmes_pillar CHECK (pillar IN ('SCIENCE', 'TECHNOLOGY', 'STEM', 'CHEMISTRY')),
  CONSTRAINT ck_programmes_highlights_array CHECK (jsonb_typeof(highlights) = 'array'),
  CONSTRAINT ck_programmes_status CHECK (status IN ('open', 'closing-soon', 'closed', 'coming-soon')),
  CONSTRAINT ck_programmes_description_array CHECK (jsonb_typeof(description) = 'array'),
  CONSTRAINT ck_programmes_objectives_array CHECK (jsonb_typeof(objectives) = 'array')
);
CREATE INDEX ix_programmes_sort_order ON programmes (sort_order);
CREATE TRIGGER trg_programmes_updated_at BEFORE UPDATE ON programmes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE programmes IS 'Flagship programmes: SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>.';
COMMENT ON COLUMN programmes.id IS 'Seed rows use the slug as id; admin-created rows get ''prog-xxxxxxx''.';
COMMENT ON COLUMN programmes.slug IS 'URL part: /programmes/<slug>. Unique, must not be empty.';
COMMENT ON COLUMN programmes.name IS 'Programme name.';
COMMENT ON COLUMN programmes.subtitle IS 'e.g. ''Science Spelling Bee''.';
COMMENT ON COLUMN programmes.tagline IS 'Short slogan.';
COMMENT ON COLUMN programmes.short_description IS 'One-line summary used on cards.';
COMMENT ON COLUMN programmes.eligibility IS 'Who can take part.';
COMMENT ON COLUMN programmes.format IS 'Structure, e.g. ''School rounds > Regional finals > Grand finale''.';
COMMENT ON COLUMN programmes.age_range IS 'Age/class range, e.g. ''Ages 6 - 14''.';
COMMENT ON COLUMN programmes.image IS 'Main image (path/URL).';
COMMENT ON COLUMN programmes.image_alt IS 'Image description for screen readers.';
COMMENT ON COLUMN programmes.pillar IS 'Which STEM pillar the programme represents. Allowed: SCIENCE, TECHNOLOGY, STEM, CHEMISTRY.';
COMMENT ON COLUMN programmes.cta_label IS 'Button text.';
COMMENT ON COLUMN programmes.highlights IS 'Key facts, e.g. [{"label":"Exam date","value":"November 14, 2026"}]. The admin screen edits them as one ''Label: Value'' per line.';
COMMENT ON COLUMN programmes.prize_note IS 'Optional headline prize line. Empty = none.';
COMMENT ON COLUMN programmes.poster IS 'Optional full poster image. Empty = none.';
COMMENT ON COLUMN programmes.register_href IS 'Where the register button goes.';
COMMENT ON COLUMN programmes.featured IS '''Show on homepage''.';
COMMENT ON COLUMN programmes.status IS 'Registration status. Allowed: open, closing-soon, closed, coming-soon.';
COMMENT ON COLUMN programmes.pillar_blurb IS 'One line describing the pillar.';
COMMENT ON COLUMN programmes.description IS 'Long description paragraphs for the programme page, in order.';
COMMENT ON COLUMN programmes.objectives IS 'Bullet list of objectives, in order.';
COMMENT ON COLUMN programmes.accent IS 'Colour theme of the programme page.';
COMMENT ON COLUMN programmes.icon IS 'Icon shown on the programme card.';
COMMENT ON COLUMN programmes.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN programmes.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN programmes.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- events: Events
--   Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown.
--   Written by: Admin > Events
--   Rows: 7 today
-- ---------------------------------------------------------------------
CREATE TABLE events (
  id             varchar(100)   NOT NULL,
  slug           varchar(160)   NOT NULL  DEFAULT '',
  title          varchar(255)   NOT NULL  DEFAULT '',
  start_date     date           NOT NULL,
  end_date       date           NULL,
  display_date   varchar(120)   NOT NULL  DEFAULT '',
  location       varchar(255)   NOT NULL  DEFAULT '',
  mode           varchar(10)    NOT NULL  DEFAULT 'Physical',
  description    text           NOT NULL  DEFAULT '',
  deadline       varchar(120)   NOT NULL  DEFAULT '',
  register_href  varchar(1024)  NOT NULL  DEFAULT '/register',
  tag            varchar(80)    NOT NULL  DEFAULT '',
  image          varchar(1024)  NOT NULL  DEFAULT '',
  sort_order     integer        NOT NULL  DEFAULT 0,
  created_at     timestamptz    NOT NULL  DEFAULT now(),
  updated_at     timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_events PRIMARY KEY (id),
  CONSTRAINT uq_events_slug UNIQUE (slug),
  CONSTRAINT ck_events_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_events_mode CHECK (mode IN ('Physical', 'Virtual', 'Hybrid'))
);
CREATE INDEX ix_events_start_date ON events (start_date);
CREATE INDEX ix_events_sort_order ON events (sort_order);
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE events IS 'Events: Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown.';
COMMENT ON COLUMN events.id IS 'Seed rows: ''event-<slug>''; admin-created: ''event-xxxxxxx''.';
COMMENT ON COLUMN events.slug IS 'Unique identifier text. The registration form sends it as the chosen event.';
COMMENT ON COLUMN events.title IS 'Event name.';
COMMENT ON COLUMN events.start_date IS 'Start date. Used for sorting, the countdown and the upcoming/past split. Required.';
COMMENT ON COLUMN events.end_date IS 'End date for multi-day events. NULL = single day.';
COMMENT ON COLUMN events.display_date IS 'Human-readable date shown on the site, e.g. ''Oct 19 - 30, 2026''.';
COMMENT ON COLUMN events.location IS 'Venue or ''Online (Zoom)''.';
COMMENT ON COLUMN events.mode IS 'Physical, Virtual or Hybrid. Allowed: Physical, Virtual, Hybrid.';
COMMENT ON COLUMN events.description IS 'Event description.';
COMMENT ON COLUMN events.deadline IS 'Registration deadline as display text, e.g. ''Oct 28, 2026''. Empty = none.';
COMMENT ON COLUMN events.register_href IS 'Where the Register button goes.';
COMMENT ON COLUMN events.tag IS 'Label pill, e.g. ''Awards'', ''Educators''.';
COMMENT ON COLUMN events.image IS 'Event image (path/URL).';
COMMENT ON COLUMN events.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN events.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN events.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- news_categories: News categories (lookup)
--   The fixed list of article categories, with the descriptions shown on the news page filters.
--   Written by: Seed only (no admin screen yet)
--   Rows: 9
-- ---------------------------------------------------------------------
CREATE TABLE news_categories (
  name         varchar(60)   NOT NULL,
  description  varchar(255)  NOT NULL  DEFAULT '',
  sort_order   integer       NOT NULL  DEFAULT 0,
  CONSTRAINT pk_news_categories PRIMARY KEY (name)
);
CREATE INDEX ix_news_categories_sort_order ON news_categories (sort_order);
COMMENT ON TABLE news_categories IS 'News categories (lookup): The fixed list of article categories, with the descriptions shown on the news page filters.';
COMMENT ON COLUMN news_categories.name IS 'Category name, e.g. ''STEM Education''. Referenced by news_posts.category.';
COMMENT ON COLUMN news_categories.description IS 'Short explanation shown on the news page.';
COMMENT ON COLUMN news_categories.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';

-- ---------------------------------------------------------------------
-- news_posts: News articles
--   News and blog articles. Each has a page at /news/<slug>.
--   Written by: Admin > News
--   Rows: 7 today
-- ---------------------------------------------------------------------
CREATE TABLE news_posts (
  id            varchar(100)   NOT NULL,
  slug          varchar(160)   NOT NULL  DEFAULT '',
  title         varchar(300)   NOT NULL  DEFAULT '',
  excerpt       text           NOT NULL  DEFAULT '',
  category      varchar(60)    NOT NULL  DEFAULT 'AFRISTEM News',
  published_on  date           NOT NULL,
  display_date  varchar(120)   NOT NULL  DEFAULT '',
  read_time     varchar(40)    NOT NULL  DEFAULT '3 min read',
  image         varchar(1024)  NOT NULL  DEFAULT '',
  author        varchar(120)   NOT NULL  DEFAULT 'AFRISTEM Team',
  body          jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  sort_order    integer        NOT NULL  DEFAULT 0,
  created_at    timestamptz    NOT NULL  DEFAULT now(),
  updated_at    timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_news_posts PRIMARY KEY (id),
  CONSTRAINT uq_news_posts_slug UNIQUE (slug),
  CONSTRAINT ck_news_posts_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_news_posts_body_array CHECK (jsonb_typeof(body) = 'array'),
  CONSTRAINT fk_news_posts_category FOREIGN KEY (category) REFERENCES news_categories (name) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX ix_news_posts_published_on ON news_posts (published_on);
CREATE INDEX ix_news_posts_category ON news_posts (category);
CREATE INDEX ix_news_posts_sort_order ON news_posts (sort_order);
CREATE TRIGGER trg_news_posts_updated_at BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE news_posts IS 'News articles: News and blog articles. Each has a page at /news/<slug>.';
COMMENT ON COLUMN news_posts.id IS 'Seed rows: ''post-<slug>''; admin-created: ''post-xxxxxxx''.';
COMMENT ON COLUMN news_posts.slug IS 'URL part: /news/<slug>. Unique, must not be empty.';
COMMENT ON COLUMN news_posts.title IS 'Headline.';
COMMENT ON COLUMN news_posts.excerpt IS 'Short summary for cards and SEO.';
COMMENT ON COLUMN news_posts.category IS 'Must be one of news_categories.name.';
COMMENT ON COLUMN news_posts.published_on IS 'Publication date. All lists are sorted by this, newest first. Required.';
COMMENT ON COLUMN news_posts.display_date IS 'Human-readable date, e.g. ''Oct 1, 2026''.';
COMMENT ON COLUMN news_posts.read_time IS 'e.g. ''4 min read''.';
COMMENT ON COLUMN news_posts.image IS 'Cover image (path/URL).';
COMMENT ON COLUMN news_posts.author IS 'Author name.';
COMMENT ON COLUMN news_posts.body IS 'Article paragraphs, in order (one string per paragraph).';
COMMENT ON COLUMN news_posts.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN news_posts.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN news_posts.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- gallery_categories: Gallery categories (lookup)
--   The fixed list of photo categories used as filter buttons on the gallery.
--   Written by: Seed only (no admin screen yet)
--   Rows: 8
-- ---------------------------------------------------------------------
CREATE TABLE gallery_categories (
  name        varchar(60)  NOT NULL,
  sort_order  integer      NOT NULL  DEFAULT 0,
  CONSTRAINT pk_gallery_categories PRIMARY KEY (name)
);
CREATE INDEX ix_gallery_categories_sort_order ON gallery_categories (sort_order);
COMMENT ON TABLE gallery_categories IS 'Gallery categories (lookup): The fixed list of photo categories used as filter buttons on the gallery.';
COMMENT ON COLUMN gallery_categories.name IS 'Category name, e.g. ''Competitions''. Referenced by gallery_items.category.';
COMMENT ON COLUMN gallery_categories.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';

-- ---------------------------------------------------------------------
-- gallery_items: Gallery photos
--   Photos in the gallery mosaic.
--   Written by: Admin > Gallery
--   Rows: 25 today
-- ---------------------------------------------------------------------
CREATE TABLE gallery_items (
  id          varchar(100)   NOT NULL,
  src         varchar(1024)  NOT NULL  DEFAULT '',
  alt         varchar(500)   NOT NULL  DEFAULT '',
  caption     varchar(255)   NOT NULL  DEFAULT '',
  category    varchar(60)    NOT NULL  DEFAULT 'Events',
  span        varchar(4)     NOT NULL  DEFAULT '',
  sort_order  integer        NOT NULL  DEFAULT 0,
  created_at  timestamptz    NOT NULL  DEFAULT now(),
  updated_at  timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_gallery_items PRIMARY KEY (id),
  CONSTRAINT ck_gallery_items_span CHECK (span IN ('', 'wide', 'tall')),
  CONSTRAINT fk_gallery_items_category FOREIGN KEY (category) REFERENCES gallery_categories (name) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX ix_gallery_items_category ON gallery_items (category);
CREATE INDEX ix_gallery_items_sort_order ON gallery_items (sort_order);
CREATE TRIGGER trg_gallery_items_updated_at BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE gallery_items IS 'Gallery photos: Photos in the gallery mosaic.';
COMMENT ON COLUMN gallery_items.id IS 'Seed rows: ''photo-<n>''; admin-created: ''photo-xxxxxxx''.';
COMMENT ON COLUMN gallery_items.src IS 'Image path/URL. Should not be empty.';
COMMENT ON COLUMN gallery_items.alt IS 'Describes the photo for screen readers.';
COMMENT ON COLUMN gallery_items.caption IS 'Caption shown on hover and in the lightbox.';
COMMENT ON COLUMN gallery_items.category IS 'Must be one of gallery_categories.name.';
COMMENT ON COLUMN gallery_items.span IS 'Tile shape in the mosaic: '''' = normal, ''wide'' = two columns, ''tall'' = two rows. Allowed: (empty), wide, tall.';
COMMENT ON COLUMN gallery_items.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN gallery_items.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN gallery_items.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- videos: Videos
--   YouTube videos shown on the gallery page.
--   Written by: Admin > Videos
--   Rows: 8 today
-- ---------------------------------------------------------------------
CREATE TABLE videos (
  id           varchar(100)   NOT NULL,
  title        varchar(255)   NOT NULL  DEFAULT '',
  description  text           NOT NULL  DEFAULT '',
  youtube_id   varchar(255)   NOT NULL  DEFAULT '',
  thumb        varchar(1024)  NOT NULL  DEFAULT '',
  category     varchar(80)    NOT NULL  DEFAULT 'Highlights',
  featured     boolean        NOT NULL  DEFAULT false,
  sort_order   integer        NOT NULL  DEFAULT 0,
  created_at   timestamptz    NOT NULL  DEFAULT now(),
  updated_at   timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_videos PRIMARY KEY (id)
);
CREATE INDEX ix_videos_sort_order ON videos (sort_order);
CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE videos IS 'Videos: YouTube videos shown on the gallery page.';
COMMENT ON COLUMN videos.id IS 'e.g. ''bootcamp-2023'' or ''video-xxxxxxx''.';
COMMENT ON COLUMN videos.title IS 'Video title.';
COMMENT ON COLUMN videos.description IS 'Short description.';
COMMENT ON COLUMN videos.youtube_id IS 'The 11-character YouTube ID or a full YouTube link (watch, youtu.be, embed, shorts). The site extracts the ID.';
COMMENT ON COLUMN videos.thumb IS 'Optional thumbnail image. Empty = use YouTube''s own thumbnail.';
COMMENT ON COLUMN videos.category IS 'Free text, e.g. Bootcamp, Competition, Inside AFRISTEM.';
COMMENT ON COLUMN videos.featured IS '''Feature on homepage'' (stored, not used by the public site yet).';
COMMENT ON COLUMN videos.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN videos.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN videos.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- faqs: FAQs
--   Questions and answers.
--   Written by: Admin > FAQs
--   Rows: 11 today
-- ---------------------------------------------------------------------
CREATE TABLE faqs (
  id          varchar(100)  NOT NULL,
  question    varchar(500)  NOT NULL  DEFAULT '',
  answer      text          NOT NULL  DEFAULT '',
  category    varchar(80)   NOT NULL  DEFAULT 'General',
  sort_order  integer       NOT NULL  DEFAULT 0,
  created_at  timestamptz   NOT NULL  DEFAULT now(),
  updated_at  timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_faqs PRIMARY KEY (id)
);
CREATE INDEX ix_faqs_sort_order ON faqs (sort_order);
CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE faqs IS 'FAQs: Questions and answers.';
COMMENT ON COLUMN faqs.id IS 'e.g. ''faq-1''.';
COMMENT ON COLUMN faqs.question IS 'The question.';
COMMENT ON COLUMN faqs.answer IS 'The answer.';
COMMENT ON COLUMN faqs.category IS 'Free text grouping (not displayed yet).';
COMMENT ON COLUMN faqs.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN faqs.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN faqs.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- testimonials: Testimonials
--   Quotes from schools, teachers and students.
--   Written by: Admin > Testimonials
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE testimonials (
  id          varchar(100)   NOT NULL,
  quote       text           NOT NULL  DEFAULT '',
  name        varchar(120)   NOT NULL  DEFAULT '',
  role        varchar(160)   NOT NULL  DEFAULT '',
  org         varchar(160)   NOT NULL  DEFAULT '',
  image       varchar(1024)  NOT NULL  DEFAULT '',
  initials    varchar(10)    NOT NULL  DEFAULT '',
  featured    boolean        NOT NULL  DEFAULT false,
  sort_order  integer        NOT NULL  DEFAULT 0,
  created_at  timestamptz    NOT NULL  DEFAULT now(),
  updated_at  timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_testimonials PRIMARY KEY (id)
);
CREATE INDEX ix_testimonials_sort_order ON testimonials (sort_order);
CREATE TRIGGER trg_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE testimonials IS 'Testimonials: Quotes from schools, teachers and students.';
COMMENT ON COLUMN testimonials.id IS 'e.g. ''testimonial-1''.';
COMMENT ON COLUMN testimonials.quote IS 'The quote.';
COMMENT ON COLUMN testimonials.name IS 'Person (or role) quoted.';
COMMENT ON COLUMN testimonials.role IS 'e.g. ''Science Teacher''.';
COMMENT ON COLUMN testimonials.org IS 'School / organisation. Shown after the role.';
COMMENT ON COLUMN testimonials.image IS 'Optional photo (not displayed yet).';
COMMENT ON COLUMN testimonials.initials IS 'Avatar letters (up to 2). If empty the site uses the first letters of the first two words of the name.';
COMMENT ON COLUMN testimonials.featured IS '''Feature'' flag (stored, not used by the public site yet).';
COMMENT ON COLUMN testimonials.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN testimonials.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN testimonials.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- partners: Partners and sponsors
--   Partner organisations with logos and descriptions.
--   Written by: Admin > Partners
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE partners (
  id           varchar(100)   NOT NULL,
  slug         varchar(160)   NOT NULL  DEFAULT '',
  name         varchar(200)   NOT NULL  DEFAULT '',
  logo         varchar(1024)  NOT NULL  DEFAULT '',
  type         varchar(80)    NOT NULL  DEFAULT 'Partner',
  description  jsonb          NOT NULL  DEFAULT '[]'::jsonb,
  href         varchar(1024)  NOT NULL  DEFAULT '',
  cta_label    varchar(80)    NOT NULL  DEFAULT 'Learn more',
  external     boolean        NOT NULL  DEFAULT false,
  country      varchar(80)    NOT NULL  DEFAULT '',
  sort_order   integer        NOT NULL  DEFAULT 0,
  created_at   timestamptz    NOT NULL  DEFAULT now(),
  updated_at   timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_partners PRIMARY KEY (id),
  CONSTRAINT uq_partners_slug UNIQUE (slug),
  CONSTRAINT ck_partners_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_partners_description_array CHECK (jsonb_typeof(description) = 'array')
);
CREATE INDEX ix_partners_sort_order ON partners (sort_order);
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE partners IS 'Partners and sponsors: Partner organisations with logos and descriptions.';
COMMENT ON COLUMN partners.id IS 'Seed rows: ''partner-<n>''; admin-created: ''partner-xxxxxxx''.';
COMMENT ON COLUMN partners.slug IS 'Unique identifier text.';
COMMENT ON COLUMN partners.name IS 'Organisation name.';
COMMENT ON COLUMN partners.logo IS 'Logo image (path/URL).';
COMMENT ON COLUMN partners.type IS 'Free text, e.g. ''Strategic Partner''.';
COMMENT ON COLUMN partners.description IS 'Description paragraphs, in order.';
COMMENT ON COLUMN partners.href IS 'Website or internal page.';
COMMENT ON COLUMN partners.cta_label IS 'Button text.';
COMMENT ON COLUMN partners.external IS 'Open the link in a new tab.';
COMMENT ON COLUMN partners.country IS 'Optional country. Empty = not shown.';
COMMENT ON COLUMN partners.sort_order IS 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).';
COMMENT ON COLUMN partners.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN partners.updated_at IS 'Last change (UTC). Maintained automatically.';

-- =====================================================================
-- C. FORM SUBMISSIONS (WRITTEN BY WEBSITE VISITORS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- contact_messages: Contact form messages
--   Messages sent through the contact form (/contact).
--   Written by: Website visitors (POST /api/contact). Admin changes status, adds notes, replies by email, deletes.
--   Rows: Grows over time (hundreds per year)
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
  id            varchar(100)  NOT NULL,
  name          varchar(120)  NOT NULL,
  email         varchar(200)  NOT NULL,
  phone         varchar(40)   NOT NULL  DEFAULT '',
  organisation  varchar(160)  NOT NULL  DEFAULT '',
  category      varchar(80)   NOT NULL  DEFAULT 'General Enquiry',
  subject       varchar(200)  NOT NULL,
  message       text          NOT NULL,
  status        varchar(20)   NOT NULL  DEFAULT 'new',
  created_at    timestamptz   NOT NULL  DEFAULT now(),
  updated_at    timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_contact_messages PRIMARY KEY (id),
  CONSTRAINT ck_contact_messages_name_not_empty CHECK (name <> ''),
  CONSTRAINT ck_contact_messages_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_contact_messages_subject_not_empty CHECK (subject <> ''),
  CONSTRAINT ck_contact_messages_message_not_empty CHECK (message <> ''),
  CONSTRAINT ck_contact_messages_status CHECK (status IN ('new', 'in-progress', 'replied', 'closed'))
);
CREATE INDEX ix_contact_messages_created_at ON contact_messages (created_at);
CREATE INDEX ix_contact_messages_status ON contact_messages (status);
CREATE INDEX ix_contact_messages_email ON contact_messages (email);
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE contact_messages IS 'Contact form messages: Messages sent through the contact form (/contact).';
COMMENT ON COLUMN contact_messages.id IS 'Generated by the app: ''msg-<time><random>''.';
COMMENT ON COLUMN contact_messages.name IS 'Sender''s full name. Required.';
COMMENT ON COLUMN contact_messages.email IS 'Sender''s email. Required, validated as an email address.';
COMMENT ON COLUMN contact_messages.phone IS 'Optional phone.';
COMMENT ON COLUMN contact_messages.organisation IS 'Organisation / school (optional).';
COMMENT ON COLUMN contact_messages.category IS '''I am a...'' dropdown value.';
COMMENT ON COLUMN contact_messages.subject IS 'Subject. Required.';
COMMENT ON COLUMN contact_messages.message IS 'Message body. Required. The app caps it at 5,000 characters.';
COMMENT ON COLUMN contact_messages.status IS 'Inbox workflow status. Allowed: new, in-progress, replied, closed.';
COMMENT ON COLUMN contact_messages.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN contact_messages.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- contact_message_notes: Notes and replies on contact messages
--   The timeline under each message: internal notes typed by the admin, and every email reply that was sent.
--   Written by: Admin (Add note / Send reply)
--   Rows: 0-several per message
-- ---------------------------------------------------------------------
CREATE TABLE contact_message_notes (
  id                  bigint GENERATED BY DEFAULT AS IDENTITY  NOT NULL,
  contact_message_id  varchar(100)                             NOT NULL,
  kind                varchar(10)                              NOT NULL  DEFAULT 'note',
  reply_subject       varchar(255)                             NOT NULL  DEFAULT '',
  email_status        varchar(20)                              NULL,
  body                text                                     NOT NULL,
  author              varchar(80)                              NOT NULL  DEFAULT 'admin',
  created_at          timestamptz                              NOT NULL  DEFAULT now(),
  CONSTRAINT pk_contact_message_notes PRIMARY KEY (id),
  CONSTRAINT ck_contact_message_notes_kind CHECK (kind IN ('note', 'reply')),
  CONSTRAINT ck_contact_message_notes_email_status CHECK (email_status IN ('sent', 'logged_only', 'failed')),
  CONSTRAINT ck_contact_message_notes_body_not_empty CHECK (body <> ''),
  CONSTRAINT fk_contact_message_notes_contact_message_id FOREIGN KEY (contact_message_id) REFERENCES contact_messages (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX ix_contact_message_notes_contact_message_id_created_at ON contact_message_notes (contact_message_id, created_at);
COMMENT ON TABLE contact_message_notes IS 'Notes and replies on contact messages: The timeline under each message: internal notes typed by the admin, and every email reply that was sent.';
COMMENT ON COLUMN contact_message_notes.id IS 'Auto-increment number.';
COMMENT ON COLUMN contact_message_notes.contact_message_id IS 'The message this note belongs to.';
COMMENT ON COLUMN contact_message_notes.kind IS '''note'' = internal note; ''reply'' = an email reply that was sent to the person. Allowed: note, reply.';
COMMENT ON COLUMN contact_message_notes.reply_subject IS 'Email subject. Replies only; empty for notes.';
COMMENT ON COLUMN contact_message_notes.email_status IS 'Replies only (NULL for notes): sent = delivered to the email provider; logged_only = no email key configured, so nothing was sent; failed = provider rejected it. Allowed: sent, logged_only, failed.';
COMMENT ON COLUMN contact_message_notes.body IS 'The note text, or the reply message that was emailed.';
COMMENT ON COLUMN contact_message_notes.author IS 'Who wrote it. Always ''admin'' today (single admin account).';
COMMENT ON COLUMN contact_message_notes.created_at IS 'When the row was created (UTC).';

-- ---------------------------------------------------------------------
-- registrations: Programme / event registrations
--   Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations.
--   Written by: Website visitors (POST /api/register). Admin changes status, adds notes, replies by email, deletes.
--   Rows: Grows over time (hundreds to thousands per year)
-- ---------------------------------------------------------------------
CREATE TABLE registrations (
  id                     varchar(100)  NOT NULL,
  reference              varchar(20)   NOT NULL,
  type                   varchar(20)   NOT NULL,
  programme_slug         varchar(160)  NOT NULL  DEFAULT '',
  programme_id           varchar(100)  NULL,
  event_ref              varchar(160)  NOT NULL  DEFAULT '',
  event_id               varchar(100)  NULL,
  category               varchar(80)   NOT NULL  DEFAULT '',
  preferred_format       varchar(20)   NOT NULL  DEFAULT '',
  full_name              varchar(120)  NOT NULL,
  first_name             varchar(120)  NOT NULL  DEFAULT '',
  last_name              varchar(120)  NOT NULL  DEFAULT '',
  date_of_birth          date          NULL,
  gender                 varchar(20)   NOT NULL  DEFAULT '',
  email                  varchar(200)  NOT NULL,
  phone                  varchar(40)   NOT NULL,
  school_name            varchar(160)  NOT NULL  DEFAULT '',
  grade                  varchar(80)   NOT NULL  DEFAULT '',
  school_location        varchar(200)  NOT NULL  DEFAULT '',
  state                  varchar(80)   NOT NULL  DEFAULT '',
  city                   varchar(80)   NOT NULL  DEFAULT '',
  role                   varchar(80)   NOT NULL  DEFAULT '',
  organisation           varchar(160)  NOT NULL  DEFAULT '',
  participants           varchar(20)   NOT NULL  DEFAULT '',
  applicant_notes        text          NOT NULL  DEFAULT '',
  guardian_name          varchar(120)  NOT NULL  DEFAULT '',
  guardian_phone         varchar(40)   NOT NULL  DEFAULT '',
  guardian_email         varchar(200)  NOT NULL  DEFAULT '',
  guardian_relationship  varchar(40)   NOT NULL  DEFAULT '',
  consent_given          boolean       NOT NULL  DEFAULT false,
  consent_at             timestamptz   NULL,
  status                 varchar(20)   NOT NULL  DEFAULT 'new',
  created_at             timestamptz   NOT NULL  DEFAULT now(),
  updated_at             timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_registrations PRIMARY KEY (id),
  CONSTRAINT uq_registrations_reference UNIQUE (reference),
  CONSTRAINT ck_registrations_reference_not_empty CHECK (reference <> ''),
  CONSTRAINT ck_registrations_type CHECK (type IN ('student', 'school', 'educator', 'professional', 'partner')),
  CONSTRAINT ck_registrations_full_name_not_empty CHECK (full_name <> ''),
  CONSTRAINT ck_registrations_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_registrations_phone_not_empty CHECK (phone <> ''),
  CONSTRAINT ck_registrations_status CHECK (status IN ('new', 'contacted', 'confirmed', 'waitlist', 'declined')),
  CONSTRAINT fk_registrations_programme_id FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_event_id FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX ix_registrations_created_at ON registrations (created_at);
CREATE INDEX ix_registrations_status ON registrations (status);
CREATE INDEX ix_registrations_email ON registrations (email);
CREATE INDEX ix_registrations_programme_slug ON registrations (programme_slug);
CREATE INDEX ix_registrations_programme_id ON registrations (programme_id);
CREATE INDEX ix_registrations_event_id ON registrations (event_id);
CREATE TRIGGER trg_registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE registrations IS 'Programme / event registrations: Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations.';
COMMENT ON COLUMN registrations.id IS 'Generated by the app: ''reg-<time><random>''.';
COMMENT ON COLUMN registrations.reference IS 'Reference shown to the registrant, format AFR-<year>-<5 letters/digits>, e.g. AFR-2026-1F4C9. Unique.';
COMMENT ON COLUMN registrations.type IS '''I am registering as a...''. Required. Allowed: student, school, educator, professional, partner.';
COMMENT ON COLUMN registrations.programme_slug IS 'Programme chosen (its slug), kept as text so the record survives programme edits or deletion. Empty = none.';
COMMENT ON COLUMN registrations.programme_id IS 'Link to programmes.id when programme_slug matches a programme. NULL otherwise.';
COMMENT ON COLUMN registrations.event_ref IS 'Event chosen (an events.slug; older short codes in shared links are translated by the register page). Empty = none.';
COMMENT ON COLUMN registrations.event_id IS 'Link to events.id when event_ref matches an event slug. NULL otherwise.';
COMMENT ON COLUMN registrations.category IS 'Participant category. Optional.';
COMMENT ON COLUMN registrations.preferred_format IS 'Preferred format. Optional.';
COMMENT ON COLUMN registrations.full_name IS 'Full name exactly as typed (for schools: the contact person). Required.';
COMMENT ON COLUMN registrations.first_name IS 'First word of full_name.';
COMMENT ON COLUMN registrations.last_name IS 'Everything after the first word of full_name.';
COMMENT ON COLUMN registrations.date_of_birth IS 'Students only (required for students on the form). Used to decide if a parent/guardian is needed (under 18).';
COMMENT ON COLUMN registrations.gender IS 'Students only. Optional.';
COMMENT ON COLUMN registrations.email IS 'Email. Required, validated as an email address.';
COMMENT ON COLUMN registrations.phone IS 'Phone. Required.';
COMMENT ON COLUMN registrations.school_name IS 'School name. Required on the form for students and schools.';
COMMENT ON COLUMN registrations.grade IS 'Students: class/grade, e.g. ''JSS 2''. Required for students.';
COMMENT ON COLUMN registrations.school_location IS '''City, State, Country'' free text. Required for schools.';
COMMENT ON COLUMN registrations.state IS 'State (exists in today''s record; the current form does not ask for it).';
COMMENT ON COLUMN registrations.city IS 'City (exists in today''s record; the current form does not ask for it).';
COMMENT ON COLUMN registrations.role IS 'Educators / professionals / partners: ''Role / Profession'' (required for them).';
COMMENT ON COLUMN registrations.organisation IS 'Educators / professionals / partners: organisation. Optional.';
COMMENT ON COLUMN registrations.participants IS 'Number of participants (exists in today''s record; the current form puts this in applicant_notes instead).';
COMMENT ON COLUMN registrations.applicant_notes IS 'Free-text notes from the applicant, e.g. schools: ''Estimated number of students & any notes''. The app caps it at 3,000 characters.';
COMMENT ON COLUMN registrations.guardian_name IS 'Parent/guardian name. Required on the form for students under 18.';
COMMENT ON COLUMN registrations.guardian_phone IS 'Parent/guardian phone. Required on the form for students under 18.';
COMMENT ON COLUMN registrations.guardian_email IS 'Parent/guardian email. Optional.';
COMMENT ON COLUMN registrations.guardian_relationship IS 'Relationship to the participant. Optional.';
COMMENT ON COLUMN registrations.consent_given IS 'Applicant ticked the Privacy Policy / Terms box. The server refuses registrations without it, so the app must store TRUE.';
COMMENT ON COLUMN registrations.consent_at IS 'When consent was given (= submission time).';
COMMENT ON COLUMN registrations.status IS 'Workflow status. Allowed: new, contacted, confirmed, waitlist, declined.';
COMMENT ON COLUMN registrations.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN registrations.updated_at IS 'Last change (UTC). Maintained automatically.';

-- ---------------------------------------------------------------------
-- registration_notes: Notes and replies on registrations
--   The timeline under each registration: internal notes and every email reply sent.
--   Written by: Admin (Add note / Send reply)
--   Rows: 0-several per registration
-- ---------------------------------------------------------------------
CREATE TABLE registration_notes (
  id               bigint GENERATED BY DEFAULT AS IDENTITY  NOT NULL,
  registration_id  varchar(100)                             NOT NULL,
  kind             varchar(10)                              NOT NULL  DEFAULT 'note',
  reply_subject    varchar(255)                             NOT NULL  DEFAULT '',
  email_status     varchar(20)                              NULL,
  body             text                                     NOT NULL,
  author           varchar(80)                              NOT NULL  DEFAULT 'admin',
  created_at       timestamptz                              NOT NULL  DEFAULT now(),
  CONSTRAINT pk_registration_notes PRIMARY KEY (id),
  CONSTRAINT ck_registration_notes_kind CHECK (kind IN ('note', 'reply')),
  CONSTRAINT ck_registration_notes_email_status CHECK (email_status IN ('sent', 'logged_only', 'failed')),
  CONSTRAINT ck_registration_notes_body_not_empty CHECK (body <> ''),
  CONSTRAINT fk_registration_notes_registration_id FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX ix_registration_notes_registration_id_created_at ON registration_notes (registration_id, created_at);
COMMENT ON TABLE registration_notes IS 'Notes and replies on registrations: The timeline under each registration: internal notes and every email reply sent.';
COMMENT ON COLUMN registration_notes.id IS 'Auto-increment number.';
COMMENT ON COLUMN registration_notes.registration_id IS 'The registration this note belongs to.';
COMMENT ON COLUMN registration_notes.kind IS '''note'' = internal note; ''reply'' = an email reply that was sent to the person. Allowed: note, reply.';
COMMENT ON COLUMN registration_notes.reply_subject IS 'Email subject. Replies only; empty for notes.';
COMMENT ON COLUMN registration_notes.email_status IS 'Replies only (NULL for notes): sent, logged_only (no email key configured) or failed. Allowed: sent, logged_only, failed.';
COMMENT ON COLUMN registration_notes.body IS 'The note text, or the reply message that was emailed.';
COMMENT ON COLUMN registration_notes.author IS 'Who wrote it. Always ''admin'' today.';
COMMENT ON COLUMN registration_notes.created_at IS 'When the row was created (UTC).';

-- ---------------------------------------------------------------------
-- newsletter_subscribers: Newsletter subscribers
--   Emails from the newsletter box (footer/home) and the 'Notify me' box on /stem-guide-for-schools.
--   Written by: Website visitors (POST /api/newsletter). Admin toggles subscribed/unsubscribed, deletes.
--   Rows: Grows over time (thousands)
-- ---------------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id               varchar(100)  NOT NULL,
  email            varchar(200)  NOT NULL,
  status           varchar(20)   NOT NULL  DEFAULT 'subscribed',
  source           varchar(40)   NOT NULL  DEFAULT 'newsletter',
  created_at       timestamptz   NOT NULL  DEFAULT now(),
  unsubscribed_at  timestamptz   NULL,
  updated_at       timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_newsletter_subscribers PRIMARY KEY (id),
  CONSTRAINT uq_newsletter_subscribers_email UNIQUE (email),
  CONSTRAINT ck_newsletter_subscribers_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_newsletter_subscribers_status CHECK (status IN ('subscribed', 'unsubscribed')),
  CONSTRAINT ck_newsletter_subscribers_email_lowercase CHECK (email = lower(email))
);
CREATE INDEX ix_newsletter_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX ix_newsletter_subscribers_created_at ON newsletter_subscribers (created_at);
CREATE TRIGGER trg_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers: Emails from the newsletter box (footer/home) and the ''Notify me'' box on /stem-guide-for-schools.';
COMMENT ON COLUMN newsletter_subscribers.id IS 'Generated by the app: ''sub-<time><random>''.';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Email address, stored in lowercase. Unique (one row per person).';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Subscription status. Allowed: subscribed, unsubscribed.';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Which form they used: newsletter (footer / homepage box) or stem-guide (''Notify me'' on /stem-guide-for-schools).';
COMMENT ON COLUMN newsletter_subscribers.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'When they were marked unsubscribed. NULL while subscribed.';
COMMENT ON COLUMN newsletter_subscribers.updated_at IS 'Last change (UTC). Maintained automatically.';

-- =====================================================================
-- D. ADMIN ACCOUNT AND UPLOADED FILES
-- =====================================================================

-- ---------------------------------------------------------------------
-- admin_account: Admin dashboard password
--   The single password that opens /admin. Only a salted hash is stored, never the password.
--   Written by: The app: on the first successful login (creates the row) and on Admin > Settings > change password
--   Rows: 0 or 1. Leave it EMPTY when you create the database.
-- ---------------------------------------------------------------------
CREATE TABLE admin_account (
  id               smallint      NOT NULL  DEFAULT 1,
  password_hash    varchar(128)  NOT NULL,
  password_salt    varchar(64)   NOT NULL,
  hash_algorithm   varchar(30)   NOT NULL  DEFAULT 'pbkdf2-sha256',
  hash_iterations  integer       NOT NULL  DEFAULT 120000,
  created_at       timestamptz   NOT NULL  DEFAULT now(),
  updated_at       timestamptz   NOT NULL  DEFAULT now(),
  CONSTRAINT pk_admin_account PRIMARY KEY (id),
  CONSTRAINT ck_admin_account_singleton CHECK (id = 1)
);
CREATE TRIGGER trg_admin_account_updated_at BEFORE UPDATE ON admin_account
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMENT ON TABLE admin_account IS 'Admin dashboard password: The single password that opens /admin. Only a salted hash is stored, never the password.';
COMMENT ON COLUMN admin_account.id IS 'Always 1 - this table holds exactly one row.';
COMMENT ON COLUMN admin_account.password_hash IS 'PBKDF2-HMAC-SHA256, 120,000 iterations, 32-byte output, base64url without padding (43 characters).';
COMMENT ON COLUMN admin_account.password_salt IS '16 random bytes as base64url (22 characters). Note: the UTF-8 bytes of this salt *string* are what is fed to PBKDF2.';
COMMENT ON COLUMN admin_account.hash_algorithm IS 'Documents the algorithm (for future upgrades).';
COMMENT ON COLUMN admin_account.hash_iterations IS 'PBKDF2 iteration count used for this hash.';
COMMENT ON COLUMN admin_account.created_at IS 'When the row was created (UTC).';
COMMENT ON COLUMN admin_account.updated_at IS 'When the password was last set (UTC).';

-- ---------------------------------------------------------------------
-- media_files: Uploaded images
--   Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database.
--   Written by: Admin image uploads (POST /api/admin/upload)
--   Rows: Grows over time
-- ---------------------------------------------------------------------
CREATE TABLE media_files (
  id             varchar(100)   NOT NULL,
  file_name      varchar(255)   NOT NULL,
  url            varchar(1024)  NOT NULL,
  storage        varchar(20)    NOT NULL  DEFAULT 'local',
  mime_type      varchar(60)    NOT NULL  DEFAULT 'image/jpeg',
  size_bytes     integer        NOT NULL  DEFAULT 0,
  width          integer        NULL,
  height         integer        NULL,
  original_name  varchar(255)   NOT NULL  DEFAULT '',
  created_at     timestamptz    NOT NULL  DEFAULT now(),
  CONSTRAINT pk_media_files PRIMARY KEY (id),
  CONSTRAINT uq_media_files_file_name UNIQUE (file_name)
);
CREATE INDEX ix_media_files_created_at ON media_files (created_at);
COMMENT ON TABLE media_files IS 'Uploaded images: Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database.';
COMMENT ON COLUMN media_files.id IS 'e.g. ''media-<file name without .jpg>''.';
COMMENT ON COLUMN media_files.file_name IS 'Stored file name, e.g. ''mgz3k2a1-3fa9c1.jpg''. Unique.';
COMMENT ON COLUMN media_files.url IS 'URL saved into content, e.g. ''/api/media/mgz3k2a1-3fa9c1.jpg'' or a full CDN URL.';
COMMENT ON COLUMN media_files.storage IS 'Where the bytes live.';
COMMENT ON COLUMN media_files.mime_type IS 'Uploads are always converted to JPEG today.';
COMMENT ON COLUMN media_files.size_bytes IS 'File size after processing.';
COMMENT ON COLUMN media_files.width IS 'Pixels (optional).';
COMMENT ON COLUMN media_files.height IS 'Pixels (optional).';
COMMENT ON COLUMN media_files.original_name IS 'Original file name the admin uploaded (optional).';
COMMENT ON COLUMN media_files.created_at IS 'When the row was created (UTC).';

COMMIT;
