-- =====================================================================
--  AFRISTEM Global website - DATABASE SCHEMA
--  Engine : MySQL 8.0.16+ or MariaDB 10.6+ (e.g. a Hostinger hPanel MySQL database)
--  Run    : mysql -u USER -p DATABASE_NAME < 01-schema.sql   (or phpMyAdmin > Import)
--  Next   : run 02-seed.sql (initial website content)
--  Tables : 24. Every table and column is explained in ../README.md
--  Generated from the website source code - do not edit by hand.
-- =====================================================================

-- To start again from scratch (DESTROYS ALL DATA) uncomment the next 3 lines:
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS media_files, admin_account, newsletter_subscribers, registration_notes, registrations, contact_message_notes, contact_messages, partners, testimonials, faqs, videos, gallery_items, gallery_categories, news_posts, news_categories, events, programmes, stats, site_external_links, site_social_links, site_offices, site_settings, hero_content, announcement;
-- SET FOREIGN_KEY_CHECKS = 1;

SET NAMES utf8mb4;

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
  id          SMALLINT       NOT NULL DEFAULT 1 COMMENT 'Always 1 - this table holds exactly one row.',
  enabled     BOOLEAN        NOT NULL DEFAULT TRUE COMMENT 'Show the bar on the site.',
  tone        VARCHAR(10)    NOT NULL DEFAULT 'info' COMMENT 'Colour of the bar. Allowed: info, success, warning, urgent.',
  label       VARCHAR(60)    NOT NULL DEFAULT '' COMMENT 'Small badge text before the message, e.g. ''5th Edition''.',
  message     VARCHAR(500)   NOT NULL DEFAULT '' COMMENT 'The announcement text.',
  href        VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Where the link goes, e.g. /register.',
  link_label  VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Link text. The link only shows when both href and link_label are filled.',
  starts_at   DATE           NULL COMMENT '''Hide until'' date. NULL = no start limit.',
  ends_at     DATE           NULL COMMENT '''Hide after'' date. The bar still shows for the whole of this day. NULL = no end limit.',
  updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT ck_announcement_singleton CHECK (id = 1),
  CONSTRAINT ck_announcement_tone CHECK (tone COLLATE utf8mb4_bin IN ('info', 'success', 'warning', 'urgent'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Announcement bar: The coloured strip at the very top of every page (e.g. ''Registration is open'').';

-- ---------------------------------------------------------------------
-- hero_content: Homepage hero
--   Headline, animated words, buttons and photos at the top of the homepage.
--   Written by: Admin > Homepage hero
--   Rows: Exactly 1 row
-- ---------------------------------------------------------------------
CREATE TABLE hero_content (
  id                       SMALLINT       NOT NULL DEFAULT 1 COMMENT 'Always 1 - this table holds exactly one row.',
  badge_label              VARCHAR(60)    NOT NULL DEFAULT '' COMMENT 'Small pill label, e.g. ''New''.',
  badge_text               VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Text next to the pill.',
  badge_href               VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Where the badge links to.',
  headline                 VARCHAR(500)   NOT NULL DEFAULT '' COMMENT 'First part of the big heading. The rotating word is shown after it.',
  rotating_words           JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Words that animate after the headline, in display order.',
  subheading               TEXT           NOT NULL DEFAULT ('') COMMENT 'Paragraph under the headline.',
  primary_cta_label        VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Main button text.',
  primary_cta_href         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Main button link.',
  secondary_cta_label      VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Second button text.',
  secondary_cta_href       VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Second button link.',
  background_image         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Background photo (image path/URL).',
  feature_image            VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Main feature photo (image path/URL).',
  feature_eyebrow          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Small label printed over the feature photo.',
  feature_caption          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Caption under the feature photo.',
  secondary_image          VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Floating second photo (desktop only).',
  secondary_image_caption  VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Caption for the floating photo.',
  updated_at               DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT ck_hero_content_singleton CHECK (id = 1),
  CONSTRAINT ck_hero_content_rotating_words_array CHECK (JSON_TYPE(rotating_words) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Homepage hero: Headline, animated words, buttons and photos at the top of the homepage.';

-- ---------------------------------------------------------------------
-- site_settings: Brand and contact details
--   Organisation name, contact numbers and registration notes used across the site and in emails.
--   Written by: Admin > Brand & contact
--   Rows: Exactly 1 row
-- ---------------------------------------------------------------------
CREATE TABLE site_settings (
  id                   SMALLINT      NOT NULL DEFAULT 1 COMMENT 'Always 1 - this table holds exactly one row.',
  name                 VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'Organisation name, e.g. AFRISTEM.',
  tagline              VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'Short tagline.',
  description          TEXT          NOT NULL DEFAULT ('') COMMENT 'Meta description / short ''about'' text.',
  email                VARCHAR(200)  NOT NULL DEFAULT '' COMMENT 'Public contact email.',
  primary_phone        VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Main phone (header, footer, call button).',
  whatsapp             VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'WhatsApp number. The site keeps only the digits to build the wa.me link.',
  secondary_phone      VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Second phone number.',
  address              VARCHAR(500)  NOT NULL DEFAULT '' COMMENT 'Head office address (one line).',
  registration_note    TEXT          NOT NULL DEFAULT ('') COMMENT 'Note shown on the registration page.',
  registration_opens   DATE          NULL COMMENT 'Registration opening date. NULL = not set.',
  registration_closes  DATE          NULL COMMENT 'Registration closing date. NULL = not set.',
  footer_note          VARCHAR(500)  NOT NULL DEFAULT '' COMMENT 'Small line in the footer.',
  updated_at           DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT ck_site_settings_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Brand and contact details: Organisation name, contact numbers and registration notes used across the site and in emails.';

-- ---------------------------------------------------------------------
-- site_offices: Offices
--   Office addresses listed in the footer and on the contact page.
--   Written by: Admin > Brand & contact > Offices
--   Rows: 3 today (Abakaliki head office, Abuja, Lagos)
-- ---------------------------------------------------------------------
CREATE TABLE site_offices (
  id          VARCHAR(100)  NOT NULL COMMENT 'Text id, e.g. ''abakaliki'', or generated ''office-xxxxxxx''.',
  name        VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'Office display name, e.g. ''South East Nigeria Office''. Shown on the contact page (the city is used when empty).',
  city        VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'City, e.g. Abakaliki.',
  address     VARCHAR(500)  NOT NULL DEFAULT '' COMMENT 'Full address (one line).',
  phone       VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Office phone.',
  map_query   VARCHAR(500)  NOT NULL DEFAULT '' COMMENT 'Text used for the Google Maps embed on the contact page.',
  sort_order  INT           NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Offices: Office addresses listed in the footer and on the contact page.';
CREATE INDEX ix_site_offices_sort_order ON site_offices (sort_order);

-- ---------------------------------------------------------------------
-- site_social_links: Social media links
--   Social icons in the footer and contact page.
--   Written by: Admin > Brand & contact > Social links
--   Rows: 5 today
-- ---------------------------------------------------------------------
CREATE TABLE site_social_links (
  id          VARCHAR(100)   NOT NULL COMMENT 'Text id, e.g. ''facebook'', or generated ''social-xxxxxxx''.',
  label       VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Name, e.g. Facebook.',
  href        VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Profile URL.',
  icon        VARCHAR(20)    NOT NULL DEFAULT 'link' COMMENT 'Which icon to draw.',
  sort_order  INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Social media links: Social icons in the footer and contact page.';
CREATE INDEX ix_site_social_links_sort_order ON site_social_links (sort_order);

-- ---------------------------------------------------------------------
-- site_external_links: External (sister) sites
--   Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer.
--   Written by: Admin > Brand & contact > External sites
--   Rows: 2 today
-- ---------------------------------------------------------------------
CREATE TABLE site_external_links (
  id           VARCHAR(100)   NOT NULL COMMENT 'Text id, e.g. ''prime-stem'', or generated ''ext-xxxxxxx''.',
  label        VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'Link text.',
  href         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Full URL (opens in a new tab).',
  description  TEXT           NOT NULL DEFAULT ('') COMMENT 'Short description.',
  sort_order   INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='External (sister) sites: Links to sister sites (Prime STEM Nigeria, Digital Science School) shown in the footer.';
CREATE INDEX ix_site_external_links_sort_order ON site_external_links (sort_order);

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
  id          VARCHAR(100)  NOT NULL COMMENT 'e.g. ''stat-1''.',
  value       VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Display text, e.g. ''5,867+''. The site animates the leading number and keeps the rest as a suffix.',
  label       VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'e.g. ''Students Reached''.',
  icon        VARCHAR(30)   NOT NULL DEFAULT 'sparkles' COMMENT 'Icon name (stored, not displayed yet).',
  sort_order  INT           NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Impact statistics: The big numbers (students reached, schools, partners...).';
CREATE INDEX ix_stats_sort_order ON stats (sort_order);

-- ---------------------------------------------------------------------
-- programmes: Flagship programmes
--   SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>.
--   Written by: Admin > Programmes
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE programmes (
  id                 VARCHAR(100)   NOT NULL COMMENT 'Seed rows use the slug as id; admin-created rows get ''prog-xxxxxxx''.',
  slug               VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'URL part: /programmes/<slug>. Unique, must not be empty.',
  name               VARCHAR(200)   NOT NULL DEFAULT '' COMMENT 'Programme name.',
  subtitle           VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'e.g. ''Science Spelling Bee''.',
  tagline            VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Short slogan.',
  short_description  TEXT           NOT NULL DEFAULT ('') COMMENT 'One-line summary used on cards.',
  eligibility        TEXT           NOT NULL DEFAULT ('') COMMENT 'Who can take part.',
  format             VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Structure, e.g. ''School rounds > Regional finals > Grand finale''.',
  age_range          VARCHAR(120)   NOT NULL DEFAULT '' COMMENT 'Age/class range, e.g. ''Ages 6 - 14''.',
  image              VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Main image (path/URL).',
  image_alt          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Image description for screen readers.',
  pillar             VARCHAR(20)    NOT NULL DEFAULT 'STEM' COMMENT 'Which STEM pillar the programme represents. Allowed: SCIENCE, TECHNOLOGY, STEM, CHEMISTRY.',
  cta_label          VARCHAR(120)   NOT NULL DEFAULT 'Register interest' COMMENT 'Button text.',
  highlights         JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Key facts, e.g. [{"label":"Exam date","value":"November 14, 2026"}]. The admin screen edits them as one ''Label: Value'' per line.',
  prize_note         VARCHAR(500)   NOT NULL DEFAULT '' COMMENT 'Optional headline prize line. Empty = none.',
  poster             VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Optional full poster image. Empty = none.',
  register_href      VARCHAR(1024)  NOT NULL DEFAULT '/register' COMMENT 'Where the register button goes.',
  featured           BOOLEAN        NOT NULL DEFAULT TRUE COMMENT '''Show on homepage''.',
  status             VARCHAR(20)    NOT NULL DEFAULT 'open' COMMENT 'Registration status. Allowed: open, closing-soon, closed, coming-soon.',
  pillar_blurb       VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'One line describing the pillar.',
  description        JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Long description paragraphs for the programme page, in order.',
  objectives         JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Bullet list of objectives, in order.',
  accent             VARCHAR(10)    NOT NULL DEFAULT 'sun' COMMENT 'Colour theme of the programme page.',
  icon               VARCHAR(10)    NOT NULL DEFAULT 'trophy' COMMENT 'Icon shown on the programme card.',
  sort_order         INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at         DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_programmes_slug UNIQUE (slug),
  CONSTRAINT ck_programmes_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_programmes_pillar CHECK (pillar COLLATE utf8mb4_bin IN ('SCIENCE', 'TECHNOLOGY', 'STEM', 'CHEMISTRY')),
  CONSTRAINT ck_programmes_highlights_array CHECK (JSON_TYPE(highlights) = 'ARRAY'),
  CONSTRAINT ck_programmes_status CHECK (status COLLATE utf8mb4_bin IN ('open', 'closing-soon', 'closed', 'coming-soon')),
  CONSTRAINT ck_programmes_description_array CHECK (JSON_TYPE(description) = 'ARRAY'),
  CONSTRAINT ck_programmes_objectives_array CHECK (JSON_TYPE(objectives) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Flagship programmes: SciSPELL, Code Africa, STEM Kids Championship, African Organic Chemistry Tournament. Each has a page at /programmes/<slug>.';
CREATE INDEX ix_programmes_sort_order ON programmes (sort_order);

-- ---------------------------------------------------------------------
-- events: Events
--   Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown.
--   Written by: Admin > Events
--   Rows: 7 today
-- ---------------------------------------------------------------------
CREATE TABLE events (
  id             VARCHAR(100)   NOT NULL COMMENT 'Seed rows: ''event-<slug>''; admin-created: ''event-xxxxxxx''.',
  slug           VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'Unique identifier text. The registration form sends it as the chosen event.',
  title          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Event name.',
  start_date     DATE           NOT NULL COMMENT 'Start date. Used for sorting, the countdown and the upcoming/past split. Required.',
  end_date       DATE           NULL COMMENT 'End date for multi-day events. NULL = single day.',
  display_date   VARCHAR(120)   NOT NULL DEFAULT '' COMMENT 'Human-readable date shown on the site, e.g. ''Oct 19 - 30, 2026''.',
  location       VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Venue or ''Online (Zoom)''.',
  mode           VARCHAR(10)    NOT NULL DEFAULT 'Physical' COMMENT 'Physical, Virtual or Hybrid. Allowed: Physical, Virtual, Hybrid.',
  description    TEXT           NOT NULL DEFAULT ('') COMMENT 'Event description.',
  deadline       VARCHAR(120)   NOT NULL DEFAULT '' COMMENT 'Registration deadline as display text, e.g. ''Oct 28, 2026''. Empty = none.',
  register_href  VARCHAR(1024)  NOT NULL DEFAULT '/register' COMMENT 'Where the Register button goes.',
  tag            VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Label pill, e.g. ''Awards'', ''Educators''.',
  image          VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Event image (path/URL).',
  sort_order     INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at     DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at     DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_events_slug UNIQUE (slug),
  CONSTRAINT ck_events_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_events_mode CHECK (mode COLLATE utf8mb4_bin IN ('Physical', 'Virtual', 'Hybrid'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Events: Competitions, boot camps, award tours, teacher hangouts. Drives the events page and the homepage countdown.';
CREATE INDEX ix_events_start_date ON events (start_date);
CREATE INDEX ix_events_sort_order ON events (sort_order);

-- ---------------------------------------------------------------------
-- news_categories: News categories (lookup)
--   The fixed list of article categories, with the descriptions shown on the news page filters.
--   Written by: Seed only (no admin screen yet)
--   Rows: 9
-- ---------------------------------------------------------------------
CREATE TABLE news_categories (
  name         VARCHAR(60)   NOT NULL COMMENT 'Category name, e.g. ''STEM Education''. Referenced by news_posts.category.',
  description  VARCHAR(255)  NOT NULL DEFAULT '' COMMENT 'Short explanation shown on the news page.',
  sort_order   INT           NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='News categories (lookup): The fixed list of article categories, with the descriptions shown on the news page filters.';
CREATE INDEX ix_news_categories_sort_order ON news_categories (sort_order);

-- ---------------------------------------------------------------------
-- news_posts: News articles
--   News and blog articles. Each has a page at /news/<slug>.
--   Written by: Admin > News
--   Rows: 7 today
-- ---------------------------------------------------------------------
CREATE TABLE news_posts (
  id            VARCHAR(100)   NOT NULL COMMENT 'Seed rows: ''post-<slug>''; admin-created: ''post-xxxxxxx''.',
  slug          VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'URL part: /news/<slug>. Unique, must not be empty.',
  title         VARCHAR(300)   NOT NULL DEFAULT '' COMMENT 'Headline.',
  excerpt       TEXT           NOT NULL DEFAULT ('') COMMENT 'Short summary for cards and SEO.',
  category      VARCHAR(60)    NOT NULL DEFAULT 'AFRISTEM News' COMMENT 'Must be one of news_categories.name.',
  published_on  DATE           NOT NULL COMMENT 'Publication date. All lists are sorted by this, newest first. Required.',
  display_date  VARCHAR(120)   NOT NULL DEFAULT '' COMMENT 'Human-readable date, e.g. ''Oct 1, 2026''.',
  read_time     VARCHAR(40)    NOT NULL DEFAULT '3 min read' COMMENT 'e.g. ''4 min read''.',
  image         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Cover image (path/URL).',
  author        VARCHAR(120)   NOT NULL DEFAULT 'AFRISTEM Team' COMMENT 'Author name.',
  body          JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Article paragraphs, in order (one string per paragraph).',
  sort_order    INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at    DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_news_posts_slug UNIQUE (slug),
  CONSTRAINT ck_news_posts_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_news_posts_body_array CHECK (JSON_TYPE(body) = 'ARRAY'),
  CONSTRAINT fk_news_posts_category FOREIGN KEY (category) REFERENCES news_categories (name) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='News articles: News and blog articles. Each has a page at /news/<slug>.';
CREATE INDEX ix_news_posts_published_on ON news_posts (published_on);
CREATE INDEX ix_news_posts_category ON news_posts (category);
CREATE INDEX ix_news_posts_sort_order ON news_posts (sort_order);

-- ---------------------------------------------------------------------
-- gallery_categories: Gallery categories (lookup)
--   The fixed list of photo categories used as filter buttons on the gallery.
--   Written by: Seed only (no admin screen yet)
--   Rows: 8
-- ---------------------------------------------------------------------
CREATE TABLE gallery_categories (
  name        VARCHAR(60)  NOT NULL COMMENT 'Category name, e.g. ''Competitions''. Referenced by gallery_items.category.',
  sort_order  INT          NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Gallery categories (lookup): The fixed list of photo categories used as filter buttons on the gallery.';
CREATE INDEX ix_gallery_categories_sort_order ON gallery_categories (sort_order);

-- ---------------------------------------------------------------------
-- gallery_items: Gallery photos
--   Photos in the gallery mosaic.
--   Written by: Admin > Gallery
--   Rows: 25 today
-- ---------------------------------------------------------------------
CREATE TABLE gallery_items (
  id          VARCHAR(100)   NOT NULL COMMENT 'Seed rows: ''photo-<n>''; admin-created: ''photo-xxxxxxx''.',
  src         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Image path/URL. Should not be empty.',
  alt         VARCHAR(500)   NOT NULL DEFAULT '' COMMENT 'Describes the photo for screen readers.',
  caption     VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Caption shown on hover and in the lightbox.',
  category    VARCHAR(60)    NOT NULL DEFAULT 'Events' COMMENT 'Must be one of gallery_categories.name.',
  span        VARCHAR(4)     NOT NULL DEFAULT '' COMMENT 'Tile shape in the mosaic: '''' = normal, ''wide'' = two columns, ''tall'' = two rows. Allowed: (empty), wide, tall.',
  sort_order  INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT ck_gallery_items_span CHECK (span COLLATE utf8mb4_bin IN ('', 'wide', 'tall')),
  CONSTRAINT fk_gallery_items_category FOREIGN KEY (category) REFERENCES gallery_categories (name) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Gallery photos: Photos in the gallery mosaic.';
CREATE INDEX ix_gallery_items_category ON gallery_items (category);
CREATE INDEX ix_gallery_items_sort_order ON gallery_items (sort_order);

-- ---------------------------------------------------------------------
-- videos: Videos
--   YouTube videos shown on the gallery page.
--   Written by: Admin > Videos
--   Rows: 8 today
-- ---------------------------------------------------------------------
CREATE TABLE videos (
  id           VARCHAR(100)   NOT NULL COMMENT 'e.g. ''bootcamp-2023'' or ''video-xxxxxxx''.',
  title        VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Video title.',
  description  TEXT           NOT NULL DEFAULT ('') COMMENT 'Short description.',
  youtube_id   VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'The 11-character YouTube ID or a full YouTube link (watch, youtu.be, embed, shorts). The site extracts the ID.',
  thumb        VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Optional thumbnail image. Empty = use YouTube''s own thumbnail.',
  category     VARCHAR(80)    NOT NULL DEFAULT 'Highlights' COMMENT 'Free text, e.g. Bootcamp, Competition, Inside AFRISTEM.',
  featured     BOOLEAN        NOT NULL DEFAULT FALSE COMMENT '''Feature on homepage'' (stored, not used by the public site yet).',
  sort_order   INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Videos: YouTube videos shown on the gallery page.';
CREATE INDEX ix_videos_sort_order ON videos (sort_order);

-- ---------------------------------------------------------------------
-- faqs: FAQs
--   Questions and answers.
--   Written by: Admin > FAQs
--   Rows: 11 today
-- ---------------------------------------------------------------------
CREATE TABLE faqs (
  id          VARCHAR(100)  NOT NULL COMMENT 'e.g. ''faq-1''.',
  question    VARCHAR(500)  NOT NULL DEFAULT '' COMMENT 'The question.',
  answer      TEXT          NOT NULL DEFAULT ('') COMMENT 'The answer.',
  category    VARCHAR(80)   NOT NULL DEFAULT 'General' COMMENT 'Free text grouping (not displayed yet).',
  sort_order  INT           NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='FAQs: Questions and answers.';
CREATE INDEX ix_faqs_sort_order ON faqs (sort_order);

-- ---------------------------------------------------------------------
-- testimonials: Testimonials
--   Quotes from schools, teachers and students.
--   Written by: Admin > Testimonials
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE testimonials (
  id          VARCHAR(100)   NOT NULL COMMENT 'e.g. ''testimonial-1''.',
  quote       TEXT           NOT NULL DEFAULT ('') COMMENT 'The quote.',
  name        VARCHAR(120)   NOT NULL DEFAULT '' COMMENT 'Person (or role) quoted.',
  role        VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'e.g. ''Science Teacher''.',
  org         VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'School / organisation. Shown after the role.',
  image       VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Optional photo (not displayed yet).',
  initials    VARCHAR(10)    NOT NULL DEFAULT '' COMMENT 'Avatar letters (up to 2). If empty the site uses the first letters of the first two words of the name.',
  featured    BOOLEAN        NOT NULL DEFAULT FALSE COMMENT '''Feature'' flag (stored, not used by the public site yet).',
  sort_order  INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Testimonials: Quotes from schools, teachers and students.';
CREATE INDEX ix_testimonials_sort_order ON testimonials (sort_order);

-- ---------------------------------------------------------------------
-- partners: Partners and sponsors
--   Partner organisations with logos and descriptions.
--   Written by: Admin > Partners
--   Rows: 4 today
-- ---------------------------------------------------------------------
CREATE TABLE partners (
  id           VARCHAR(100)   NOT NULL COMMENT 'Seed rows: ''partner-<n>''; admin-created: ''partner-xxxxxxx''.',
  slug         VARCHAR(160)   NOT NULL DEFAULT '' COMMENT 'Unique identifier text.',
  name         VARCHAR(200)   NOT NULL DEFAULT '' COMMENT 'Organisation name.',
  logo         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Logo image (path/URL).',
  type         VARCHAR(80)    NOT NULL DEFAULT 'Partner' COMMENT 'Free text, e.g. ''Strategic Partner''.',
  description  JSON           NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Description paragraphs, in order.',
  href         VARCHAR(1024)  NOT NULL DEFAULT '' COMMENT 'Website or internal page.',
  cta_label    VARCHAR(80)    NOT NULL DEFAULT 'Learn more' COMMENT 'Button text.',
  external     BOOLEAN        NOT NULL DEFAULT FALSE COMMENT 'Open the link in a new tab.',
  country      VARCHAR(80)    NOT NULL DEFAULT '' COMMENT 'Optional country. Empty = not shown.',
  sort_order   INT            NOT NULL DEFAULT 0 COMMENT 'Display position, 0 = first. Rewrite as 0,1,2... whenever the admin saves the list (the admin can reorder items).',
  created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_partners_slug UNIQUE (slug),
  CONSTRAINT ck_partners_slug_not_empty CHECK (slug <> ''),
  CONSTRAINT ck_partners_description_array CHECK (JSON_TYPE(description) = 'ARRAY')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Partners and sponsors: Partner organisations with logos and descriptions.';
CREATE INDEX ix_partners_sort_order ON partners (sort_order);

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
  id            VARCHAR(100)  NOT NULL COMMENT 'Generated by the app: ''msg-<time><random>''.',
  name          VARCHAR(120)  NOT NULL COMMENT 'Sender''s full name. Required.',
  email         VARCHAR(200)  NOT NULL COMMENT 'Sender''s email. Required, validated as an email address.',
  phone         VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Optional phone.',
  organisation  VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'Organisation / school (optional).',
  category      VARCHAR(80)   NOT NULL DEFAULT 'General Enquiry' COMMENT '''I am a...'' dropdown value.',
  subject       VARCHAR(200)  NOT NULL COMMENT 'Subject. Required.',
  message       TEXT          NOT NULL COMMENT 'Message body. Required. The app caps it at 5,000 characters.',
  status        VARCHAR(20)   NOT NULL DEFAULT 'new' COMMENT 'Inbox workflow status. Allowed: new, in-progress, replied, closed.',
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT ck_contact_messages_name_not_empty CHECK (name <> ''),
  CONSTRAINT ck_contact_messages_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_contact_messages_subject_not_empty CHECK (subject <> ''),
  CONSTRAINT ck_contact_messages_message_not_empty CHECK (message <> ''),
  CONSTRAINT ck_contact_messages_status CHECK (status COLLATE utf8mb4_bin IN ('new', 'in-progress', 'replied', 'closed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Contact form messages: Messages sent through the contact form (/contact).';
CREATE INDEX ix_contact_messages_created_at ON contact_messages (created_at);
CREATE INDEX ix_contact_messages_status ON contact_messages (status);
CREATE INDEX ix_contact_messages_email ON contact_messages (email);

-- ---------------------------------------------------------------------
-- contact_message_notes: Notes and replies on contact messages
--   The timeline under each message: internal notes typed by the admin, and every email reply that was sent.
--   Written by: Admin (Add note / Send reply)
--   Rows: 0-several per message
-- ---------------------------------------------------------------------
CREATE TABLE contact_message_notes (
  id                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT COMMENT 'Auto-increment number.',
  contact_message_id  VARCHAR(100)     NOT NULL COMMENT 'The message this note belongs to.',
  kind                VARCHAR(10)      NOT NULL DEFAULT 'note' COMMENT '''note'' = internal note; ''reply'' = an email reply that was sent to the person. Allowed: note, reply.',
  reply_subject       VARCHAR(255)     NOT NULL DEFAULT '' COMMENT 'Email subject. Replies only; empty for notes.',
  email_status        VARCHAR(20)      NULL COMMENT 'Replies only (NULL for notes): sent = delivered to the email provider; logged_only = no email key configured, so nothing was sent; failed = provider rejected it. Allowed: sent, logged_only, failed.',
  body                TEXT             NOT NULL COMMENT 'The note text, or the reply message that was emailed.',
  author              VARCHAR(80)      NOT NULL DEFAULT 'admin' COMMENT 'Who wrote it. Always ''admin'' today (single admin account).',
  created_at          DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  PRIMARY KEY (id),
  CONSTRAINT ck_contact_message_notes_kind CHECK (kind COLLATE utf8mb4_bin IN ('note', 'reply')),
  CONSTRAINT ck_contact_message_notes_email_status CHECK (email_status COLLATE utf8mb4_bin IN ('sent', 'logged_only', 'failed')),
  CONSTRAINT ck_contact_message_notes_body_not_empty CHECK (body <> ''),
  CONSTRAINT fk_contact_message_notes_contact_message_id FOREIGN KEY (contact_message_id) REFERENCES contact_messages (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Notes and replies on contact messages: The timeline under each message: internal notes typed by the admin, and every email reply that was sent.';
CREATE INDEX ix_contact_message_notes_contact_message_id_created_at ON contact_message_notes (contact_message_id, created_at);

-- ---------------------------------------------------------------------
-- registrations: Programme / event registrations
--   Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations.
--   Written by: Website visitors (POST /api/register). Admin changes status, adds notes, replies by email, deletes.
--   Rows: Grows over time (hundreds to thousands per year)
-- ---------------------------------------------------------------------
CREATE TABLE registrations (
  id                     VARCHAR(100)  NOT NULL COMMENT 'Generated by the app: ''reg-<time><random>''.',
  reference              VARCHAR(20)   NOT NULL COMMENT 'Reference shown to the registrant, format AFR-<year>-<5 letters/digits>, e.g. AFR-2026-1F4C9. Unique.',
  type                   VARCHAR(20)   NOT NULL COMMENT '''I am registering as a...''. Required. Allowed: student, school, educator, professional, partner.',
  programme_slug         VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'Programme chosen (its slug), kept as text so the record survives programme edits or deletion. Empty = none.',
  programme_id           VARCHAR(100)  NULL COMMENT 'Link to programmes.id when programme_slug matches a programme. NULL otherwise.',
  event_ref              VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'Event chosen (an events.slug; older short codes in shared links are translated by the register page). Empty = none.',
  event_id               VARCHAR(100)  NULL COMMENT 'Link to events.id when event_ref matches an event slug. NULL otherwise.',
  category               VARCHAR(80)   NOT NULL DEFAULT '' COMMENT 'Participant category. Optional.',
  preferred_format       VARCHAR(20)   NOT NULL DEFAULT '' COMMENT 'Preferred format. Optional.',
  full_name              VARCHAR(120)  NOT NULL COMMENT 'Full name exactly as typed (for schools: the contact person). Required.',
  first_name             VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'First word of full_name.',
  last_name              VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'Everything after the first word of full_name.',
  date_of_birth          DATE          NULL COMMENT 'Students only (required for students on the form). Used to decide if a parent/guardian is needed (under 18).',
  gender                 VARCHAR(20)   NOT NULL DEFAULT '' COMMENT 'Students only. Optional.',
  email                  VARCHAR(200)  NOT NULL COMMENT 'Email. Required, validated as an email address.',
  phone                  VARCHAR(40)   NOT NULL COMMENT 'Phone. Required.',
  school_name            VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'School name. Required on the form for students and schools.',
  grade                  VARCHAR(80)   NOT NULL DEFAULT '' COMMENT 'Students: class/grade, e.g. ''JSS 2''. Required for students.',
  school_location        VARCHAR(200)  NOT NULL DEFAULT '' COMMENT '''City, State, Country'' free text. Required for schools.',
  state                  VARCHAR(80)   NOT NULL DEFAULT '' COMMENT 'State (exists in today''s record; the current form does not ask for it).',
  city                   VARCHAR(80)   NOT NULL DEFAULT '' COMMENT 'City (exists in today''s record; the current form does not ask for it).',
  role                   VARCHAR(80)   NOT NULL DEFAULT '' COMMENT 'Educators / professionals / partners: ''Role / Profession'' (required for them).',
  organisation           VARCHAR(160)  NOT NULL DEFAULT '' COMMENT 'Educators / professionals / partners: organisation. Optional.',
  participants           VARCHAR(20)   NOT NULL DEFAULT '' COMMENT 'Number of participants (exists in today''s record; the current form puts this in applicant_notes instead).',
  applicant_notes        TEXT          NOT NULL DEFAULT ('') COMMENT 'Free-text notes from the applicant, e.g. schools: ''Estimated number of students & any notes''. The app caps it at 3,000 characters.',
  guardian_name          VARCHAR(120)  NOT NULL DEFAULT '' COMMENT 'Parent/guardian name. Required on the form for students under 18.',
  guardian_phone         VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Parent/guardian phone. Required on the form for students under 18.',
  guardian_email         VARCHAR(200)  NOT NULL DEFAULT '' COMMENT 'Parent/guardian email. Optional.',
  guardian_relationship  VARCHAR(40)   NOT NULL DEFAULT '' COMMENT 'Relationship to the participant. Optional.',
  consent_given          BOOLEAN       NOT NULL DEFAULT FALSE COMMENT 'Applicant ticked the Privacy Policy / Terms box. The server refuses registrations without it, so the app must store TRUE.',
  consent_at             DATETIME(3)   NULL COMMENT 'When consent was given (= submission time).',
  status                 VARCHAR(20)   NOT NULL DEFAULT 'new' COMMENT 'Workflow status. Allowed: new, contacted, confirmed, waitlist, declined.',
  created_at             DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at             DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_registrations_reference UNIQUE (reference),
  CONSTRAINT ck_registrations_reference_not_empty CHECK (reference <> ''),
  CONSTRAINT ck_registrations_type CHECK (type COLLATE utf8mb4_bin IN ('student', 'school', 'educator', 'professional', 'partner')),
  CONSTRAINT ck_registrations_full_name_not_empty CHECK (full_name <> ''),
  CONSTRAINT ck_registrations_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_registrations_phone_not_empty CHECK (phone <> ''),
  CONSTRAINT ck_registrations_status CHECK (status COLLATE utf8mb4_bin IN ('new', 'contacted', 'confirmed', 'waitlist', 'declined')),
  CONSTRAINT fk_registrations_programme_id FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_event_id FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Programme / event registrations: Everything submitted through the 4-step registration form (/register): students, schools, educators, STEM professionals and partner organisations.';
CREATE INDEX ix_registrations_created_at ON registrations (created_at);
CREATE INDEX ix_registrations_status ON registrations (status);
CREATE INDEX ix_registrations_email ON registrations (email);
CREATE INDEX ix_registrations_programme_slug ON registrations (programme_slug);
CREATE INDEX ix_registrations_programme_id ON registrations (programme_id);
CREATE INDEX ix_registrations_event_id ON registrations (event_id);

-- ---------------------------------------------------------------------
-- registration_notes: Notes and replies on registrations
--   The timeline under each registration: internal notes and every email reply sent.
--   Written by: Admin (Add note / Send reply)
--   Rows: 0-several per registration
-- ---------------------------------------------------------------------
CREATE TABLE registration_notes (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT COMMENT 'Auto-increment number.',
  registration_id  VARCHAR(100)     NOT NULL COMMENT 'The registration this note belongs to.',
  kind             VARCHAR(10)      NOT NULL DEFAULT 'note' COMMENT '''note'' = internal note; ''reply'' = an email reply that was sent to the person. Allowed: note, reply.',
  reply_subject    VARCHAR(255)     NOT NULL DEFAULT '' COMMENT 'Email subject. Replies only; empty for notes.',
  email_status     VARCHAR(20)      NULL COMMENT 'Replies only (NULL for notes): sent, logged_only (no email key configured) or failed. Allowed: sent, logged_only, failed.',
  body             TEXT             NOT NULL COMMENT 'The note text, or the reply message that was emailed.',
  author           VARCHAR(80)      NOT NULL DEFAULT 'admin' COMMENT 'Who wrote it. Always ''admin'' today.',
  created_at       DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  PRIMARY KEY (id),
  CONSTRAINT ck_registration_notes_kind CHECK (kind COLLATE utf8mb4_bin IN ('note', 'reply')),
  CONSTRAINT ck_registration_notes_email_status CHECK (email_status COLLATE utf8mb4_bin IN ('sent', 'logged_only', 'failed')),
  CONSTRAINT ck_registration_notes_body_not_empty CHECK (body <> ''),
  CONSTRAINT fk_registration_notes_registration_id FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Notes and replies on registrations: The timeline under each registration: internal notes and every email reply sent.';
CREATE INDEX ix_registration_notes_registration_id_created_at ON registration_notes (registration_id, created_at);

-- ---------------------------------------------------------------------
-- newsletter_subscribers: Newsletter subscribers
--   Emails from the newsletter box (footer/home) and the 'Notify me' box on /stem-guide-for-schools.
--   Written by: Website visitors (POST /api/newsletter). Admin toggles subscribed/unsubscribed, deletes.
--   Rows: Grows over time (thousands)
-- ---------------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id               VARCHAR(100)  NOT NULL COMMENT 'Generated by the app: ''sub-<time><random>''.',
  email            VARCHAR(200)  NOT NULL COMMENT 'Email address, stored in lowercase. Unique (one row per person).',
  status           VARCHAR(20)   NOT NULL DEFAULT 'subscribed' COMMENT 'Subscription status. Allowed: subscribed, unsubscribed.',
  source           VARCHAR(40)   NOT NULL DEFAULT 'newsletter' COMMENT 'Which form they used: newsletter (footer / homepage box) or stem-guide (''Notify me'' on /stem-guide-for-schools).',
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  unsubscribed_at  DATETIME(3)   NULL COMMENT 'When they were marked unsubscribed. NULL while subscribed.',
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'Last change (UTC). Maintained automatically.',
  PRIMARY KEY (id),
  CONSTRAINT uq_newsletter_subscribers_email UNIQUE (email),
  CONSTRAINT ck_newsletter_subscribers_email_not_empty CHECK (email <> ''),
  CONSTRAINT ck_newsletter_subscribers_status CHECK (status COLLATE utf8mb4_bin IN ('subscribed', 'unsubscribed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Newsletter subscribers: Emails from the newsletter box (footer/home) and the ''Notify me'' box on /stem-guide-for-schools.';
CREATE INDEX ix_newsletter_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX ix_newsletter_subscribers_created_at ON newsletter_subscribers (created_at);

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
  id               SMALLINT      NOT NULL DEFAULT 1 COMMENT 'Always 1 - this table holds exactly one row.',
  password_hash    VARCHAR(128)  NOT NULL COMMENT 'PBKDF2-HMAC-SHA256, 120,000 iterations, 32-byte output, base64url without padding (43 characters).',
  password_salt    VARCHAR(64)   NOT NULL COMMENT '16 random bytes as base64url (22 characters). Note: the UTF-8 bytes of this salt *string* are what is fed to PBKDF2.',
  hash_algorithm   VARCHAR(30)   NOT NULL DEFAULT 'pbkdf2-sha256' COMMENT 'Documents the algorithm (for future upgrades).',
  hash_iterations  INT           NOT NULL DEFAULT 120000 COMMENT 'PBKDF2 iteration count used for this hash.',
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT 'When the password was last set (UTC).',
  PRIMARY KEY (id),
  CONSTRAINT ck_admin_account_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Admin dashboard password: The single password that opens /admin. Only a salted hash is stored, never the password.';

-- ---------------------------------------------------------------------
-- media_files: Uploaded images
--   Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database.
--   Written by: Admin image uploads (POST /api/admin/upload)
--   Rows: Grows over time
-- ---------------------------------------------------------------------
CREATE TABLE media_files (
  id             VARCHAR(100)   NOT NULL COMMENT 'e.g. ''media-<file name without .jpg>''.',
  file_name      VARCHAR(255)   NOT NULL COMMENT 'Stored file name, e.g. ''mgz3k2a1-3fa9c1.jpg''. Unique.',
  url            VARCHAR(1024)  NOT NULL COMMENT 'URL saved into content, e.g. ''/api/media/mgz3k2a1-3fa9c1.jpg'' or a full CDN URL.',
  storage        VARCHAR(20)    NOT NULL DEFAULT 'local' COMMENT 'Where the bytes live.',
  mime_type      VARCHAR(60)    NOT NULL DEFAULT 'image/jpeg' COMMENT 'Uploads are always converted to JPEG today.',
  size_bytes     INT            NOT NULL DEFAULT 0 COMMENT 'File size after processing.',
  width          INT            NULL COMMENT 'Pixels (optional).',
  height         INT            NULL COMMENT 'Pixels (optional).',
  original_name  VARCHAR(255)   NOT NULL DEFAULT '' COMMENT 'Original file name the admin uploaded (optional).',
  created_at     DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'When the row was created (UTC).',
  PRIMARY KEY (id),
  CONSTRAINT uq_media_files_file_name UNIQUE (file_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Uploaded images: Registry of images the admin uploads (gallery photos, event images, logos...). The image bytes themselves live in file/object storage, not in the database.';
CREATE INDEX ix_media_files_created_at ON media_files (created_at);

