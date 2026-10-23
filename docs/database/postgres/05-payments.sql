-- =====================================================================
--  AFRISTEM Global website - TWO-STEP REGISTRATION, PAYMENT PROOF (PostgreSQL)
--
--  Run AFTER 01-schema.sql, 02-seed.sql, 03-supabase-security.sql and
--  04-supabase-api.sql. Safe to re-run: columns are added with IF NOT EXISTS,
--  tables with IF NOT EXISTS, every function is CREATE OR REPLACE, and the
--  seed only fills payment settings that are still empty.
--
--  What this script adds
--   1. Payment settings on every programme and every event
--      (requires payment, fee, payment instructions).
--   2. Payment state on every registration (not_required, awaiting_receipt,
--      under_review, approved, rejected), a fee snapshot, the payment
--      instructions snapshot, the unique registration number and the reason a
--      receipt was rejected.
--   3. registration_payments: the history of every receipt upload and every
--      decision (file, time, decision, reason, reviewer).
--   4. The PRIVATE Storage bucket "receipts" (JPG/PNG/WebP/PDF, max 10 MB) and
--      the database functions the website calls.
--   5. The default seed: African Organic Chemistry Tournament and STEM Kids
--      Championship require payment; everything else does not.
--
--  Security: RLS on, no policies, table/sequence privileges removed from
--  anon/authenticated, functions executable by service_role only — exactly
--  like the rest of the database.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. Payment settings on programmes and events
-- =====================================================================

ALTER TABLE programmes ADD COLUMN IF NOT EXISTS payment_required     boolean NOT NULL DEFAULT false;
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS fee                  text    NOT NULL DEFAULT '';
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS payment_instructions text    NOT NULL DEFAULT '';

ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_required     boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS fee                  text    NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_instructions text    NOT NULL DEFAULT '';

COMMENT ON COLUMN programmes.payment_required IS 'Students and schools registering for this programme must pay before the registration is confirmed. Educators, STEM professionals and partners never pay.';
COMMENT ON COLUMN programmes.fee IS 'Fee shown to the registrant, e.g. ''₦7,000 per candidate''. Free text; empty when no payment is required.';
COMMENT ON COLUMN programmes.payment_instructions IS 'How to pay: bank, account number, account name. Empty when no payment is required.';
COMMENT ON COLUMN events.payment_required IS 'Students and schools registering for this event must pay before the registration is confirmed. Educators, STEM professionals and partners never pay.';
COMMENT ON COLUMN events.fee IS 'Fee shown to the registrant, e.g. ''₦2,000 per candidate''. Free text; empty when no payment is required.';
COMMENT ON COLUMN events.payment_instructions IS 'How to pay: bank, account number, account name. Empty when no payment is required.';

-- =====================================================================
-- 2. Payment state on registrations
-- =====================================================================

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status       varchar(20) NOT NULL DEFAULT 'not_required';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS fee                  varchar(300) NOT NULL DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_instructions text        NOT NULL DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS registration_number  varchar(40) NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reason       text        NOT NULL DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_reviewed_at  timestamptz NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS confirmed_at         timestamptz NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_registrations_payment_status') THEN
    ALTER TABLE registrations ADD CONSTRAINT ck_registrations_payment_status
      CHECK (payment_status IN ('not_required', 'awaiting_receipt', 'under_review', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_registrations_registration_number_not_empty') THEN
    ALTER TABLE registrations ADD CONSTRAINT ck_registrations_registration_number_not_empty
      CHECK (registration_number IS NULL OR btrim(registration_number) <> '');
  END IF;
END
$$;

-- Registration numbers are unique across all registrations, whatever the case.
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_registration_number
  ON registrations (upper(registration_number))
  WHERE registration_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_registrations_payment_status ON registrations (payment_status);

COMMENT ON COLUMN registrations.payment_status IS 'Payment stage. not_required = free registration; awaiting_receipt = the person still has to pay and upload proof; under_review = a receipt was uploaded and an admin must decide; approved = receipt accepted; rejected = receipt refused (the reason is in payment_reason) and the person may upload again.';
COMMENT ON COLUMN registrations.fee IS 'The fee copied from the programme/event when the registration was made, so the amount quoted never changes afterwards.';
COMMENT ON COLUMN registrations.payment_instructions IS 'The payment instructions copied from the programme/event when the registration was made.';
COMMENT ON COLUMN registrations.registration_number IS 'The person''s official registration number, entered by the admin when the receipt is approved (or when a free registration is confirmed). Unique across all registrations.';
COMMENT ON COLUMN registrations.payment_reason IS 'Why the last receipt was rejected. Empty unless payment_status = rejected.';
COMMENT ON COLUMN registrations.payment_reviewed_at IS 'When the last approve/reject decision was made (UTC).';
COMMENT ON COLUMN registrations.confirmed_at IS 'When the registration became confirmed (payment approved, or a free registration confirmed by the admin).';

-- =====================================================================
-- 3. Receipt and decision history
-- =====================================================================

CREATE TABLE IF NOT EXISTS registration_payments (
  id               bigint GENERATED BY DEFAULT AS IDENTITY  NOT NULL,
  registration_id  varchar(100)                             NOT NULL,
  kind             varchar(20)                              NOT NULL  DEFAULT 'receipt',
  file_path        text                                     NOT NULL  DEFAULT '',
  file_name        varchar(255)                             NOT NULL  DEFAULT '',
  mime_type        varchar(100)                             NOT NULL  DEFAULT '',
  size_bytes       bigint                                   NULL,
  reason           text                                     NOT NULL  DEFAULT '',
  reviewer         varchar(80)                              NOT NULL  DEFAULT '',
  created_at       timestamptz                              NOT NULL  DEFAULT now(),
  CONSTRAINT pk_registration_payments PRIMARY KEY (id),
  CONSTRAINT ck_registration_payments_kind CHECK (kind IN ('receipt', 'approved', 'rejected', 'confirmed')),
  CONSTRAINT ck_registration_payments_file_path CHECK (kind <> 'receipt' OR file_path <> ''),
  CONSTRAINT fk_registration_payments_registration_id FOREIGN KEY (registration_id)
    REFERENCES registrations (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_registration_payments_registration_id_created_at
  ON registration_payments (registration_id, created_at);

COMMENT ON TABLE registration_payments IS 'History of payment proof: every receipt a person uploaded and every admin decision about it (with the reason and who decided).';
COMMENT ON COLUMN registration_payments.id IS 'Auto-increment number.';
COMMENT ON COLUMN registration_payments.registration_id IS 'The registration this entry belongs to. Deleted with it.';
COMMENT ON COLUMN registration_payments.kind IS '''receipt'' = a file the person uploaded; ''approved'' = an admin accepted it and issued the registration number; ''rejected'' = an admin refused it (reason recorded); ''confirmed'' = a free registration confirmed by the admin. Allowed: receipt, approved, rejected, confirmed.';
COMMENT ON COLUMN registration_payments.file_path IS 'Object path inside the private Storage bucket "receipts". Empty for decisions.';
COMMENT ON COLUMN registration_payments.file_name IS 'Original file name as uploaded, shown to the admin.';
COMMENT ON COLUMN registration_payments.mime_type IS 'Real file type detected from the file contents: image/jpeg, image/png, image/webp or application/pdf.';
COMMENT ON COLUMN registration_payments.size_bytes IS 'File size in bytes (max 10 MB).';
COMMENT ON COLUMN registration_payments.reason IS 'The admin''s reason when a receipt is rejected, or an optional note on a decision.';
COMMENT ON COLUMN registration_payments.reviewer IS 'Who made the decision. Always ''admin'' today.';
COMMENT ON COLUMN registration_payments.created_at IS 'When the upload/decision happened (UTC).';

-- =====================================================================
-- 4. Default payment settings (only where nothing has been set yet)
--    Two programmes charge. Everything else is free.
-- =====================================================================

UPDATE programmes
   SET payment_required = true,
       fee = '₦7,000 per candidate, or ₦5,000 each for 10 or more',
       payment_instructions = 'Pay to 1025357212 / UBA / Prime STEM Nigeria'
 WHERE slug = 'african-organic-chemistry-tournament'
   AND payment_instructions = ''
   AND fee = '';

UPDATE programmes
   SET payment_required = true,
       fee = '₦2,000 per candidate (early bird, schools entering 10 or more)',
       payment_instructions = 'Pay to 1025357212 / UBA / Prime STEM Nigeria'
 WHERE slug = 'stem-kids-championship'
   AND payment_instructions = ''
   AND fee = '';

-- =====================================================================
-- 5. Existing registrations
--    Free unless the programme (or event) they chose requires payment, in
--    which case they start at "awaiting receipt" with the fee snapshot.
--    Registrations that already have a payment state, a number or history
--    are left exactly as they are.
-- =====================================================================

UPDATE registrations r
   SET payment_status = CASE
         WHEN r.type IN ('student', 'school')
          AND (EXISTS (SELECT 1 FROM programmes p WHERE p.id = r.programme_id AND p.payment_required)
               OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND e.payment_required))
         THEN 'awaiting_receipt' ELSE 'not_required' END,
       fee = CASE
         WHEN r.type IN ('student', 'school')
          AND (EXISTS (SELECT 1 FROM programmes p WHERE p.id = r.programme_id AND p.payment_required)
               OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND e.payment_required))
         THEN coalesce(
                (SELECT p.fee FROM programmes p WHERE p.id = r.programme_id AND p.payment_required),
                (SELECT e.fee FROM events e WHERE e.id = r.event_id AND e.payment_required),
                '')
         ELSE '' END,
       payment_instructions = CASE
         WHEN r.type IN ('student', 'school')
          AND (EXISTS (SELECT 1 FROM programmes p WHERE p.id = r.programme_id AND p.payment_required)
               OR EXISTS (SELECT 1 FROM events e WHERE e.id = r.event_id AND e.payment_required))
         THEN coalesce(
                (SELECT p.payment_instructions FROM programmes p WHERE p.id = r.programme_id AND p.payment_required),
                (SELECT e.payment_instructions FROM events e WHERE e.id = r.event_id AND e.payment_required),
                '')
         ELSE '' END
 WHERE r.payment_status = 'not_required'
   AND r.registration_number IS NULL
   AND NOT EXISTS (SELECT 1 FROM registration_payments rp WHERE rp.registration_id = r.id);

-- =====================================================================
-- 6. Reading content: programme/event payment settings travel with the
--    content, so the public pages and the admin editors both see them.
--    (Same function as 04, with three extra keys per programme and event.)
-- =====================================================================

CREATE OR REPLACE FUNCTION app_get_content() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
SELECT jsonb_build_object(
  'updatedAt', _app_iso((SELECT max(t) FROM (
        SELECT max(updated_at) AS t FROM announcement
        UNION ALL SELECT max(updated_at) FROM hero_content
        UNION ALL SELECT max(updated_at) FROM site_settings
        UNION ALL SELECT max(updated_at) FROM site_offices
        UNION ALL SELECT max(updated_at) FROM site_social_links
        UNION ALL SELECT max(updated_at) FROM site_external_links
        UNION ALL SELECT max(updated_at) FROM stats
        UNION ALL SELECT max(updated_at) FROM programmes
        UNION ALL SELECT max(updated_at) FROM events
        UNION ALL SELECT max(updated_at) FROM news_posts
        UNION ALL SELECT max(updated_at) FROM gallery_items
        UNION ALL SELECT max(updated_at) FROM videos
        UNION ALL SELECT max(updated_at) FROM faqs
        UNION ALL SELECT max(updated_at) FROM testimonials
        UNION ALL SELECT max(updated_at) FROM partners) u)),

  'announcement', (SELECT jsonb_build_object(
        'enabled', a.enabled, 'tone', a.tone, 'label', a.label, 'message', a.message,
        'href', a.href, 'linkLabel', a.link_label,
        'startsAt', _app_date(a.starts_at), 'endsAt', _app_date(a.ends_at))
      FROM announcement a WHERE a.id = 1),

  'hero', (SELECT jsonb_build_object(
        'badgeLabel', h.badge_label, 'badgeText', h.badge_text, 'badgeHref', h.badge_href,
        'headline', h.headline, 'rotatingWords', h.rotating_words, 'subheading', h.subheading,
        'primaryCtaLabel', h.primary_cta_label, 'primaryCtaHref', h.primary_cta_href,
        'secondaryCtaLabel', h.secondary_cta_label, 'secondaryCtaHref', h.secondary_cta_href,
        'backgroundImage', h.background_image, 'featureImage', h.feature_image,
        'featureEyebrow', h.feature_eyebrow, 'featureCaption', h.feature_caption,
        'secondaryImage', h.secondary_image, 'secondaryImageCaption', h.secondary_image_caption)
      FROM hero_content h WHERE h.id = 1),

  'site', (SELECT jsonb_build_object(
        'name', s.name, 'tagline', s.tagline, 'description', s.description, 'email', s.email,
        'primaryPhone', s.primary_phone, 'whatsapp', s.whatsapp, 'secondaryPhone', s.secondary_phone,
        'address', s.address, 'registrationNote', s.registration_note,
        'registrationOpens', _app_date(s.registration_opens), 'registrationCloses', _app_date(s.registration_closes),
        'footerNote', s.footer_note,
        'offices', coalesce((SELECT jsonb_agg(jsonb_build_object(
              'id', o.id, 'name', o.name, 'city', o.city, 'address', o.address, 'phone', o.phone, 'mapQuery', o.map_query)
              ORDER BY o.sort_order, o.created_at, o.id) FROM site_offices o), '[]'::jsonb),
        'socials', coalesce((SELECT jsonb_agg(jsonb_build_object(
              'id', l.id, 'label', l.label, 'href', l.href, 'icon', l.icon)
              ORDER BY l.sort_order, l.created_at, l.id) FROM site_social_links l), '[]'::jsonb),
        'externalLinks', coalesce((SELECT jsonb_agg(jsonb_build_object(
              'id', x.id, 'label', x.label, 'href', x.href, 'description', x.description)
              ORDER BY x.sort_order, x.created_at, x.id) FROM site_external_links x), '[]'::jsonb))
      FROM site_settings s WHERE s.id = 1),

  'stats', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'value', t.value, 'label', t.label, 'icon', t.icon)
        ORDER BY t.sort_order, t.created_at, t.id) FROM stats t), '[]'::jsonb),

  'programmes', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'name', p.name, 'subtitle', p.subtitle, 'tagline', p.tagline,
        'shortDescription', p.short_description, 'eligibility', p.eligibility, 'format', p.format,
        'ageRange', p.age_range, 'image', p.image, 'imageAlt', p.image_alt, 'pillar', p.pillar,
        'ctaLabel', p.cta_label, 'highlights', _app_format_highlights(p.highlights),
        'prizeNote', p.prize_note, 'poster', p.poster, 'registerHref', p.register_href,
        'featured', p.featured, 'status', p.status, 'pillarBlurb', p.pillar_blurb,
        'description', p.description, 'objectives', p.objectives, 'accent', p.accent, 'icon', p.icon,
        'requiresPayment', p.payment_required, 'fee', p.fee, 'paymentInstructions', p.payment_instructions)
        ORDER BY p.sort_order, p.created_at, p.id) FROM programmes p), '[]'::jsonb),

  'events', coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', e.id, 'slug', e.slug, 'title', e.title, 'start', _app_date(e.start_date),
        'end', to_char(e.end_date, 'YYYY-MM-DD'), 'displayDate', e.display_date, 'location', e.location,
        'mode', e.mode, 'description', e.description, 'deadline', nullif(e.deadline, ''),
        'registerHref', e.register_href, 'tag', e.tag, 'image', e.image,
        'requiresPayment', e.payment_required, 'fee', nullif(e.fee, ''),
        'paymentInstructions', nullif(e.payment_instructions, '')))
        ORDER BY e.sort_order, e.created_at, e.id) FROM events e), '[]'::jsonb),

  'news', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', n.id, 'slug', n.slug, 'title', n.title, 'excerpt', n.excerpt, 'category', n.category,
        'date', _app_date(n.published_on), 'displayDate', n.display_date, 'readTime', n.read_time,
        'image', n.image, 'author', n.author, 'body', n.body)
        ORDER BY n.sort_order, n.created_at, n.id) FROM news_posts n), '[]'::jsonb),

  'gallery', coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', g.id, 'src', g.src, 'alt', g.alt, 'caption', g.caption, 'category', g.category,
        'span', nullif(g.span, '')))
        ORDER BY g.sort_order, g.created_at, g.id) FROM gallery_items g), '[]'::jsonb),

  'videos', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', v.id, 'title', v.title, 'description', v.description, 'youtubeId', v.youtube_id,
        'thumb', v.thumb, 'category', v.category, 'featured', v.featured)
        ORDER BY v.sort_order, v.created_at, v.id) FROM videos v), '[]'::jsonb),

  'faqs', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', f.id, 'question', f.question, 'answer', f.answer, 'category', f.category)
        ORDER BY f.sort_order, f.created_at, f.id) FROM faqs f), '[]'::jsonb),

  'testimonials', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'quote', t.quote, 'name', t.name, 'role', t.role, 'org', t.org,
        'image', t.image, 'initials', t.initials, 'featured', t.featured)
        ORDER BY t.sort_order, t.created_at, t.id) FROM testimonials t), '[]'::jsonb),

  'partners', coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'name', p.name, 'logo', p.logo, 'type', p.type,
        'description', p.description, 'href', p.href, 'ctaLabel', p.cta_label,
        'external', CASE WHEN p.external THEN true END, 'country', nullif(p.country, '')))
        ORDER BY p.sort_order, p.created_at, p.id) FROM partners p), '[]'::jsonb),

  'newsCategories', coalesce((SELECT jsonb_agg(jsonb_build_object('name', c.name, 'description', c.description)
        ORDER BY c.sort_order, c.name) FROM news_categories c), '[]'::jsonb),

  'galleryCategories', coalesce((SELECT jsonb_agg(c.name ORDER BY c.sort_order, c.name)
        FROM gallery_categories c), '[]'::jsonb)
)
$$;

-- =====================================================================
-- 7. Saving payment settings from the admin (programmes and events)
-- =====================================================================

CREATE OR REPLACE FUNCTION _app_save_programmes(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Programmes');
  DELETE FROM programmes t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  -- park changed slugs on a unique temporary value so two items can swap slugs
  UPDATE programmes t SET slug = '~' || t.id
  FROM jsonb_array_elements(p) e WHERE t.id = e->>'id' AND t.slug IS DISTINCT FROM e->>'slug';
  INSERT INTO programmes (id, slug, name, subtitle, tagline, short_description, eligibility, format, age_range,
                          image, image_alt, pillar, cta_label, highlights, prize_note, poster, register_href,
                          featured, status, pillar_blurb, description, objectives, accent, icon, sort_order,
                          payment_required, fee, payment_instructions)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'name', ''), coalesce(e->>'subtitle', ''),
         coalesce(e->>'tagline', ''), coalesce(e->>'shortDescription', ''), coalesce(e->>'eligibility', ''),
         coalesce(e->>'format', ''), coalesce(e->>'ageRange', ''), coalesce(e->>'image', ''),
         coalesce(e->>'imageAlt', ''), coalesce(nullif(e->>'pillar', ''), 'STEM'),
         coalesce(nullif(e->>'ctaLabel', ''), 'Register interest'), _app_parse_highlights(e->>'highlights'),
         coalesce(e->>'prizeNote', ''), coalesce(e->>'poster', ''),
         coalesce(nullif(e->>'registerHref', ''), '/register?programme=' || coalesce(e->>'slug', '')),
         coalesce((e->>'featured')::boolean, true), coalesce(nullif(e->>'status', ''), 'open'),
         coalesce(e->>'pillarBlurb', ''), _app_text_array(e->'description'), _app_text_array(e->'objectives'),
         coalesce(nullif(e->>'accent', ''), 'sun'), coalesce(nullif(e->>'icon', ''), 'trophy'), (o - 1)::int,
         coalesce((e->>'requiresPayment')::boolean, false), coalesce(e->>'fee', ''),
         coalesce(e->>'paymentInstructions', '')
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, subtitle = EXCLUDED.subtitle,
    tagline = EXCLUDED.tagline, short_description = EXCLUDED.short_description, eligibility = EXCLUDED.eligibility,
    format = EXCLUDED.format, age_range = EXCLUDED.age_range, image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
    pillar = EXCLUDED.pillar, cta_label = EXCLUDED.cta_label, highlights = EXCLUDED.highlights,
    prize_note = EXCLUDED.prize_note, poster = EXCLUDED.poster, register_href = EXCLUDED.register_href,
    featured = EXCLUDED.featured, status = EXCLUDED.status, pillar_blurb = EXCLUDED.pillar_blurb,
    description = EXCLUDED.description, objectives = EXCLUDED.objectives, accent = EXCLUDED.accent,
    icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order,
    payment_required = EXCLUDED.payment_required, fee = EXCLUDED.fee,
    payment_instructions = EXCLUDED.payment_instructions;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_events(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Events');
  DELETE FROM events t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  UPDATE events t SET slug = '~' || t.id
  FROM jsonb_array_elements(p) e WHERE t.id = e->>'id' AND t.slug IS DISTINCT FROM e->>'slug';
  INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description,
                      deadline, register_href, tag, image, sort_order,
                      payment_required, fee, payment_instructions)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'title', ''), nullif(e->>'start', '')::date,
         nullif(e->>'end', '')::date, coalesce(e->>'displayDate', ''), coalesce(e->>'location', ''),
         coalesce(nullif(e->>'mode', ''), 'Physical'), coalesce(e->>'description', ''), coalesce(e->>'deadline', ''),
         coalesce(nullif(e->>'registerHref', ''), '/register?event=' || coalesce(e->>'slug', '')),
         coalesce(e->>'tag', ''), coalesce(e->>'image', ''), (o - 1)::int,
         coalesce((e->>'requiresPayment')::boolean, false), coalesce(e->>'fee', ''),
         coalesce(e->>'paymentInstructions', '')
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date, display_date = EXCLUDED.display_date, location = EXCLUDED.location,
    mode = EXCLUDED.mode, description = EXCLUDED.description, deadline = EXCLUDED.deadline,
    register_href = EXCLUDED.register_href, tag = EXCLUDED.tag, image = EXCLUDED.image,
    sort_order = EXCLUDED.sort_order,
    payment_required = EXCLUDED.payment_required, fee = EXCLUDED.fee,
    payment_instructions = EXCLUDED.payment_instructions;
END;
$$;

-- =====================================================================
-- 8. Registrations carry their payment state everywhere
-- =====================================================================

CREATE OR REPLACE FUNCTION _app_registration_json(r registrations) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'id', r.id, 'createdAt', _app_iso(r.created_at), 'updatedAt', _app_iso(r.updated_at),
    'reference', r.reference, 'type', r.type,
    'programme', r.programme_slug,
    'programmeName', coalesce((SELECT p.name FROM programmes p WHERE p.id = r.programme_id), ''),
    'event', r.event_ref,
    'eventTitle', coalesce((SELECT e.title FROM events e WHERE e.id = r.event_id), ''),
    'category', r.category, 'format', r.preferred_format,
    'fullName', r.full_name, 'firstName', r.first_name, 'lastName', r.last_name,
    'dob', _app_date(r.date_of_birth), 'gender', r.gender, 'email', r.email, 'phone', r.phone,
    'school', r.school_name, 'grade', r.grade, 'schoolLocation', r.school_location,
    'state', r.state, 'city', r.city, 'role', r.role, 'organisation', r.organisation,
    'participants', r.participants, 'notes', r.applicant_notes,
    'guardianName', r.guardian_name, 'guardianPhone', r.guardian_phone,
    'guardianEmail', r.guardian_email, 'guardianRelationship', r.guardian_relationship,
    'consent', r.consent_given, 'consentAt', _app_iso(r.consent_at), 'status', r.status,
    -- payment
    'paymentStatus', r.payment_status,
    'paymentRequired', r.payment_status <> 'not_required',
    'fee', r.fee,
    'paymentInstructions', r.payment_instructions,
    'registrationNumber', r.registration_number,
    'paymentReason', r.payment_reason,
    'paymentReviewedAt', _app_iso(r.payment_reviewed_at),
    'confirmedAt', _app_iso(r.confirmed_at),
    'receipts', coalesce((SELECT jsonb_agg(jsonb_build_object(
            'id', rp.id, 'kind', rp.kind, 'at', _app_iso(rp.created_at),
            'fileName', rp.file_name, 'mimeType', rp.mime_type, 'sizeBytes', rp.size_bytes,
            'reason', rp.reason, 'reviewer', rp.reviewer, 'filePath', rp.file_path)
          ORDER BY rp.created_at DESC, rp.id DESC)
        FROM registration_payments rp WHERE rp.registration_id = r.id), '[]'::jsonb),
    'thread', coalesce((SELECT jsonb_agg(_app_note_json(n.kind, n.reply_subject, n.email_status, n.body, n.author, n.created_at)
                                 ORDER BY n.created_at, n.id)
                          FROM registration_notes n WHERE n.registration_id = r.id), '[]'::jsonb))
$$;

-- POST /api/register. Same as 04, plus the payment rule:
--   student or school  AND  the chosen programme/event requires payment
--   -> payment_status = 'awaiting_receipt', with the fee and instructions
--      copied onto the registration. Everyone else: 'not_required'.
CREATE OR REPLACE FUNCTION app_add_registration(p jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_ref text;
  v_try int := 0;
  v_created timestamptz;
  v_programme_id text;
  v_event_id text;
  v_type text := coalesce(p->>'type', '');
  v_prog_required boolean := false;
  v_event_required boolean := false;
  v_required boolean := false;
  v_fee text := '';
  v_instructions text := '';
  v_payment_status text := 'not_required';
BEGIN
  SELECT id INTO v_programme_id FROM programmes WHERE slug = nullif(p->>'programme', '');
  SELECT id INTO v_event_id FROM events WHERE slug = nullif(p->>'event', '');

  IF v_type IN ('student', 'school') THEN
    SELECT p.payment_required, p.fee, p.payment_instructions
      INTO v_prog_required, v_fee, v_instructions
      FROM programmes p WHERE p.id = v_programme_id;
    IF v_prog_required THEN
      v_required := true;
    ELSE
      v_fee := '';
      v_instructions := '';
      SELECT e.payment_required, e.fee, e.payment_instructions
        INTO v_event_required, v_fee, v_instructions
        FROM events e WHERE e.id = v_event_id;
      v_required := coalesce(v_event_required, false);
    END IF;
    IF v_required THEN
      v_payment_status := 'awaiting_receipt';
      v_fee := coalesce(v_fee, '');
      v_instructions := coalesce(v_instructions, '');
    ELSE
      v_fee := '';
      v_instructions := '';
    END IF;
  END IF;

  LOOP
    v_try := v_try + 1;
    v_ref := 'AFR-' || to_char(now() AT TIME ZONE 'UTC', 'YYYY') || '-'
             || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    BEGIN
      INSERT INTO registrations (
        id, reference, type, programme_slug, programme_id, event_ref, event_id, category, preferred_format,
        full_name, first_name, last_name, date_of_birth, gender, email, phone, school_name, grade,
        school_location, state, city, role, organisation, participants, applicant_notes,
        guardian_name, guardian_phone, guardian_email, guardian_relationship, consent_given, consent_at,
        payment_status, fee, payment_instructions)
      VALUES (
        p->>'id', v_ref, coalesce(p->>'type', ''), coalesce(p->>'programme', ''), v_programme_id,
        coalesce(p->>'event', ''), v_event_id, coalesce(p->>'category', ''), coalesce(p->>'format', ''),
        coalesce(p->>'fullName', ''), coalesce(p->>'firstName', ''), coalesce(p->>'lastName', ''),
        _app_safe_date(p->>'dob'), coalesce(p->>'gender', ''), coalesce(p->>'email', ''),
        coalesce(p->>'phone', ''), coalesce(p->>'school', ''), coalesce(p->>'grade', ''),
        coalesce(p->>'schoolLocation', ''), coalesce(p->>'state', ''), coalesce(p->>'city', ''),
        coalesce(p->>'role', ''), coalesce(p->>'organisation', ''), coalesce(p->>'participants', ''),
        coalesce(p->>'notes', ''), coalesce(p->>'guardianName', ''), coalesce(p->>'guardianPhone', ''),
        coalesce(p->>'guardianEmail', ''), coalesce(p->>'guardianRelationship', ''),
        coalesce((p->>'consent')::boolean, false),
        CASE WHEN coalesce((p->>'consent')::boolean, false) THEN now() END,
        v_payment_status, v_fee, v_instructions)
      RETURNING created_at INTO v_created;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- retry only when the generated reference clashed; anything else is a real error
      IF v_try >= 8 OR NOT EXISTS (SELECT 1 FROM registrations WHERE reference = v_ref) THEN
        RAISE;
      END IF;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true, 'id', p->>'id', 'reference', v_ref, 'createdAt', _app_iso(v_created),
    'paymentStatus', v_payment_status, 'paymentRequired', v_payment_status <> 'not_required',
    'fee', v_fee, 'paymentInstructions', v_instructions);
END;
$$;

-- =====================================================================
-- 9. "Check my registration" (GET /api/register/status)
--    A reference and an email must BOTH match. When either is wrong the
--    answer is exactly the same: {"found": false} — so nobody can use this
--    page to discover which references exist.
-- =====================================================================

CREATE OR REPLACE FUNCTION app_get_registration_status(p_reference text, p_email text) RETURNS jsonb
LANGUAGE plpgsql STABLE SET search_path = public, pg_temp AS $$
DECLARE
  v_ref text := upper(_app_trim(p_reference));
  v_email text := lower(_app_trim(p_email));
  r registrations%ROWTYPE;
  v_programme text;
  v_event text;
BEGIN
  IF v_ref = '' OR v_email = '' THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT * INTO r FROM registrations
   WHERE upper(reference) = v_ref AND lower(email) = v_email
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT coalesce(p.name, '') INTO v_programme FROM programmes p WHERE p.id = r.programme_id;
  SELECT coalesce(e.title, '') INTO v_event FROM events e WHERE e.id = r.event_id;

  RETURN jsonb_build_object(
    'found', true,
    'reference', r.reference,
    'fullName', r.full_name,
    'email', r.email,
    'phone', r.phone,
    'type', r.type,
    'school', r.school_name,
    'programmeName', coalesce(v_programme, ''),
    'eventTitle', coalesce(v_event, ''),
    'registeredFor', coalesce(nullif(v_programme, ''), nullif(v_event, ''), r.programme_slug, r.event_ref, ''),
    'status', r.status,
    'paymentStatus', r.payment_status,
    'paymentRequired', r.payment_status <> 'not_required',
    'fee', r.fee,
    'paymentInstructions', r.payment_instructions,
    'registrationNumber', r.registration_number,
    'rejectionReason', r.payment_reason,
    'createdAt', _app_iso(r.created_at),
    'confirmedAt', _app_iso(r.confirmed_at),
    'receipts', coalesce((SELECT jsonb_agg(jsonb_build_object(
            'id', rp.id, 'kind', rp.kind, 'at', _app_iso(rp.created_at),
            'fileName', rp.file_name, 'reason', rp.reason)
          ORDER BY rp.created_at DESC, rp.id DESC)
        FROM registration_payments rp WHERE rp.registration_id = r.id), '[]'::jsonb));
END;
$$;

-- =====================================================================
-- 10. Receipts: record an upload (POST /api/register/receipt)
--     The website uploads the file to the private bucket first, then calls
--     this. The reference + email must match, and the registration must be
--     waiting for a receipt (or have had one rejected).
-- =====================================================================

CREATE OR REPLACE FUNCTION app_add_receipt(p_reference text, p_email text, p_file_path text,
                                           p_file_name text, p_mime text, p_size bigint) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  r registrations%ROWTYPE;
  v_mime text := lower(_app_trim(p_mime));
  v_path text := _app_trim(p_file_path);
  v_id bigint;
BEGIN
  IF v_mime NOT IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf') THEN
    RAISE EXCEPTION 'Receipts must be a JPG, PNG, WebP image or a PDF.' USING ERRCODE = '22023';
  END IF;
  IF p_size IS NULL OR p_size <= 0 OR p_size > 10485760 THEN
    RAISE EXCEPTION 'Receipts must be smaller than 10 MB.' USING ERRCODE = '22023';
  END IF;
  IF v_path = '' THEN
    RAISE EXCEPTION 'The receipt file was not received.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO r FROM registrations
   WHERE upper(reference) = upper(_app_trim(p_reference))
     AND lower(email) = lower(_app_trim(p_email))
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'We could not find a registration with that reference and email address.' USING ERRCODE = '22023';
  END IF;

  IF r.payment_status = 'not_required' THEN
    RAISE EXCEPTION 'This registration does not require a payment receipt.' USING ERRCODE = '22023';
  ELSIF r.payment_status = 'under_review' THEN
    RAISE EXCEPTION 'Your receipt is already being reviewed. We will contact you.' USING ERRCODE = '22023';
  ELSIF r.payment_status = 'approved' THEN
    RAISE EXCEPTION 'This registration is already approved — no further receipt is needed.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO registration_payments (registration_id, kind, file_path, file_name, mime_type, size_bytes)
  VALUES (r.id, 'receipt', v_path, left(coalesce(_app_trim(p_file_name), 'receipt'), 255), v_mime, p_size)
  RETURNING id INTO v_id;

  UPDATE registrations
     SET payment_status = 'under_review', payment_reason = '', payment_reviewed_at = NULL
   WHERE id = r.id;

  RETURN jsonb_build_object(
    'ok', true, 'receiptId', v_id, 'paymentStatus', 'under_review',
    'id', r.id, 'reference', r.reference, 'fullName', r.full_name, 'email', r.email, 'phone', r.phone,
    'type', r.type, 'school', r.school_name,
    'programmeName', coalesce((SELECT p.name FROM programmes p WHERE p.id = r.programme_id), ''),
    'eventTitle', coalesce((SELECT e.title FROM events e WHERE e.id = r.event_id), ''),
    'fee', r.fee, 'paymentInstructions', r.payment_instructions);
END;
$$;

-- =====================================================================
-- 11. Admin decisions
--     Approve requires the person's registration number (unique across all
--     registrations). Reject requires a reason; the person can upload again.
-- =====================================================================

CREATE OR REPLACE FUNCTION app_review_payment(p_id text, p_decision text, p_registration_number text,
                                             p_reason text, p_reviewer text) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  r registrations%ROWTYPE;
  v_decision text := lower(_app_trim(p_decision));
  v_number text := upper(_app_trim(p_registration_number));
  v_reason text := _app_trim(p_reason);
  v_author text := coalesce(nullif(_app_trim(p_reviewer), ''), 'admin');
  v_new_status text;
BEGIN
  SELECT * INTO r FROM registrations WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'That registration no longer exists.' USING ERRCODE = '22023';
  END IF;

  IF v_decision = 'approve' THEN
    IF r.payment_status <> 'under_review' THEN
      RAISE EXCEPTION 'Only a registration whose receipt is under review can be approved.' USING ERRCODE = '22023';
    END IF;
    IF v_number = '' THEN
      RAISE EXCEPTION 'Enter the person''s registration number before approving.' USING ERRCODE = '22023';
    END IF;
    IF length(v_number) > 40 THEN
      RAISE EXCEPTION 'That registration number is too long (40 characters at most).' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM registrations x
                WHERE x.id <> r.id AND upper(x.registration_number) = v_number) THEN
      RAISE EXCEPTION 'Registration number % is already used by another registration.', v_number
        USING ERRCODE = '23505';
    END IF;

    UPDATE registrations
       SET payment_status = 'approved', registration_number = v_number, payment_reason = '',
           payment_reviewed_at = now(), confirmed_at = now(), status = 'confirmed'
     WHERE id = r.id;

    INSERT INTO registration_payments (registration_id, kind, reason, reviewer)
    VALUES (r.id, 'approved', v_reason, v_author);

    v_new_status := 'approved';
  ELSIF v_decision = 'reject' THEN
    IF r.payment_status <> 'under_review' THEN
      RAISE EXCEPTION 'Only a registration whose receipt is under review can be rejected.' USING ERRCODE = '22023';
    END IF;
    IF v_reason = '' THEN
      RAISE EXCEPTION 'Give a reason so the person knows what to fix.' USING ERRCODE = '22023';
    END IF;

    UPDATE registrations
       SET payment_status = 'rejected', payment_reason = left(v_reason, 2000), payment_reviewed_at = now()
     WHERE id = r.id;

    INSERT INTO registration_payments (registration_id, kind, reason, reviewer)
    VALUES (r.id, 'rejected', left(v_reason, 2000), v_author);

    v_new_status := 'rejected';
  ELSE
    RAISE EXCEPTION 'Unknown decision "%". Use approve or reject.', p_decision USING ERRCODE = '22023';
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'paymentStatus', v_new_status,
    'registrationNumber', CASE WHEN v_new_status = 'approved' THEN v_number ELSE r.registration_number END,
    'reason', CASE WHEN v_new_status = 'rejected' THEN left(v_reason, 2000) ELSE '' END,
    'id', r.id, 'reference', r.reference, 'fullName', r.full_name, 'email', r.email, 'phone', r.phone,
    'type', r.type, 'school', r.school_name, 'fee', r.fee,
    'programmeName', coalesce((SELECT p.name FROM programmes p WHERE p.id = r.programme_id), ''),
    'eventTitle', coalesce((SELECT e.title FROM events e WHERE e.id = r.event_id), ''));
END;
$$;

-- Free registration: the admin confirms it and issues the registration number.
CREATE OR REPLACE FUNCTION app_confirm_registration(p_id text, p_registration_number text, p_reviewer text)
RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  r registrations%ROWTYPE;
  v_number text := upper(_app_trim(p_registration_number));
  v_author text := coalesce(nullif(_app_trim(p_reviewer), ''), 'admin');
BEGIN
  SELECT * INTO r FROM registrations WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'That registration no longer exists.' USING ERRCODE = '22023';
  END IF;
  IF r.payment_status <> 'not_required' THEN
    RAISE EXCEPTION 'This registration requires payment — review the receipt instead.' USING ERRCODE = '22023';
  END IF;
  IF v_number = '' THEN
    RAISE EXCEPTION 'Enter the person''s registration number before confirming.' USING ERRCODE = '22023';
  END IF;
  IF length(v_number) > 40 THEN
    RAISE EXCEPTION 'That registration number is too long (40 characters at most).' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM registrations x
              WHERE x.id <> r.id AND upper(x.registration_number) = v_number) THEN
    RAISE EXCEPTION 'Registration number % is already used by another registration.', v_number
      USING ERRCODE = '23505';
  END IF;

  UPDATE registrations
     SET status = 'confirmed', registration_number = v_number,
         confirmed_at = coalesce(confirmed_at, now())
   WHERE id = r.id;

  INSERT INTO registration_payments (registration_id, kind, reason, reviewer)
  VALUES (r.id, 'confirmed', '', v_author);

  RETURN jsonb_build_object(
    'ok', true, 'paymentStatus', 'not_required', 'registrationNumber', v_number,
    'id', r.id, 'reference', r.reference, 'fullName', r.full_name, 'email', r.email, 'phone', r.phone,
    'type', r.type, 'school', r.school_name, 'fee', r.fee,
    'programmeName', coalesce((SELECT p.name FROM programmes p WHERE p.id = r.programme_id), ''),
    'eventTitle', coalesce((SELECT e.title FROM events e WHERE e.id = r.event_id), ''));
END;
$$;

-- One history entry (the admin opens the file through a short-lived signed URL).
CREATE OR REPLACE FUNCTION app_get_receipt(p_id bigint) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'id', rp.id, 'registrationId', rp.registration_id, 'kind', rp.kind,
    'filePath', rp.file_path, 'fileName', rp.file_name, 'mimeType', rp.mime_type, 'sizeBytes', rp.size_bytes,
    'reason', rp.reason, 'reviewer', rp.reviewer, 'at', _app_iso(rp.created_at),
    'reference', r.reference, 'fullName', r.full_name)
  FROM registration_payments rp
  JOIN registrations r ON r.id = rp.registration_id
  WHERE rp.id = p_id
$$;

-- =====================================================================
-- 12. Health check now counts the new table (25 tables)
-- =====================================================================

CREATE OR REPLACE FUNCTION app_health() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'ok', true,
    'tables', (SELECT count(*) FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
                  AND table_name IN ('announcement', 'hero_content', 'site_settings', 'site_offices',
                                     'site_social_links', 'site_external_links', 'stats', 'programmes', 'events',
                                     'news_categories', 'news_posts', 'gallery_categories', 'gallery_items', 'videos',
                                     'faqs', 'testimonials', 'partners', 'contact_messages', 'contact_message_notes',
                                     'registrations', 'registration_notes', 'registration_payments',
                                     'newsletter_subscribers', 'admin_account', 'media_files')),
    'now', _app_iso(now()))
$$;

-- =====================================================================
-- 13. The PRIVATE "receipts" bucket (Supabase Storage only; skipped
--     elsewhere). No policies are created: anon/authenticated cannot read,
--     write or list it. Only the website server (service_role) can upload,
--     and admins see files through short-lived signed URLs.
-- =====================================================================

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('receipts', 'receipts', false, 10485760,
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
    ON CONFLICT (id) DO UPDATE
      SET public = false,
          file_size_limit = 10485760,
          allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  END IF;
END
$$;

-- =====================================================================
-- 14. Lock the new table down: RLS on, no policies, service_role only
-- =====================================================================

ALTER TABLE registration_payments ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r text;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated') LOOP
    EXECUTE format('REVOKE ALL ON TABLE registration_payments FROM %I', r);
    EXECUTE format('REVOKE ALL ON SEQUENCE registration_payments_id_seq FROM %I', r);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT ALL ON TABLE registration_payments TO service_role';
    EXECUTE 'GRANT ALL ON SEQUENCE registration_payments_id_seq TO service_role';
  END IF;
END
$$;

-- Functions: nobody but service_role may execute them.
DO $$
DECLARE
  f record;
  r text;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND (p.proname LIKE 'app\_%' OR p.proname LIKE '\_app\_%')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f.sig);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', f.sig, r);
      END IF;
    END LOOP;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
    END IF;
  END LOOP;
END
$$;

COMMIT;

-- Tell the Data API (PostgREST) to pick up the new functions immediately.
NOTIFY pgrst, 'reload schema';
