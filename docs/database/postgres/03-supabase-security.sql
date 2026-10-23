-- =====================================================================
--  AFRISTEM Global website - SUPABASE SECURITY (optional, PostgreSQL)
--  Run AFTER 01-schema.sql and 02-seed.sql - ONLY if you use Supabase
--  (or any Postgres that is exposed through an automatic public REST API).
--
--  What it does: switches on Row Level Security with NO policies and removes
--  table privileges from Supabase's public "anon" and "authenticated" roles,
--  so the public API key can neither read nor change anything (form
--  submissions contain personal data, including children's).
--
--  The website itself talks to the database from its server through the
--  functions in 04-supabase-api.sql, using the project's SECRET key
--  (service_role). service_role bypasses RLS, so the website keeps working.
--  Never put the secret/service_role key in browser code.
-- =====================================================================

BEGIN;

ALTER TABLE announcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_message_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON TABLE announcement, hero_content, site_settings, site_offices, site_social_links, site_external_links, stats, programmes, events, news_categories, news_posts, gallery_categories, gallery_items, videos, faqs, testimonials, partners, contact_messages, contact_message_notes, registrations, registration_notes, newsletter_subscribers, admin_account, media_files FROM %I', r);
      EXECUTE format('REVOKE ALL ON SEQUENCE contact_message_notes_id_seq, registration_notes_id_seq FROM %I', r);
    END IF;
  END LOOP;
END
$$;

-- The trigger function only calls now(); pin its search_path (Supabase's
-- security advisor flags functions with a mutable search_path).
ALTER FUNCTION set_updated_at() SET search_path = '';
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON FUNCTION set_updated_at() FROM %I', r);
    END IF;
  END LOOP;
END
$$;

COMMIT;
