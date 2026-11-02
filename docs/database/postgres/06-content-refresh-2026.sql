-- ---------------------------------------------------------------------
-- 06 — Content refresh, November 2026
--
-- Applied after 01–05. This is a CONTENT migration only: it changes rows,
-- not the schema, and it never deletes anything. It:
--   • puts the 50% STEM Kids Championship cut-off mark on the site
--   • sets the registration fee to ₦4,000 per candidate
--   • makes the homepage feature the current 5th Edition instead of 2025
--   • updates the SKC programme copy, highlights and flyer
--   • publishes the cut-off announcement story
--   • refreshes the existing registration story
--
-- Run once in the Supabase SQL editor (or as a migration). Re-running is safe.
-- ---------------------------------------------------------------------

BEGIN;

-- Announcement strip -----------------------------------------------------
UPDATE announcement
SET enabled = TRUE,
    tone = 'info',
    label = '5th Edition',
    message = 'STEM Kids Championship 5th Edition — cut-off mark 50% · registration closes Nov 6, 2026',
    href = '/programmes/stem-kids-championship',
    link_label = 'See the details',
    starts_at = NULL,
    ends_at = NULL
WHERE id = 1;

-- Homepage hero ----------------------------------------------------------
UPDATE hero_content
SET feature_image = '/images/photos/championship-winners-2.jpg',
    feature_eyebrow = 'STEM Kids Championship · 5th Edition',
    feature_caption = 'Young champions at the STEM Kids Championship',
    secondary_image = '/images/photos/trophies.jpg',
    secondary_image_caption = 'Trophies and medals at the STEM Kids Championship'
WHERE id = 1;

-- STEM Kids Championship programme --------------------------------------
UPDATE programmes
SET eligibility = 'Basic 3 – 6 and JSS 1 – 3 learners in primary and secondary schools across Africa. The cut-off mark is 50% — every candidate must score at least 50% to qualify.',
    image = '/images/photos/championship-winners-2.jpg',
    image_alt = 'Young champions at the STEM Kids Championship',
    description = '["The STEM Kids Championship — Pan-African Edition is a STEM competition designed to provide young learners across Africa with a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment.","Candidates compete in Mathematics, Basic Science and Computer Technology across two categories: Basic 3 – 6 and JSS 1 – 3. The 5th Edition is the International Edition, with the exam holding on Saturday, November 14, 2026 across selected cities in Africa.","The official cut-off mark for the competition is 50%. Every candidate must score at least 50% to qualify. Registration is ₦4,000 per candidate, and all registered candidates receive access to the online weekend tutorials and a certificate of participation."]'::jsonb,
    highlights = '[{"label":"Cut-off mark","value":"50%"},{"label":"Subjects","value":"Maths · Basic Science · Computer Tech"},{"label":"Categories","value":"Basic 3–6 and JSS 1–3"},{"label":"Exam date","value":"November 14, 2026"},{"label":"Registration","value":"₦4,000 per candidate"}]'::jsonb,
    poster = '/images/posters/skc-2026-5th-edition-cutoff.png'
WHERE slug = 'stem-kids-championship';

-- The joint SKC / AOCT exam event ---------------------------------------
UPDATE events
SET description = 'International STEM championship and organic chemistry tournament exam holding simultaneously across selected African cities. The STEM Kids Championship cut-off mark is 50% — every candidate must score at least 50% to qualify. Registration closes November 6, 2026.'
WHERE slug = 'skc-international-aoct-exam-2026';

-- Existing registration story -------------------------------------------
UPDATE news_posts
SET excerpt = 'Registration for the 5th Edition of the STEM Kids Championship has officially commenced. Registration is ₦4,000 per candidate.',
    body = '["We are excited to announce the official commencement of registration for the 5th Edition of the STEM Kids Championship. This edition promises to be bigger, more competitive and more rewarding for participating schools, teachers and candidates.","The championship gives young learners across Africa a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment — while building a strong foundation in Science, Technology, Engineering and Mathematics.","The official cut-off mark for the 5th Edition is 50%. Every candidate must score at least 50% to qualify; the benchmark applies to both the Basic 3 – 6 and JSS 1 – 3 categories.","REGISTRATION FEE: ₦4,000 per candidate. Registration closes on November 6, 2026, so schools are encouraged to register early.","PAYMENT DETAILS — Account Name: Prime STEM Nigeria. Account Number: 1025357212. Bank: United Bank for Africa (UBA).","PREPARE TO COMPETE. PREPARE TO WIN. To help candidates prepare effectively, we have also released the STEM Kids Championship Master Preparatory Guide. The comprehensive guide contains general strategies for preparing for and winning academic competitions, recommended topics to study, four years of comprehensive past questions and answers (2022–2025), and useful guidance to help candidates understand the competition and prepare with confidence.","The STEM Kids Championship is more than a competition — it is an opportunity for young learners to challenge themselves, develop critical thinking skills, gain valuable experience and earn recognition among some of the brightest young STEM minds.","Inspiring Young Minds. Building Africa''s STEM Future."]'::jsonb
WHERE slug = 'stem-kids-championship-2026-registration-open';

-- New cut-off announcement story ----------------------------------------
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES (
  'post-stem-kids-championship-50-percent-cut-off-mark',
  'stem-kids-championship-50-percent-cut-off-mark',
  'STEM Kids Championship 5th Edition: Cut-off Mark Set at 50%',
  'The official qualification benchmark for the 5th Edition is 50%. Candidates in Basic 3 – 6 and JSS 1 – 3 must score at least 50% to qualify — and registration closes on November 6, 2026.',
  'Competitions',
  '2026-11-02',
  'Nov 2, 2026',
  '3 min read',
  '/images/photos/championship-winners-2.jpg',
  'Prime STEM Nigeria',
  '["The official cut-off mark for the 5th Edition of the STEM Kids Championship is 50%. Every candidate — in both the Basic 3 – 6 and JSS 1 – 3 categories — must score at least 50% to qualify.","The International Edition holds on Saturday, November 14, 2026 across selected centres in Africa. Candidates sit Mathematics, Basic Science and Computer Technology, and the championship remains open to primary and secondary schools across the continent.","Registration closes on Friday, November 6, 2026. The registration fee is ₦4,000 per candidate.","Every registered candidate receives free admission to the STEM Kids online weekend tutorials and coaching classes, plus a certificate of participation. Cash prizes, trophies, plaques and medals are awarded to the top three candidates overall, and cash prizes and medals go to the best three candidates in every state.","HOW TO REGISTER — Pay to Prime STEM Nigeria | Account Number: 1025357212 | Bank: United Bank for Africa (UBA). Send your evidence of payment and location to primestemnigeria@gmail.com or 0810 554 1242 to generate your registration code, then use the code to complete your registration at afristemglobal.org/register.","The redesigned flyer, with the 50% cut-off mark, the full prize table and registration details, is available to download from the STEM Kids Championship programme page.","Prepare to compete. Prepare to win."]'::jsonb,
  0
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    category = EXCLUDED.category,
    published_on = EXCLUDED.published_on,
    display_date = EXCLUDED.display_date,
    read_time = EXCLUDED.read_time,
    image = EXCLUDED.image,
    author = EXCLUDED.author,
    body = EXCLUDED.body;

COMMIT;
