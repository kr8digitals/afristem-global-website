-- =====================================================================
--  AFRISTEM Global website - SUPABASE DATA API (PostgreSQL)
--  Run AFTER 01-schema.sql, 02-seed.sql and 03-supabase-security.sql.
--
--  The website server talks to the database ONLY through the functions in
--  this file, called over Supabase's Data API (supabase-js `.rpc()`) with the
--  project's SECRET key (service_role). Every call is one transaction.
--
--  The functions speak the website's own JSON shapes (camelCase, exactly the
--  `Store` types in src/lib/types.ts), so the mapping between the app and the
--  24 tables lives in one place: here.
--
--  Security: nobody but service_role may execute these functions (see the
--  grants at the bottom). The public anon/publishable key can call nothing.
--  Safe to re-run: every object is CREATE OR REPLACE.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. Small helpers (internal)
-- =====================================================================

-- ISO-8601 UTC timestamp with milliseconds, e.g. 2026-10-23T11:41:19.123Z
CREATE OR REPLACE FUNCTION _app_iso(t timestamptz) RETURNS text
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
  SELECT CASE WHEN t IS NULL THEN NULL
              ELSE to_char(t AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') END
$$;

-- Date as 'YYYY-MM-DD', or '' when NULL (the app uses '' for "not set").
CREATE OR REPLACE FUNCTION _app_date(d date) RETURNS text
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
  SELECT coalesce(to_char(d, 'YYYY-MM-DD'), '')
$$;

-- Lenient date parser for visitor input: anything that is not a real
-- YYYY-MM-DD date becomes NULL instead of failing the whole submission.
CREATE OR REPLACE FUNCTION _app_safe_date(t text) RETURNS date
LANGUAGE plpgsql STABLE SET search_path = pg_catalog AS $$
BEGIN
  IF t IS NULL OR t !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN NULL;
  END IF;
  RETURN t::date;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- Trim all leading/trailing whitespace (JavaScript's String.prototype.trim).
CREATE OR REPLACE FUNCTION _app_trim(t text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT regexp_replace(coalesce(t, ''), '^\s+|\s+$', '', 'g')
$$;

-- Any JSON value -> JSON array of strings ('[]' when it is not an array).
CREATE OR REPLACE FUNCTION _app_text_array(v jsonb) RETURNS jsonb
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE WHEN jsonb_typeof(v) = 'array' THEN
    coalesce((SELECT jsonb_agg(to_jsonb(x) ORDER BY o)
                FROM jsonb_array_elements_text(v) WITH ORDINALITY AS t(x, o)), '[]'::jsonb)
  ELSE '[]'::jsonb END
$$;

-- Programme key facts: the admin edits them as one "Label: Value" per line,
-- the table stores [{"label":..,"value":..}]. Same parsing as the website.
CREATE OR REPLACE FUNCTION _app_parse_highlights(t text) RETURNS jsonb
LANGUAGE sql IMMUTABLE SET search_path = public, pg_catalog AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
           'label', _app_trim(CASE WHEN pos > 0 THEN left(line, pos - 1) ELSE line END),
           'value', _app_trim(CASE WHEN pos > 0 THEN substr(line, pos + 1) ELSE '' END))
           ORDER BY o), '[]'::jsonb)
  FROM (SELECT _app_trim(l) AS line, strpos(_app_trim(l), ':') AS pos, o
          FROM regexp_split_to_table(coalesce(t, ''), E'\n') WITH ORDINALITY AS s(l, o)) x
  WHERE line <> ''
$$;

CREATE OR REPLACE FUNCTION _app_format_highlights(h jsonb) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT coalesce(string_agg(coalesce(x->>'label', '') || ': ' || coalesce(x->>'value', ''), E'\n' ORDER BY o), '')
  FROM jsonb_array_elements(CASE WHEN jsonb_typeof(h) = 'array' THEN h ELSE '[]'::jsonb END)
       WITH ORDINALITY AS t(x, o)
$$;

CREATE OR REPLACE FUNCTION _app_require_list(p jsonb, what text) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog AS $$
BEGIN
  IF jsonb_typeof(p) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION '% must be a list', what USING ERRCODE = '22023';
  END IF;
END;
$$;

-- =====================================================================
-- 2. Reading: everything the public pages need, in one round trip
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
        'description', p.description, 'objectives', p.objectives, 'accent', p.accent, 'icon', p.icon)
        ORDER BY p.sort_order, p.created_at, p.id) FROM programmes p), '[]'::jsonb),

  'events', coalesce((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'id', e.id, 'slug', e.slug, 'title', e.title, 'start', _app_date(e.start_date),
        'end', to_char(e.end_date, 'YYYY-MM-DD'), 'displayDate', e.display_date, 'location', e.location,
        'mode', e.mode, 'description', e.description, 'deadline', nullif(e.deadline, ''),
        'registerHref', e.register_href, 'tag', e.tag, 'image', e.image))
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
-- 3. Saving admin content (Admin dashboard > Save)
--    Lists: delete the ids that are gone, upsert the rest, sort_order =
--    position. Never "delete everything and re-insert" (that would unlink
--    registrations from programmes/events and reset created_at).
-- =====================================================================

CREATE OR REPLACE FUNCTION _app_save_offices(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Offices');
  DELETE FROM site_offices t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO site_offices (id, name, city, address, phone, map_query, sort_order)
  SELECT e->>'id', coalesce(e->>'name', ''), coalesce(e->>'city', ''), coalesce(e->>'address', ''),
         coalesce(e->>'phone', ''), coalesce(e->>'mapQuery', ''), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, address = EXCLUDED.address,
    phone = EXCLUDED.phone, map_query = EXCLUDED.map_query, sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_socials(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Social links');
  DELETE FROM site_social_links t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO site_social_links (id, label, href, icon, sort_order)
  SELECT e->>'id', coalesce(e->>'label', ''), coalesce(e->>'href', ''), coalesce(nullif(e->>'icon', ''), 'link'), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, href = EXCLUDED.href, icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_external_links(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'External sites');
  DELETE FROM site_external_links t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO site_external_links (id, label, href, description, sort_order)
  SELECT e->>'id', coalesce(e->>'label', ''), coalesce(e->>'href', ''), coalesce(e->>'description', ''), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, href = EXCLUDED.href, description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_stats(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Statistics');
  DELETE FROM stats t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO stats (id, value, label, icon, sort_order)
  SELECT e->>'id', coalesce(e->>'value', ''), coalesce(e->>'label', ''), coalesce(nullif(e->>'icon', ''), 'sparkles'), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;
END;
$$;

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
                          featured, status, pillar_blurb, description, objectives, accent, icon, sort_order)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'name', ''), coalesce(e->>'subtitle', ''),
         coalesce(e->>'tagline', ''), coalesce(e->>'shortDescription', ''), coalesce(e->>'eligibility', ''),
         coalesce(e->>'format', ''), coalesce(e->>'ageRange', ''), coalesce(e->>'image', ''),
         coalesce(e->>'imageAlt', ''), coalesce(nullif(e->>'pillar', ''), 'STEM'),
         coalesce(nullif(e->>'ctaLabel', ''), 'Register interest'), _app_parse_highlights(e->>'highlights'),
         coalesce(e->>'prizeNote', ''), coalesce(e->>'poster', ''),
         coalesce(nullif(e->>'registerHref', ''), '/register?programme=' || coalesce(e->>'slug', '')),
         coalesce((e->>'featured')::boolean, true), coalesce(nullif(e->>'status', ''), 'open'),
         coalesce(e->>'pillarBlurb', ''), _app_text_array(e->'description'), _app_text_array(e->'objectives'),
         coalesce(nullif(e->>'accent', ''), 'sun'), coalesce(nullif(e->>'icon', ''), 'trophy'), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, subtitle = EXCLUDED.subtitle,
    tagline = EXCLUDED.tagline, short_description = EXCLUDED.short_description, eligibility = EXCLUDED.eligibility,
    format = EXCLUDED.format, age_range = EXCLUDED.age_range, image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
    pillar = EXCLUDED.pillar, cta_label = EXCLUDED.cta_label, highlights = EXCLUDED.highlights,
    prize_note = EXCLUDED.prize_note, poster = EXCLUDED.poster, register_href = EXCLUDED.register_href,
    featured = EXCLUDED.featured, status = EXCLUDED.status, pillar_blurb = EXCLUDED.pillar_blurb,
    description = EXCLUDED.description, objectives = EXCLUDED.objectives, accent = EXCLUDED.accent,
    icon = EXCLUDED.icon, sort_order = EXCLUDED.sort_order;
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
                      deadline, register_href, tag, image, sort_order)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'title', ''), nullif(e->>'start', '')::date,
         nullif(e->>'end', '')::date, coalesce(e->>'displayDate', ''), coalesce(e->>'location', ''),
         coalesce(nullif(e->>'mode', ''), 'Physical'), coalesce(e->>'description', ''), coalesce(e->>'deadline', ''),
         coalesce(nullif(e->>'registerHref', ''), '/register?event=' || coalesce(e->>'slug', '')),
         coalesce(e->>'tag', ''), coalesce(e->>'image', ''), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date, display_date = EXCLUDED.display_date, location = EXCLUDED.location,
    mode = EXCLUDED.mode, description = EXCLUDED.description, deadline = EXCLUDED.deadline,
    register_href = EXCLUDED.register_href, tag = EXCLUDED.tag, image = EXCLUDED.image,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_news(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'News');
  -- an unknown category is added to the lookup list instead of failing the save
  INSERT INTO news_categories (name, description, sort_order)
  SELECT DISTINCT coalesce(nullif(e->>'category', ''), 'AFRISTEM News'), '', 1000
  FROM jsonb_array_elements(p) e
  ON CONFLICT (name) DO NOTHING;
  DELETE FROM news_posts t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  UPDATE news_posts t SET slug = '~' || t.id
  FROM jsonb_array_elements(p) e WHERE t.id = e->>'id' AND t.slug IS DISTINCT FROM e->>'slug';
  INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image,
                          author, body, sort_order)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'title', ''), coalesce(e->>'excerpt', ''),
         coalesce(nullif(e->>'category', ''), 'AFRISTEM News'), nullif(e->>'date', '')::date,
         coalesce(e->>'displayDate', ''), coalesce(nullif(e->>'readTime', ''), '3 min read'),
         coalesce(e->>'image', ''), coalesce(nullif(e->>'author', ''), 'AFRISTEM Team'),
         _app_text_array(e->'body'), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, excerpt = EXCLUDED.excerpt,
    category = EXCLUDED.category, published_on = EXCLUDED.published_on, display_date = EXCLUDED.display_date,
    read_time = EXCLUDED.read_time, image = EXCLUDED.image, author = EXCLUDED.author, body = EXCLUDED.body,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_gallery(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Gallery');
  INSERT INTO gallery_categories (name, sort_order)
  SELECT DISTINCT coalesce(nullif(e->>'category', ''), 'Events'), 1000
  FROM jsonb_array_elements(p) e
  ON CONFLICT (name) DO NOTHING;
  DELETE FROM gallery_items t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
  SELECT e->>'id', coalesce(e->>'src', ''), coalesce(e->>'alt', ''), coalesce(e->>'caption', ''),
         coalesce(nullif(e->>'category', ''), 'Events'), coalesce(e->>'span', ''), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET src = EXCLUDED.src, alt = EXCLUDED.alt, caption = EXCLUDED.caption,
    category = EXCLUDED.category, span = EXCLUDED.span, sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_videos(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Videos');
  DELETE FROM videos t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
  SELECT e->>'id', coalesce(e->>'title', ''), coalesce(e->>'description', ''), coalesce(e->>'youtubeId', ''),
         coalesce(e->>'thumb', ''), coalesce(nullif(e->>'category', ''), 'Highlights'),
         coalesce((e->>'featured')::boolean, false), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
    youtube_id = EXCLUDED.youtube_id, thumb = EXCLUDED.thumb, category = EXCLUDED.category,
    featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_faqs(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'FAQs');
  DELETE FROM faqs t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO faqs (id, question, answer, category, sort_order)
  SELECT e->>'id', coalesce(e->>'question', ''), coalesce(e->>'answer', ''),
         coalesce(nullif(e->>'category', ''), 'General'), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question, answer = EXCLUDED.answer,
    category = EXCLUDED.category, sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_testimonials(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Testimonials');
  DELETE FROM testimonials t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  INSERT INTO testimonials (id, quote, name, role, org, image, initials, featured, sort_order)
  SELECT e->>'id', coalesce(e->>'quote', ''), coalesce(e->>'name', ''), coalesce(e->>'role', ''),
         coalesce(e->>'org', ''), coalesce(e->>'image', ''), coalesce(e->>'initials', ''),
         coalesce((e->>'featured')::boolean, false), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET quote = EXCLUDED.quote, name = EXCLUDED.name, role = EXCLUDED.role,
    org = EXCLUDED.org, image = EXCLUDED.image, initials = EXCLUDED.initials, featured = EXCLUDED.featured,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION _app_save_partners(p jsonb) RETURNS void
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM _app_require_list(p, 'Partners');
  DELETE FROM partners t WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p) e WHERE e->>'id' = t.id);
  UPDATE partners t SET slug = '~' || t.id
  FROM jsonb_array_elements(p) e WHERE t.id = e->>'id' AND t.slug IS DISTINCT FROM e->>'slug';
  INSERT INTO partners (id, slug, name, logo, type, description, href, cta_label, external, country, sort_order)
  SELECT e->>'id', coalesce(e->>'slug', ''), coalesce(e->>'name', ''), coalesce(e->>'logo', ''),
         coalesce(nullif(e->>'type', ''), 'Partner'), _app_text_array(e->'description'), coalesce(e->>'href', ''),
         coalesce(nullif(e->>'ctaLabel', ''), 'Learn more'), coalesce((e->>'external')::boolean, false),
         coalesce(e->>'country', ''), (o - 1)::int
  FROM jsonb_array_elements(p) WITH ORDINALITY AS x(e, o)
  ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, logo = EXCLUDED.logo,
    type = EXCLUDED.type, description = EXCLUDED.description, href = EXCLUDED.href,
    cta_label = EXCLUDED.cta_label, external = EXCLUDED.external, country = EXCLUDED.country,
    sort_order = EXCLUDED.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION app_save_section(p_section text, p_value jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  CASE p_section
    WHEN 'announcement' THEN
      INSERT INTO announcement (id, enabled, tone, label, message, href, link_label, starts_at, ends_at)
      VALUES (1, coalesce((p_value->>'enabled')::boolean, false), coalesce(nullif(p_value->>'tone', ''), 'info'),
              coalesce(p_value->>'label', ''), coalesce(p_value->>'message', ''), coalesce(p_value->>'href', ''),
              coalesce(p_value->>'linkLabel', ''), nullif(p_value->>'startsAt', '')::date,
              nullif(p_value->>'endsAt', '')::date)
      ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled, tone = EXCLUDED.tone, label = EXCLUDED.label,
        message = EXCLUDED.message, href = EXCLUDED.href, link_label = EXCLUDED.link_label,
        starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at;

    WHEN 'hero' THEN
      INSERT INTO hero_content (id, badge_label, badge_text, badge_href, headline, rotating_words, subheading,
                                primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href,
                                background_image, feature_image, feature_eyebrow, feature_caption,
                                secondary_image, secondary_image_caption)
      VALUES (1, coalesce(p_value->>'badgeLabel', ''), coalesce(p_value->>'badgeText', ''),
              coalesce(p_value->>'badgeHref', ''), coalesce(p_value->>'headline', ''),
              _app_text_array(p_value->'rotatingWords'), coalesce(p_value->>'subheading', ''),
              coalesce(p_value->>'primaryCtaLabel', ''), coalesce(p_value->>'primaryCtaHref', ''),
              coalesce(p_value->>'secondaryCtaLabel', ''), coalesce(p_value->>'secondaryCtaHref', ''),
              coalesce(p_value->>'backgroundImage', ''), coalesce(p_value->>'featureImage', ''),
              coalesce(p_value->>'featureEyebrow', ''), coalesce(p_value->>'featureCaption', ''),
              coalesce(p_value->>'secondaryImage', ''), coalesce(p_value->>'secondaryImageCaption', ''))
      ON CONFLICT (id) DO UPDATE SET badge_label = EXCLUDED.badge_label, badge_text = EXCLUDED.badge_text,
        badge_href = EXCLUDED.badge_href, headline = EXCLUDED.headline, rotating_words = EXCLUDED.rotating_words,
        subheading = EXCLUDED.subheading, primary_cta_label = EXCLUDED.primary_cta_label,
        primary_cta_href = EXCLUDED.primary_cta_href, secondary_cta_label = EXCLUDED.secondary_cta_label,
        secondary_cta_href = EXCLUDED.secondary_cta_href, background_image = EXCLUDED.background_image,
        feature_image = EXCLUDED.feature_image, feature_eyebrow = EXCLUDED.feature_eyebrow,
        feature_caption = EXCLUDED.feature_caption, secondary_image = EXCLUDED.secondary_image,
        secondary_image_caption = EXCLUDED.secondary_image_caption;

    WHEN 'site' THEN
      INSERT INTO site_settings (id, name, tagline, description, email, primary_phone, whatsapp, secondary_phone,
                                 address, registration_note, registration_opens, registration_closes, footer_note)
      VALUES (1, coalesce(p_value->>'name', ''), coalesce(p_value->>'tagline', ''),
              coalesce(p_value->>'description', ''), coalesce(p_value->>'email', ''),
              coalesce(p_value->>'primaryPhone', ''), coalesce(p_value->>'whatsapp', ''),
              coalesce(p_value->>'secondaryPhone', ''), coalesce(p_value->>'address', ''),
              coalesce(p_value->>'registrationNote', ''), nullif(p_value->>'registrationOpens', '')::date,
              nullif(p_value->>'registrationCloses', '')::date, coalesce(p_value->>'footerNote', ''))
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline,
        description = EXCLUDED.description, email = EXCLUDED.email, primary_phone = EXCLUDED.primary_phone,
        whatsapp = EXCLUDED.whatsapp, secondary_phone = EXCLUDED.secondary_phone, address = EXCLUDED.address,
        registration_note = EXCLUDED.registration_note, registration_opens = EXCLUDED.registration_opens,
        registration_closes = EXCLUDED.registration_closes, footer_note = EXCLUDED.footer_note;
      PERFORM _app_save_offices(coalesce(p_value->'offices', '[]'::jsonb));
      PERFORM _app_save_socials(coalesce(p_value->'socials', '[]'::jsonb));
      PERFORM _app_save_external_links(coalesce(p_value->'externalLinks', '[]'::jsonb));

    WHEN 'stats' THEN PERFORM _app_save_stats(p_value);
    WHEN 'programmes' THEN PERFORM _app_save_programmes(p_value);
    WHEN 'events' THEN PERFORM _app_save_events(p_value);
    WHEN 'news' THEN PERFORM _app_save_news(p_value);
    WHEN 'gallery' THEN PERFORM _app_save_gallery(p_value);
    WHEN 'videos' THEN PERFORM _app_save_videos(p_value);
    WHEN 'faqs' THEN PERFORM _app_save_faqs(p_value);
    WHEN 'testimonials' THEN PERFORM _app_save_testimonials(p_value);
    WHEN 'partners' THEN PERFORM _app_save_partners(p_value);
    ELSE
      RAISE EXCEPTION 'Section "%" is not editable', p_section USING ERRCODE = '22023';
  END CASE;
  RETURN jsonb_build_object('ok', true, 'updatedAt', _app_iso(now()));
END;
$$;

-- =====================================================================
-- 4. Form submissions
-- =====================================================================

CREATE OR REPLACE FUNCTION _app_note_json(p_kind text, p_subject text, p_status text, p_body text,
                                          p_author text, p_at timestamptz) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'at', _app_iso(p_at),
    'by', p_author,
    'kind', p_kind,
    'subject', p_subject,
    'emailStatus', p_status,
    'body', p_body,
    'text', CASE WHEN p_kind = 'reply' THEN
              CASE p_status WHEN 'sent' THEN 'Reply sent'
                            WHEN 'logged_only' THEN 'Reply NOT sent (email delivery is not configured)'
                            WHEN 'failed' THEN 'Reply FAILED to send'
                            ELSE 'Reply' END
              || ': ' || p_subject || E'\n\n' || p_body
            ELSE p_body END)
$$;

CREATE OR REPLACE FUNCTION _app_contact_json(c contact_messages) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'id', c.id, 'createdAt', _app_iso(c.created_at), 'updatedAt', _app_iso(c.updated_at),
    'name', c.name, 'email', c.email, 'phone', c.phone, 'organisation', c.organisation,
    'category', c.category, 'subject', c.subject, 'message', c.message, 'status', c.status,
    'notes', coalesce((SELECT jsonb_agg(_app_note_json(n.kind, n.reply_subject, n.email_status, n.body, n.author, n.created_at)
                                ORDER BY n.created_at, n.id)
                         FROM contact_message_notes n WHERE n.contact_message_id = c.id), '[]'::jsonb))
$$;

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
    'thread', coalesce((SELECT jsonb_agg(_app_note_json(n.kind, n.reply_subject, n.email_status, n.body, n.author, n.created_at)
                                 ORDER BY n.created_at, n.id)
                          FROM registration_notes n WHERE n.registration_id = r.id), '[]'::jsonb))
$$;

CREATE OR REPLACE FUNCTION _app_newsletter_json(s newsletter_subscribers) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'id', s.id, 'createdAt', _app_iso(s.created_at), 'email', s.email, 'status', s.status,
    'source', s.source, 'unsubscribedAt', _app_iso(s.unsubscribed_at))
$$;

-- Admin inbox: every submission, newest first.
CREATE OR REPLACE FUNCTION app_get_submissions() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object(
    'contact', coalesce((SELECT jsonb_agg(_app_contact_json(c) ORDER BY c.created_at DESC, c.id DESC)
                           FROM contact_messages c), '[]'::jsonb),
    'register', coalesce((SELECT jsonb_agg(_app_registration_json(r) ORDER BY r.created_at DESC, r.id DESC)
                            FROM registrations r), '[]'::jsonb),
    'newsletter', coalesce((SELECT jsonb_agg(_app_newsletter_json(s) ORDER BY s.created_at DESC, s.id DESC)
                              FROM newsletter_subscribers s), '[]'::jsonb))
$$;

-- One submission (NULL when it does not exist).
CREATE OR REPLACE FUNCTION app_get_submission(p_type text, p_id text) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT CASE p_type
    WHEN 'contact' THEN (SELECT _app_contact_json(c) FROM contact_messages c WHERE c.id = p_id)
    WHEN 'register' THEN (SELECT _app_registration_json(r) FROM registrations r WHERE r.id = p_id)
    WHEN 'newsletter' THEN (SELECT _app_newsletter_json(s) FROM newsletter_subscribers s WHERE s.id = p_id)
  END
$$;

-- POST /api/contact
CREATE OR REPLACE FUNCTION app_add_contact(p jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_created timestamptz;
BEGIN
  INSERT INTO contact_messages (id, name, email, phone, organisation, category, subject, message)
  VALUES (p->>'id', coalesce(p->>'name', ''), coalesce(p->>'email', ''), coalesce(p->>'phone', ''),
          coalesce(p->>'organisation', ''), coalesce(nullif(p->>'category', ''), 'General Enquiry'),
          coalesce(p->>'subject', ''), coalesce(p->>'message', ''))
  RETURNING created_at INTO v_created;
  RETURN jsonb_build_object('ok', true, 'id', p->>'id', 'createdAt', _app_iso(v_created));
END;
$$;

-- POST /api/register. Generates the AFR-<year>-<XXXXX> reference (retrying on
-- the rare clash) and links the programme/event when the slug matches one.
CREATE OR REPLACE FUNCTION app_add_registration(p jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_ref text;
  v_try int := 0;
  v_created timestamptz;
  v_programme_id text;
  v_event_id text;
BEGIN
  SELECT id INTO v_programme_id FROM programmes WHERE slug = nullif(p->>'programme', '');
  SELECT id INTO v_event_id FROM events WHERE slug = nullif(p->>'event', '');
  LOOP
    v_try := v_try + 1;
    v_ref := 'AFR-' || to_char(now() AT TIME ZONE 'UTC', 'YYYY') || '-'
             || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
    BEGIN
      INSERT INTO registrations (
        id, reference, type, programme_slug, programme_id, event_ref, event_id, category, preferred_format,
        full_name, first_name, last_name, date_of_birth, gender, email, phone, school_name, grade,
        school_location, state, city, role, organisation, participants, applicant_notes,
        guardian_name, guardian_phone, guardian_email, guardian_relationship, consent_given, consent_at)
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
        CASE WHEN coalesce((p->>'consent')::boolean, false) THEN now() END)
      RETURNING created_at INTO v_created;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- retry only when the generated reference clashed; anything else is a real error
      IF v_try >= 8 OR NOT EXISTS (SELECT 1 FROM registrations WHERE reference = v_ref) THEN
        RAISE;
      END IF;
    END;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'id', p->>'id', 'reference', v_ref, 'createdAt', _app_iso(v_created));
END;
$$;

-- POST /api/newsletter. One row per email: signing up again re-subscribes.
CREATE OR REPLACE FUNCTION app_subscribe(p_id text, p_email text, p_source text) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_email text := lower(_app_trim(p_email));
  v_prev text;
BEGIN
  SELECT status INTO v_prev FROM newsletter_subscribers WHERE email = v_email FOR UPDATE;
  IF v_prev IS NULL THEN
    INSERT INTO newsletter_subscribers (id, email, source)
    VALUES (p_id, v_email, coalesce(nullif(p_source, ''), 'newsletter'))
    ON CONFLICT (email) DO UPDATE SET status = 'subscribed', unsubscribed_at = NULL;
    RETURN jsonb_build_object('ok', true, 'duplicate', false, 'resubscribed', false);
  ELSIF v_prev = 'subscribed' THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'resubscribed', false);
  END IF;
  UPDATE newsletter_subscribers SET status = 'subscribed', unsubscribed_at = NULL WHERE email = v_email;
  RETURN jsonb_build_object('ok', true, 'duplicate', false, 'resubscribed', true);
END;
$$;

-- PATCH /api/admin/submissions: change status and/or add an internal note.
CREATE OR REPLACE FUNCTION app_update_submission(p_type text, p_id text, p_status text, p_note text, p_author text)
RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_found boolean := false;
  v_note text := _app_trim(p_note);
  v_status text := nullif(_app_trim(p_status), '');
  v_author text := coalesce(nullif(_app_trim(p_author), ''), 'admin');
BEGIN
  IF p_type = 'newsletter' THEN
    v_found := EXISTS (SELECT 1 FROM newsletter_subscribers WHERE id = p_id);
    IF v_found AND v_status IN ('subscribed', 'unsubscribed') THEN
      UPDATE newsletter_subscribers
         SET status = v_status,
             unsubscribed_at = CASE WHEN v_status = 'unsubscribed' THEN coalesce(unsubscribed_at, now()) END
       WHERE id = p_id;
    END IF;
  ELSIF p_type = 'contact' THEN
    v_found := EXISTS (SELECT 1 FROM contact_messages WHERE id = p_id);
    IF v_found AND v_status IS NOT NULL THEN
      UPDATE contact_messages SET status = v_status WHERE id = p_id;
    END IF;
    IF v_found AND v_note <> '' THEN
      INSERT INTO contact_message_notes (contact_message_id, kind, body, author) VALUES (p_id, 'note', v_note, v_author);
    END IF;
  ELSIF p_type = 'register' THEN
    v_found := EXISTS (SELECT 1 FROM registrations WHERE id = p_id);
    IF v_found AND v_status IS NOT NULL THEN
      UPDATE registrations SET status = v_status WHERE id = p_id;
    END IF;
    IF v_found AND v_note <> '' THEN
      INSERT INTO registration_notes (registration_id, kind, body, author) VALUES (p_id, 'note', v_note, v_author);
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown submission type "%"', p_type USING ERRCODE = '22023';
  END IF;
  RETURN jsonb_build_object('ok', true, 'found', v_found);
END;
$$;

-- POST /api/admin/reply: record an email reply with its real delivery result.
-- The status only moves on (new -> replied/contacted) when the email was sent.
CREATE OR REPLACE FUNCTION app_add_reply(p_type text, p_id text, p_subject text, p_body text, p_email_status text,
                                         p_author text) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_found boolean := false;
  v_author text := coalesce(nullif(_app_trim(p_author), ''), 'admin');
BEGIN
  IF p_type = 'contact' THEN
    v_found := EXISTS (SELECT 1 FROM contact_messages WHERE id = p_id);
    IF v_found THEN
      INSERT INTO contact_message_notes (contact_message_id, kind, reply_subject, email_status, body, author)
      VALUES (p_id, 'reply', coalesce(p_subject, ''), p_email_status, coalesce(p_body, ''), v_author);
      IF p_email_status = 'sent' THEN
        UPDATE contact_messages SET status = 'replied' WHERE id = p_id AND status = 'new';
      END IF;
    END IF;
  ELSIF p_type = 'register' THEN
    v_found := EXISTS (SELECT 1 FROM registrations WHERE id = p_id);
    IF v_found THEN
      INSERT INTO registration_notes (registration_id, kind, reply_subject, email_status, body, author)
      VALUES (p_id, 'reply', coalesce(p_subject, ''), p_email_status, coalesce(p_body, ''), v_author);
      IF p_email_status = 'sent' THEN
        UPDATE registrations SET status = 'contacted' WHERE id = p_id AND status = 'new';
      END IF;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unknown submission type "%"', p_type USING ERRCODE = '22023';
  END IF;
  RETURN jsonb_build_object('ok', true, 'found', v_found);
END;
$$;

-- DELETE /api/admin/submissions (notes are removed by ON DELETE CASCADE).
CREATE OR REPLACE FUNCTION app_delete_submission(p_type text, p_id text) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_count int := 0;
BEGIN
  IF p_type = 'contact' THEN
    DELETE FROM contact_messages WHERE id = p_id;
  ELSIF p_type = 'register' THEN
    DELETE FROM registrations WHERE id = p_id;
  ELSIF p_type = 'newsletter' THEN
    DELETE FROM newsletter_subscribers WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Unknown submission type "%"', p_type USING ERRCODE = '22023';
  END IF;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'deleted', v_count > 0);
END;
$$;

-- =====================================================================
-- 5. Admin password (single account) and uploaded media
-- =====================================================================

CREATE OR REPLACE FUNCTION app_get_admin() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT jsonb_build_object('passwordHash', a.password_hash, 'salt', a.password_salt,
                            'updatedAt', _app_iso(a.updated_at))
  FROM admin_account a WHERE a.id = 1
$$;

-- p_only_if_absent = true: first successful login pins the hash (never
-- overwrites an existing one). false: change the password.
CREATE OR REPLACE FUNCTION app_set_admin(p_hash text, p_salt text, p_only_if_absent boolean) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_inserted boolean;
BEGIN
  IF p_only_if_absent THEN
    INSERT INTO admin_account (id, password_hash, password_salt) VALUES (1, p_hash, p_salt)
    ON CONFLICT (id) DO NOTHING;
    v_inserted := FOUND;
  ELSE
    INSERT INTO admin_account (id, password_hash, password_salt) VALUES (1, p_hash, p_salt)
    ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, password_salt = EXCLUDED.password_salt,
      hash_algorithm = 'pbkdf2-sha256', hash_iterations = 120000;
    v_inserted := true;
  END IF;
  RETURN jsonb_build_object('ok', true, 'written', v_inserted);
END;
$$;

CREATE OR REPLACE FUNCTION app_add_media(p jsonb) RETURNS jsonb
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO media_files (id, file_name, url, storage, mime_type, size_bytes, width, height, original_name)
  VALUES (p->>'id', p->>'fileName', p->>'url', coalesce(nullif(p->>'storage', ''), 'supabase'),
          coalesce(nullif(p->>'mimeType', ''), 'image/jpeg'), coalesce((p->>'sizeBytes')::int, 0),
          (p->>'width')::int, (p->>'height')::int, left(coalesce(p->>'originalName', ''), 255));
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION app_list_media() RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public, pg_temp AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object('url', m.url, 'name', m.file_name, 'createdAt', _app_iso(m.created_at),
                                               'sizeBytes', m.size_bytes)
                            ORDER BY m.created_at DESC, m.id DESC), '[]'::jsonb)
  FROM media_files m
$$;

-- =====================================================================
-- 6. Health check (GET /api/health)
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
                                     'registrations', 'registration_notes', 'newsletter_subscribers', 'admin_account',
                                     'media_files')),
    'now', _app_iso(now()))
$$;

-- =====================================================================
-- 7. Image storage bucket (Supabase Storage only; skipped elsewhere)
--    Public read: uploaded images are website images. Only the server
--    (service_role) can upload.
-- =====================================================================

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('media', 'media', true, 15728640,
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
    ON CONFLICT (id) DO UPDATE SET public = true;
  END IF;
END
$$;

-- =====================================================================
-- 8. Who may call what: service_role only
-- =====================================================================

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
