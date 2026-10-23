-- =====================================================================
--  AFRISTEM Global website - DATA (MySQL / MariaDB)
--  Source : seed-data.json
--  Parts  : content, submissions, admin, media
--  Rows   : 104
--  Load into an EMPTY database created with 01-schema.sql.
--  Everything runs in one transaction: it either all loads or nothing does.
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

START TRANSACTION;

-- =====================================================================
-- WEBSITE CONTENT
-- =====================================================================

-- news_categories: 9 row(s)
INSERT INTO news_categories (name, description, sort_order)
VALUES ('AFRISTEM News', 'Updates about the organisation and its activities.', 0);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('STEM Education', 'Articles about STEM learning and education.', 1);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('Innovation', 'Stories about technology, inventions and innovation.', 2);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('Competitions', 'Registration windows, results and competition updates.', 3);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('STEM Careers', 'Information about STEM careers and opportunities.', 4);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('Student Stories', 'Highlighting student achievements and experiences.', 5);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('School Stories', 'Showcasing schools making an impact through STEM.', 6);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('Opportunities', 'Scholarships, competitions, training and other opportunities.', 7);
INSERT INTO news_categories (name, description, sort_order)
VALUES ('Resources', 'Guides, handbooks and teaching resources.', 8);

-- gallery_categories: 8 row(s)
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Programmes', 0);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Competitions', 1);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Training', 2);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Workshops', 3);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Students', 4);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Schools', 5);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('STEM Projects', 6);
INSERT INTO gallery_categories (name, sort_order)
VALUES ('Events', 7);

-- announcement: 1 row(s)
INSERT INTO announcement (id, enabled, tone, label, message, href, link_label, starts_at, ends_at)
VALUES (1, TRUE, 'info', '5th Edition', 'STEM Kids Championship registration is open — ₦2,000 early-bird per candidate for schools entering 10 or more', '/programmes/stem-kids-championship', 'Register your school', NULL, NULL);

-- hero_content: 1 row(s)
INSERT INTO hero_content (id, badge_label, badge_text, badge_href, headline, rotating_words, subheading, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, background_image, feature_image, feature_eyebrow, feature_caption, secondary_image, secondary_image_caption)
VALUES (1, 'New', 'STEM Kids Championship Int''l Edition · Nov 14, 2026', '/events', 'Inspiring Africa''s Next Generation of', '["Engineers","Technologists","Scientists","Innovators","Problem Solvers"]', 'AFRISTEM creates exciting opportunities for young people to learn, compete, build and innovate through STEM education, competitions, technology, training and strategic partnerships.', 'Explore Our Programmes', '/programmes', 'Partner With Us', '/partners', '/images/awards/group-winners.jpg', '/images/awards/trio-medals.jpg', '2025 Nigerian STEM Championship', 'Winners of the 2025 Nigerian STEM Championship', '/images/awards/certificate-lineup.jpg', '2025 Nigerian STEM Championship Awards');

-- site_settings: 1 row(s)
INSERT INTO site_settings (id, name, tagline, description, email, primary_phone, whatsapp, secondary_phone, address, registration_note, registration_opens, registration_closes, footer_note)
VALUES (1, 'AFRISTEM', 'Inspiring the Next Generation of African Innovators', 'AFRISTEM is an EdTech and STEM-focused organisation making Science, Technology, Engineering and Mathematics exciting, practical and accessible for children, teenagers, schools, educators and STEM professionals across Africa.', 'contact@afristemglobal.com', '+234 810 554 1242', '+234 810 554 1242', '+234 813 825 8491', 'PCN Plaza, Opposite Abakaliki Township Stadium, Kpirikpiri, Abakaliki, Ebonyi State, Nigeria.', 'Registration takes about 3 minutes. You''ll get an automatic confirmation by email, and our team will contact you with next steps.', NULL, '2026-11-14', 'AFRISTEM Global — advancing STEM education across Africa.');

-- site_offices: 3 row(s)
INSERT INTO site_offices (id, name, city, address, phone, map_query, sort_order)
VALUES ('abakaliki', 'South East Nigeria Office', 'Abakaliki', 'Abakaliki, Ebonyi State, Nigeria', '+234 813 825 8491', 'PCN Plaza, Abakaliki Township Stadium, Kpirikpiri, Abakaliki, Ebonyi State', 0);
INSERT INTO site_offices (id, name, city, address, phone, map_query, sort_order)
VALUES ('abuja', 'Abuja Liaison Office', 'Abuja', 'Vicbalkon Towers, Utako, Abuja, Nigeria', '+234 810 554 1242', 'Vicbalkon Towers, Utako District, Abuja', 1);
INSERT INTO site_offices (id, name, city, address, phone, map_query, sort_order)
VALUES ('lagos', 'Lagos Liaison Office', 'Lagos', 'Ikorodu, Lagos State, Nigeria', '+234 809 407 4447', 'Banana Estate, Igbe Lara, Ikorodu, Lagos', 2);

-- site_social_links: 5 row(s)
INSERT INTO site_social_links (id, label, href, icon, sort_order)
VALUES ('facebook', 'Facebook', 'https://facebook.com/afristemglobal', 'facebook', 0);
INSERT INTO site_social_links (id, label, href, icon, sort_order)
VALUES ('instagram', 'Instagram', 'https://instagram.com/afristemglobal', 'instagram', 1);
INSERT INTO site_social_links (id, label, href, icon, sort_order)
VALUES ('linkedin', 'LinkedIn', 'https://linkedin.com/company/afristemglobal', 'linkedin', 2);
INSERT INTO site_social_links (id, label, href, icon, sort_order)
VALUES ('x', 'X (Twitter)', 'https://twitter.com/afristemglobal', 'x', 3);
INSERT INTO site_social_links (id, label, href, icon, sort_order)
VALUES ('youtube', 'YouTube', 'https://www.youtube.com/@afristemglobal', 'youtube', 4);

-- site_external_links: 2 row(s)
INSERT INTO site_external_links (id, label, href, description, sort_order)
VALUES ('prime-stem', 'Prime STEM Nigeria', 'https://primestemnigeria.afristemglobal.org', 'Our flagship STEM education initiative — competitions, bootcamps and teacher training.', 0);
INSERT INTO site_external_links (id, label, href, description, sort_order)
VALUES ('digital-school', 'AFRISTEM Digital Science School', 'https://digitalschool.afristemglobal.org', 'Our online school — flexible learning, intensive mentorship, outstanding results. Opens in a new tab.', 1);

-- stats: 4 row(s)
INSERT INTO stats (id, value, label, icon, sort_order)
VALUES ('stat-1', '5,867+', 'Students Reached', 'sparkles', 0);
INSERT INTO stats (id, value, label, icon, sort_order)
VALUES ('stat-2', '840+', 'Schools Across Africa', 'sparkles', 1);
INSERT INTO stats (id, value, label, icon, sort_order)
VALUES ('stat-3', '10+', 'Organisation Partners', 'sparkles', 2);
INSERT INTO stats (id, value, label, icon, sort_order)
VALUES ('stat-4', '100M+', 'Future Learners Targeted', 'sparkles', 3);

-- programmes: 4 row(s)
INSERT INTO programmes (id, slug, name, subtitle, tagline, short_description, eligibility, format, age_range, image, image_alt, pillar, cta_label, highlights, prize_note, poster, register_href, featured, status, pillar_blurb, description, objectives, accent, icon, sort_order)
VALUES ('scispell', 'scispell', 'SciSPELL', 'Science Spelling Bee', 'Spell Science. Know Science. Master Science.', 'Making scientific vocabulary exciting and memorable.', 'Students who meet the eligibility requirements for each edition of the competition.', 'School rounds → Regional finals → Grand finale', 'Primary & Secondary', '/images/photos/award-winners-purple.jpg', 'SciSPELL winners holding their certificates', 'SCIENCE', 'Explore SciSPELL', '[{"label":"Focus","value":"Scientific vocabulary"},{"label":"Format","value":"Live spelling rounds"},{"label":"Level","value":"Primary & Secondary"}]', '', '', '/register?programme=scispell', TRUE, 'open', 'Making science terminology exciting and accessible.', '["SciSPELL — Science Spelling Bee is an innovative academic competition designed to make science learning more engaging, memorable and exciting.","The programme challenges students to demonstrate their knowledge of scientific terminology while developing vocabulary, confidence, concentration and a deeper appreciation of science.","SciSPELL transforms scientific terms that students often encounter in textbooks and classrooms into an exciting competitive learning experience."]', '["Promote interest in science among young learners.","Improve students'' understanding of scientific terminology.","Develop confidence and communication skills.","Encourage healthy academic competition.","Make science learning fun and engaging.","Help students develop stronger scientific vocabulary."]', 'sun', 'spell', 0);
INSERT INTO programmes (id, slug, name, subtitle, tagline, short_description, eligibility, format, age_range, image, image_alt, pillar, cta_label, highlights, prize_note, poster, register_href, featured, status, pillar_blurb, description, objectives, accent, icon, sort_order)
VALUES ('code-africa', 'code-africa', 'Code Africa', 'A Pan-African Coding Competition for Schools', 'Code. Create. Compete. Change Africa.', 'Connecting schools and young coders across Africa.', 'Schools and eligible students from participating African countries.', 'Online qualifiers → Live hackathon finals', 'Ages 10 – 18', '/images/photos/computer-lab.jpg', 'Students coding on computers in a lab', 'TECHNOLOGY', 'Explore Code Africa', '[{"label":"Focus","value":"Coding & computational thinking"},{"label":"Format","value":"Hybrid: online + live"},{"label":"Reach","value":"Pan-African"}]', '', '', '/register?programme=code-africa', TRUE, 'open', 'Equipping young Africans to become creators with technology.', '["Code Africa is a pan-African coding competition designed for schools across Africa.","The competition provides young learners with an opportunity to demonstrate their coding and computational thinking abilities while competing with students from different schools and countries.","Code Africa seeks to move young people beyond simply using technology to becoming creators and problem-solvers through technology."]', '["Promote coding and computational thinking.","Encourage technology education in African schools.","Identify and nurture young coding talents.","Develop problem-solving and logical reasoning skills.","Encourage innovation among young people.","Connect learners across African countries through technology."]', 'sky', 'code', 1);
INSERT INTO programmes (id, slug, name, subtitle, tagline, short_description, eligibility, format, age_range, image, image_alt, pillar, cta_label, highlights, prize_note, poster, register_href, featured, status, pillar_blurb, description, objectives, accent, icon, sort_order)
VALUES ('stem-kids-championship', 'stem-kids-championship', 'STEM Kids Championship', 'Pan-African STEM Competition', 'Where Young Minds Compete, Discover and Excel.', 'Inspiring young learners through STEM competition and excellence.', 'Basic 3 – 6 and JSS 1 – 3 learners in primary and secondary schools across Africa.', 'Written assessment → Practical rounds → Awards', 'Ages 6 – 14', '/images/posters/2024-skc-winners.jpg', 'STEM Kids Championship winners with their awards', 'STEM', 'Explore STEM Kids Championship', '[{"label":"Subjects","value":"Maths · Basic Science · Computer Tech"},{"label":"Categories","value":"Basic 3–6 and JSS 1–3"},{"label":"Exam date","value":"November 14, 2026"},{"label":"Early bird","value":"₦2,000 per candidate (10+ candidates)"}]', '', '', '/register?programme=stem-kids-championship', TRUE, 'open', 'Building early interest and excellence in STEM.', '["The STEM Kids Championship — Pan-African Edition is a STEM competition designed to provide young learners across Africa with a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment.","Candidates compete in Mathematics, Basic Science and Computer Technology across two categories: Basic 3 – 6 and JSS 1 – 3. The 5th Edition is the International Edition, with the exam holding on November 14, 2026 across selected cities in Africa.","Schools registering 10 candidates or more can take advantage of an early-bird fee of ₦2,000 per candidate. The championship encourages children to develop a strong foundation in STEM while experiencing the excitement of competition and connecting with other young STEM enthusiasts."]', '["Encourage early interest in STEM.","Promote academic excellence.","Develop critical thinking and problem-solving skills.","Create opportunities for young STEM enthusiasts across Africa.","Encourage healthy academic competition.","Identify and celebrate outstanding young learners."]', 'coral', 'trophy', 2);
INSERT INTO programmes (id, slug, name, subtitle, tagline, short_description, eligibility, format, age_range, image, image_alt, pillar, cta_label, highlights, prize_note, poster, register_href, featured, status, pillar_blurb, description, objectives, accent, icon, sort_order)
VALUES ('african-organic-chemistry-tournament', 'african-organic-chemistry-tournament', 'African Organic Chemistry Tournament', 'Interschool Organic Chemistry Olympiad', 'Think Chemistry. Master Organic Chemistry.', 'Challenging students to think deeply and excel in organic chemistry.', 'Senior secondary students of chemistry, entered through their schools.', 'Theory paper → Problem-solving rounds → Finals', 'Senior Secondary', '/images/photos/chemistry-lab.jpg', 'Students conducting an organic chemistry experiment', 'CHEMISTRY', 'Explore the Tournament', '[{"label":"Edition","value":"2nd Edition"},{"label":"Eligibility","value":"SSS 1 - 3"},{"label":"Exam mode","value":"CBT"},{"label":"Exam date","value":"Nov 14 - 21, 2026"},{"label":"Star prize","value":"₦500,000 cash + plaque"},{"label":"Entry","value":"Through your school"}]', 'Star Prize: ₦500,000 cash prize and plaque', '/images/posters/aoct-2026-2nd-edition.jpg', '/register?programme=african-organic-chemistry-tournament', TRUE, 'open', 'Challenging students to achieve excellence in advanced chemistry.', '["The African Organic Chemistry Tournament is an interschool organic chemistry olympiad designed to challenge students'' understanding of organic chemistry and encourage excellence in chemical sciences.","The tournament provides a competitive platform for students to apply their knowledge, demonstrate analytical thinking and engage with challenging organic chemistry problems.","It also seeks to inspire students who have an interest in chemistry and encourage them to consider careers in science, engineering, medicine, technology and related fields."]', '["Promote excellence in organic chemistry.","Encourage deeper understanding of chemical concepts.","Develop analytical and problem-solving abilities.","Identify and celebrate talented chemistry students.","Encourage interest in chemistry-related careers.","Connect schools and students through academic competition."]', 'mint', 'flask', 3);

-- events: 7 row(s)
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-2026-award-distribution-tour', '2026-award-distribution-tour', '2026 SKC / AOCT / ANSC Award Distribution Tour', '2026-10-19', '2026-10-30', 'Oct 19 – 30, 2026', 'All 36 States + FCT, Nigeria', 'Physical', 'Award distribution tour across all states in Nigeria and the FCT, celebrating winners of the STEM Kids Championship, African Organic Chemistry Tournament and Annual National Science Championship.', '', '/register?event=2026-award-distribution-tour', 'Awards', '/images/awards/group-winners.jpg', 0);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-international-science-teachers-hangout-2026', 'international-science-teachers-hangout-2026', 'International Science Teachers Hangout', '2026-10-31', NULL, 'Oct 31, 2026', 'Online (Zoom)', 'Virtual', 'A virtual hangout for science teachers across Africa and beyond to share ideas, resources and best practices for engaging STEM teaching.', 'Oct 28, 2026', '/register?type=educator&event=international-science-teachers-hangout-2026', 'Educators', '/images/awards/certificate-lineup.jpg', 1);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-skc-international-aoct-exam-2026', 'skc-international-aoct-exam-2026', 'STEM Kids Championship (Int''l Edition) & African Organic Chemistry Tournament Exam', '2026-11-14', NULL, 'Nov 14, 2026', 'Selected African cities', 'Physical', 'International STEM championship and organic chemistry tournament exam holding simultaneously across selected African cities.', 'Nov 6, 2026', '/register?programme=stem-kids-championship', 'Competition', '/images/bootcamp/students.jpg', 2);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-science-teachers-digital-literacy-hangout-2027', 'science-teachers-digital-literacy-hangout-2027', 'Science Teachers'' Digital Literacy Hangout', '2027-02-20', NULL, 'Feb 20, 2027', 'Online (Zoom)', 'Virtual', 'A virtual digital literacy hangout equipping science teachers with practical tools and skills for technology-enabled teaching.', 'Feb 17, 2027', '/register?type=educator&event=science-teachers-digital-literacy-hangout-2027', 'Educators', '/images/awards/duo-certificates.jpg', 3);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-annual-national-science-championship-2027', 'annual-national-science-championship-2027', 'Annual National Science Championship (ANSC)', '2027-03-20', NULL, 'Mar 20, 2027', 'All 36 States + FCT, Nigeria', 'Physical', 'Nigeria''s flagship national science championship, bringing together the strongest young science minds from every state and the Federal Capital Territory in a single nationwide contest.', '', '/register?event=annual-national-science-championship-2027', 'Competitions', '/images/awards/group-winners.jpg', 4);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-sci-spell-1-0-2027', 'sci-spell-1-0-2027', 'SCI-SPELL (Science Spelling Bee) 1.0', '2027-06-26', NULL, 'Jun 26, 2027', 'Selected states + FCT, Nigeria', 'Physical', 'The first edition of SCI-SPELL — a science spelling bee that tests how precisely young learners know the language of science, from element names to anatomical terms.', '', '/register?event=sci-spell-1-0-2027', 'Competitions', '/images/photos/spelling-bee.jpg', 5);
INSERT INTO events (id, slug, title, start_date, end_date, display_date, location, mode, description, deadline, register_href, tag, image, sort_order)
VALUES ('event-international-stemx-bootcamp-5-2027', 'international-stemx-bootcamp-5-2027', 'International STEMx Boot Camp 5.0', '2027-08-02', '2027-08-28', 'Aug 2 – 28, 2027', 'Selected cities across Africa', 'Hybrid', 'The fifth international STEMx boot camp: four weeks of hands-on projects, robotics, coding and engineering design for ages 8–19, delivered online and on site in selected African cities.', '', '/register?event=international-stemx-bootcamp-5-2027', 'Boot Camp', '/images/bootcamp/group-1.jpg', 6);

-- news_posts: 7 row(s)
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-stem-kids-championship-2026-registration-open', 'stem-kids-championship-2026-registration-open', 'STEM Kids Championship 5th Edition: Registration Now Open', 'Registration for the 5th Edition of the STEM Kids Championship has officially commenced. Schools registering 10 candidates or more can take advantage of an Early Bird fee of ₦2,000 per candidate.', 'Competitions', '2026-10-01', 'Oct 1, 2026', '4 min read', '/images/posters/skc-trophy-team.jpg', 'Prime STEM Nigeria', '["We are excited to announce the official commencement of registration for the 5th Edition of the STEM Kids Championship. This edition promises to be bigger, more competitive and more rewarding for participating schools, teachers and candidates.","The championship gives young learners across Africa a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment — while building a strong foundation in Science, Technology, Engineering and Mathematics.","EARLY BIRD REGISTRATION OFFER: Schools registering 10 candidates or more can take advantage of our special Early Bird registration fee of just ₦2,000 per candidate. This offer is available for only a few days, so schools are encouraged to register early and secure this special rate.","PAYMENT DETAILS — Account Name: Prime STEM Nigeria. Account Number: 1025357212. Bank: United Bank for Africa (UBA).","PREPARE TO COMPETE. PREPARE TO WIN. To help candidates prepare effectively, we have also released the STEM Kids Championship Master Preparatory Guide. The comprehensive guide contains general strategies for preparing for and winning academic competitions, recommended topics to study, four years of comprehensive past questions and answers (2022–2025), and useful guidance to help candidates understand the competition and prepare with confidence.","The STEM Kids Championship is more than a competition — it is an opportunity for young learners to challenge themselves, develop critical thinking skills, gain valuable experience and earn recognition among some of the brightest young STEM minds.","Inspiring Young Minds. Building Africa''s STEM Future."]', 0);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-2025-nigerian-stem-championship-awards', '2025-nigerian-stem-championship-awards', 'Celebrating Excellence: 2025 Nigerian STEM Championship Awards Ceremony', 'Outstanding young scientists, coders and chemists from across Nigeria were celebrated at the 2025 awards ceremony in partnership with Prime STEM Nigeria.', 'AFRISTEM News', '2025-12-06', 'Dec 6, 2025', '4 min read', '/images/awards/certificate-lineup.jpg', 'AFRISTEM Team', '["The 2025 Nigerian STEM Championship Awards Ceremony brought together students, parents, teachers, school leaders and partners to celebrate a year of remarkable achievement in Science, Technology, Engineering and Mathematics.","Winners of the STEM Kids Championship, the African Organic Chemistry Tournament and the Annual National Science Championship received certificates, trophies and prizes recognising their dedication and excellence.","\\"What we celebrate today is not just knowledge, but curiosity, resilience and the courage to compete,\\" the organisers noted during the ceremony. \\"These young people represent the future of African innovation.\\"","AFRISTEM extends its gratitude to every participating school, every teacher who prepared their students, and our partners whose support made the ceremony possible."]', 1);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-why-science-spelling-builds-confident-scientists', 'why-science-spelling-builds-confident-scientists', 'Why Science Spelling Builds Confident Scientists', 'Scientific vocabulary is the language of discovery. Here is how SciSPELL turns intimidating terminology into an exciting, memorable learning experience.', 'STEM Education', '2026-01-15', 'Jan 15, 2026', '5 min read', '/images/photos/award-winners-purple.jpg', 'AFRISTEM Team', '["Every scientific discipline has its own language. From ''photosynthesis'' to ''mitochondria'' to ''electronegativity'', the words students encounter in textbooks can feel like barriers — or they can become keys that unlock understanding.","SciSPELL was designed around a simple insight: when students master the vocabulary of science, they gain confidence to engage with the concepts behind the words.","Beyond spelling, participants learn etymology, definitions and context. They stand before an audience, listen carefully, think under pressure and communicate clearly — skills that serve them far beyond the competition stage.","Schools that have taken part report students returning to class more curious, more articulate, and more willing to ask questions. That is exactly the outcome SciSPELL was built to create."]', 2);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-from-consumers-to-creators-code-africa', 'from-consumers-to-creators-code-africa', 'From Consumers to Creators: The Vision Behind Code Africa', 'Young Africans are among the world''s most enthusiastic technology users. Code Africa exists to help them become its builders.', 'Innovation', '2026-03-02', 'Mar 2, 2026', '6 min read', '/images/photos/computer-lab.jpg', 'AFRISTEM Team', '["Africa has the youngest population on earth, and its young people are embracing technology at an extraordinary pace. But using technology and creating with it are two very different things.","Code Africa is a pan-African coding competition built to close that gap. It challenges students to think computationally, solve real problems and build working solutions — often for the first time.","Participating schools gain more than a competition entry. They gain a reason to start a coding club, train a teacher, and give students a platform to showcase what they can build.","As the competition grows across borders, it is also building something bigger: a network of young African coders who know each other, learn from each other and will one day build together."]', 3);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-how-schools-can-start-a-stem-club', 'how-schools-can-start-a-stem-club', 'How Your School Can Start a Thriving STEM Club', 'A practical, step-by-step guide for school leaders and teachers who want to bring hands-on STEM into their school — even on a tight budget.', 'School Stories', '2026-05-20', 'May 20, 2026', '7 min read', '/images/photos/robotics.jpg', 'AFRISTEM Team', '["You don''t need a state-of-the-art laboratory to start a STEM club. You need a committed teacher, a regular time slot, and a few well-chosen activities that make students want to come back.","Start small: one afternoon a week, a simple challenge (build the tallest paper tower, program a simple game, extract DNA from a strawberry), and a culture where trying and failing is celebrated.","Connect the club to something bigger. Registering for a competition like SciSPELL, Code Africa or the STEM Kids Championship gives students a goal to work toward and a reason to take the club seriously.","AFRISTEM works with schools to introduce or strengthen STEM programmes, activities and learning experiences. If you would like support, reach out through our Schools page."]', 4);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-stem-careers-africa-needs', 'stem-careers-africa-needs', '10 STEM Careers Africa Urgently Needs More Of', 'From renewable-energy engineers to data scientists and biomedical researchers — a look at the STEM careers that will shape Africa''s next decade.', 'STEM Careers', '2026-07-08', 'Jul 8, 2026', '5 min read', '/images/photos/students-campus.jpg', 'AFRISTEM Team', '["Africa''s challenges — in energy, health, agriculture, infrastructure and finance — are also its greatest opportunities. Every one of them needs STEM talent.","Renewable-energy engineers, software developers, data scientists, agricultural scientists, biomedical researchers, cybersecurity specialists, environmental scientists, robotics engineers, chemical engineers and mathematics educators are all in growing demand.","The good news: the foundations for every one of these careers are laid in primary and secondary school. Curiosity, problem-solving and a love of learning matter more than any single subject.","AFRISTEM programmes are designed to spark those foundations early, so that today''s competitors become tomorrow''s professionals."]', 5);
INSERT INTO news_posts (id, slug, title, excerpt, category, published_on, display_date, read_time, image, author, body, sort_order)
VALUES ('post-student-story-first-chemistry-tournament', 'student-story-first-chemistry-tournament', 'Student Story: ''The Tournament Made Me Fall in Love With Chemistry''', 'A senior secondary student shares how preparing for the African Organic Chemistry Tournament changed how she sees science — and her future.', 'Student Stories', '2026-08-25', 'Aug 25, 2026', '4 min read', '/images/photos/chemistry-lab.jpg', 'AFRISTEM Team', '["\\"Before the tournament, organic chemistry was just diagrams I had to memorise. Preparing for it changed everything — I started to see the logic, the patterns, the beauty in how molecules behave.\\"","Months of preparation with her chemistry teacher and classmates turned into hours of focused problem-solving on tournament day. She did not win first place. She says it did not matter.","\\"I discovered I could think through a hard problem without panicking. I discovered I actually enjoy it. Now I want to study chemical engineering.\\"","Stories like hers are why the African Organic Chemistry Tournament exists: not only to identify the best, but to inspire everyone who takes part."]', 6);

-- gallery_items: 25 row(s)
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-1', '/images/awards/group-winners.jpg', 'Award winners holding certificates on stage', '2025 STEM Championship award winners', 'Competitions', 'wide', 0);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-2', '/images/awards/trio-medals.jpg', 'Three students displaying medals and certificates', 'Medal presentation', 'Competitions', '', 1);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-3', '/images/awards/awardee-girl-1.jpg', 'Student holding a medal and certificate', 'Celebrating excellence', 'Students', 'tall', 2);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-4', '/images/awards/awardee-boy-1.jpg', 'Student proudly holding a certificate', 'Certificate presentation', 'Students', 'tall', 3);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-5', '/images/awards/blue-group.jpg', 'Group of champions on stage in blue uniforms', 'Champions on stage', 'Events', 'wide', 4);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-6', '/images/awards/duo-certificates.jpg', 'Two students with framed certificates', 'Top achievers', 'Competitions', '', 5);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-7', '/images/awards/officials-group.jpg', 'AFRISTEM officials and guests at the awards', 'Organisers and guests', 'Events', '', 6);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-8', '/images/awards/partners-group.jpg', 'Partners and sponsors at the awards ceremony', 'Partners & sponsors', 'Events', '', 7);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-9', '/images/awards/awardee-girl-2.jpg', 'Young champion with medal', 'Young champion', 'Students', 'tall', 8);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-10', '/images/awards/awardee-boy-3.jpg', 'Student receiving an award', 'Award recipient', 'Students', 'tall', 9);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-11', '/images/awards/awardee-boy-2.jpg', 'Proud winner displaying a certificate', 'Proud winner', 'Students', '', 10);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-12', '/images/awards/certificate-lineup.jpg', 'Students lined up with certificates', 'Certificate line-up', 'Schools', 'wide', 11);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-13', '/images/posters/prize-giving.jpg', 'Prize giving moment', 'Prize giving', 'Competitions', 'wide', 12);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-14', '/images/posters/skc-trophy-team.jpg', 'Team holding the championship trophy', 'Championship trophy', 'Competitions', '', 13);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-15', '/images/posters/2024-skc-winners.jpg', '2024 STEM Kids Championship award winners', '2024 SKC winners', 'Competitions', 'tall', 14);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-16', '/images/posters/2023-interstate-tour.jpg', '2023 STEM Kids inter-state tour and awards', '2023 inter-state tour', 'Events', 'wide', 15);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-17', '/images/bootcamp/group-1.jpg', 'Boot camp cohort assembled at the university', 'International STEM Boot Camp', 'Training', 'wide', 16);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-18', '/images/bootcamp/students.jpg', 'Boot camp students standing together', 'Boot camp participants', 'Students', 'tall', 17);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-19', '/images/bootcamp/group-2.jpg', 'Students at the boot camp opening session', 'Opening session', 'Workshops', '', 18);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-20', '/images/bootcamp/group-3.jpg', 'Large group of boot camp participants', 'Hands-on technology week', 'Workshops', '', 19);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-21', '/images/photos/chemistry-lab.jpg', 'Students carrying out a chemistry practical', 'Chemistry practicals', 'STEM Projects', '', 20);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-22', '/images/photos/computer-lab.jpg', 'Students learning to code in a computer lab', 'Coding session', 'STEM Projects', '', 21);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-23', '/images/photos/robotics.jpg', 'Students building a robot', 'Robotics build', 'STEM Projects', '', 22);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-24', '/images/photos/school-assembly.jpg', 'School assembly briefing', 'School briefing', 'Schools', '', 23);
INSERT INTO gallery_items (id, src, alt, caption, category, span, sort_order)
VALUES ('photo-25', '/images/photos/field-learning.jpg', 'Students learning outside the classroom', 'Field learning', 'Programmes', '', 24);

-- videos: 8 row(s)
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('bootcamp-2023', '2023 International STEM Boot Camp', 'Students from across Nigeria and international facilitators at the IMO State University boot camp — coding, robotics and project defence.', 'VDHLgiAvm1E', '/images/videos/bootcamp-2023.jpg', 'Bootcamp', TRUE, 0);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('skc-2023', '2023 STEM Kids Championship', 'Highlights from the championship that brings thousands of pupils together to compete in science, maths and technology.', 'ItKzkb2MEeU', '/images/videos/skc-2023.jpg', 'Competition', TRUE, 1);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('drone-kids', 'Kids flying drones at the Boot Camp', 'Hands-on technology sessions where learners pilot drones and get a first taste of engineering.', 'QIetBYsW7aU', '/images/videos/drone-kids.jpg', 'Bootcamp', TRUE, 2);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('director-bootcamp', 'Director of Prime STEM Nigeria on the Boot Camp', 'Why we bring international facilitators into Nigerian classrooms every August.', 'yOoTqvOiEYs', '/images/videos/director-bootcamp.jpg', 'Inside AFRISTEM', FALSE, 3);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('skc-promo', 'STEM Kids Championship is back', 'Bigger and better — how schools and parents can get learners registered.', '9BulkVNr44M', '/images/videos/skc-promo.jpg', 'Competition', FALSE, 4);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('brain-league-winner', 'STEM Kids Brain League winner', 'A champion receives the prize — the moment every learner works towards.', 'WiflgV-hF70', '/images/videos/brain-league-winner.jpg', 'Competition', FALSE, 5);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('project-defence', 'Boot Camp project defence', 'Teams present the projects they built during the international boot camp.', '7XRXbK3xgyc', '/images/videos/project-defence.jpg', 'Bootcamp', FALSE, 6);
INSERT INTO videos (id, title, description, youtube_id, thumb, category, featured, sort_order)
VALUES ('skc-registration', 'STEM Kids Championship registration', 'Registration guidance for schools entering learners into the championship.', 'ErkcnBtHFyA', '/images/videos/skc-registration.jpg', 'Competition', FALSE, 7);

-- faqs: 11 row(s)
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-1', 'Who can participate in AFRISTEM programmes?', 'AFRISTEM programmes vary by age and category. Each programme page clearly states its eligibility requirements — from primary school learners in the STEM Kids Championship to senior secondary students in the African Organic Chemistry Tournament.', 'General', 0);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-2', 'How do I register for an AFRISTEM programme?', 'Visit the Registration page and complete the relevant form. Some programmes may have specific registration requirements or windows, which are stated on each programme page.', 'General', 1);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-3', 'Can schools register their students?', 'Yes. Where applicable, schools can register students for AFRISTEM programmes and competitions. Bulk school registration is available on the Registration page.', 'General', 2);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-4', 'Are AFRISTEM programmes available online?', 'Some programmes may be offered online, physically or in hybrid formats depending on the programme. Our teacher hangouts, for example, are fully virtual.', 'General', 3);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-5', 'Can my school partner with AFRISTEM?', 'Yes. AFRISTEM welcomes partnerships with schools and educational institutions for competitions, STEM clubs, training, boot camps, equipment and consultancy.', 'General', 4);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-6', 'Can educators participate?', 'Yes. Educators can participate in teacher training, workshops, professional development, and can serve as facilitators, judges, mentors and programme coordinators.', 'General', 5);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-7', 'Can STEM professionals volunteer?', 'Yes. STEM professionals can participate as mentors, facilitators, trainers, speakers, judges, consultants, project advisers or industry partners.', 'General', 6);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-8', 'Does AFRISTEM sell STEM equipment?', 'Yes. AFRISTEM provides STEM equipment, educational kits and learning resources, and can support institutions in setting up practical STEM learning environments.', 'General', 7);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-9', 'Does AFRISTEM provide certificates?', 'Certificates are provided for programmes where certification is applicable. Details are stated on the individual programme page.', 'General', 8);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-10', 'Can organisations partner with AFRISTEM?', 'Yes. We welcome partnerships with organisations that share our commitment to STEM education, innovation, technology and youth development.', 'General', 9);
INSERT INTO faqs (id, question, answer, category, sort_order)
VALUES ('faq-11', 'How can I contact AFRISTEM?', 'You can reach us through the Contact page using the enquiry form, by phone or WhatsApp, or via the official contact channels listed on this website.', 'General', 10);

-- testimonials: 4 row(s)
INSERT INTO testimonials (id, quote, name, role, org, image, initials, featured, sort_order)
VALUES ('testimonial-1', 'Our students came back from the STEM Kids Championship more confident and more curious than we have ever seen them. AFRISTEM made science feel like an adventure.', 'Head Teacher', 'Partner School, Ebonyi State', '', '', 'HT', TRUE, 0);
INSERT INTO testimonials (id, quote, name, role, org, image, initials, featured, sort_order)
VALUES ('testimonial-2', 'The teacher hangout gave me practical tools I used in class the very next day. It is rare to find professional development that is this relevant.', 'Science Teacher', 'Secondary School, Abuja', '', '', 'ST', TRUE, 1);
INSERT INTO testimonials (id, quote, name, role, org, image, initials, featured, sort_order)
VALUES ('testimonial-3', 'Preparing for the African Organic Chemistry Tournament made me fall in love with chemistry. Now I want to study chemical engineering.', 'Tournament Participant', 'SS3 Student', '', '', 'TP', TRUE, 2);
INSERT INTO testimonials (id, quote, name, role, org, image, initials, featured, sort_order)
VALUES ('testimonial-4', 'AFRISTEM''s team understood exactly what our school needed to launch a coding club — and helped us make it happen on a modest budget.', 'School Proprietor', 'Private School, Lagos', '', '', 'SP', FALSE, 3);

-- partners: 4 row(s)
INSERT INTO partners (id, slug, name, logo, type, description, href, cta_label, external, country, sort_order)
VALUES ('partner-1', 'prime-stem-nigeria', 'Prime STEM Nigeria', '/images/partners/prime-stem-nigeria.png', 'Ecosystem Partner', '["Prime STEM Nigeria is a key partner within the AFRISTEM STEM education ecosystem.","Prime STEM Nigeria is focused on advancing STEM education and creating opportunities for young people through national STEM programmes, competitions and educational initiatives.","Through this relationship, AFRISTEM is connected to programmes that provide additional opportunities for students and schools."]', '/prime-stem-nigeria', 'Explore Prime STEM Nigeria', FALSE, 'Nigeria', 0);
INSERT INTO partners (id, slug, name, logo, type, description, href, cta_label, external, country, sort_order)
VALUES ('partner-2', 'njfp', 'Nigeria Jubilee Fellows Programme', '/images/partners/njfp.png', 'Strategic Partner', '["The Nigeria Jubilee Fellows Programme (NJFP) is one of AFRISTEM''s strategic partners.","The partnership reflects AFRISTEM''s commitment to creating meaningful opportunities that connect education, skills development, technology and youth empowerment."]', 'https://njfp.ng', 'Learn More', TRUE, 'Nigeria', 1);
INSERT INTO partners (id, slug, name, logo, type, description, href, cta_label, external, country, sort_order)
VALUES ('partner-3', 'linguafront', 'Linguafront', '/images/partners/linguafront.png', 'Education Partner', '["Linguafront is an AFRISTEM partner supporting opportunities at the intersection of education, language and global engagement.","The partnership strengthens AFRISTEM''s ability to connect learners and educational stakeholders with broader opportunities for learning and development."]', '/contact?subject=Linguafront', 'Learn More', FALSE, '', 2);
INSERT INTO partners (id, slug, name, logo, type, description, href, cta_label, external, country, sort_order)
VALUES ('partner-4', 'sylcoutech', 'SYLCOUTECH Ltd', '/images/partners/sylcoutech.png', 'International Partner', '["SYLCOUTECH Ltd, Zimbabwe is an international partner contributing to AFRISTEM''s vision of expanding STEM opportunities beyond national boundaries.","The partnership strengthens AFRISTEM''s Pan-African outlook and supports collaboration across African countries in education, technology and youth development."]', '/contact?subject=SYLCOUTECH', 'Learn More', FALSE, 'Zimbabwe', 3);

-- =====================================================================
-- FORM SUBMISSIONS
-- =====================================================================

-- contact_messages: 0 row(s)

-- contact_message_notes: 0 row(s)

-- registrations: 0 row(s)

-- registration_notes: 0 row(s)

-- newsletter_subscribers: 0 row(s)

-- =====================================================================
-- ADMIN ACCOUNT
-- =====================================================================

-- admin_account: 0 row(s)  (left empty on purpose: the first login creates it)

-- =====================================================================
-- UPLOADED IMAGES
-- =====================================================================

-- media_files: 0 row(s)  (no --uploads-dir given)

COMMIT;

-- Row counts loaded:
--   news_categories          9
--   gallery_categories       8
--   announcement             1
--   hero_content             1
--   site_settings            1
--   site_offices             3
--   site_social_links        5
--   site_external_links      2
--   stats                    4
--   programmes               4
--   events                   7
--   news_posts               7
--   gallery_items            25
--   videos                   8
--   faqs                     11
--   testimonials             4
--   partners                 4
--   contact_messages         0
--   contact_message_notes    0
--   registrations            0
--   registration_notes       0
--   newsletter_subscribers   0
--   admin_account            0
--   media_files              0
