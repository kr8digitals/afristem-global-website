#!/usr/bin/env node
/**
 * store-json-to-sql.mjs  -  AFRISTEM website JSON  ->  SQL INSERT statements
 *
 * Converts the website's JSON data into SQL that matches 01-schema.sql.
 * Works for:
 *   - data/seed-data.json   (the default website content - this is how 02-seed.sql was made)
 *   - a live backup         (Admin > Settings > "Download everything (JSON)", or the
 *                            server file data/store.json) - includes real form submissions
 *
 * Usage:
 *   node store-json-to-sql.mjs <file.json> --dialect=postgres  > import.sql
 *   node store-json-to-sql.mjs <file.json> --dialect=mysql     > import.sql
 *
 * Options:
 *   --part=content,submissions,admin,media   which groups to export (default: all)
 *   --uploads-dir=<folder>                   also register the uploaded images found in this
 *                                            folder (the server's data/uploads) in media_files
 *   --media-base-url=/api/media              URL prefix for uploaded images (default /api/media)
 *
 * Load the result into an EMPTY database created with 01-schema.sql
 * (use it INSTEAD of 02-seed.sql when you are importing a live backup).
 * Problems are printed to stderr. If a value is too long for its column the
 * script stops without output so nothing is silently cut off.
 *
 * Zero dependencies. Requires Node.js 18 or newer.
 */
import fs from "node:fs";
import path from "node:path";

/* Reference data copied from the website code (values that live only in the code). */
const REF = {
  "programmeDetails": {
    "scispell": {
      "name": "SciSPELL",
      "subtitle": "Science Spelling Bee",
      "tagline": "Spell Science. Know Science. Master Science.",
      "pillar": "SCIENCE",
      "pillarBlurb": "Making science terminology exciting and accessible.",
      "shortDescription": "Making scientific vocabulary exciting and memorable.",
      "description": [
        "SciSPELL — Science Spelling Bee is an innovative academic competition designed to make science learning more engaging, memorable and exciting.",
        "The programme challenges students to demonstrate their knowledge of scientific terminology while developing vocabulary, confidence, concentration and a deeper appreciation of science.",
        "SciSPELL transforms scientific terms that students often encounter in textbooks and classrooms into an exciting competitive learning experience."
      ],
      "objectives": [
        "Promote interest in science among young learners.",
        "Improve students' understanding of scientific terminology.",
        "Develop confidence and communication skills.",
        "Encourage healthy academic competition.",
        "Make science learning fun and engaging.",
        "Help students develop stronger scientific vocabulary."
      ],
      "eligibility": "Students who meet the eligibility requirements for each edition of the competition.",
      "format": "School rounds → Regional finals → Grand finale",
      "ageRange": "Primary & Secondary",
      "image": "/images/photos/award-winners-purple.jpg",
      "imageAlt": "SciSPELL winners holding their certificates",
      "accent": "sun",
      "icon": "spell",
      "ctaLabel": "Explore SciSPELL",
      "highlights": [
        {
          "label": "Focus",
          "value": "Scientific vocabulary"
        },
        {
          "label": "Format",
          "value": "Live spelling rounds"
        },
        {
          "label": "Level",
          "value": "Primary & Secondary"
        }
      ]
    },
    "code-africa": {
      "name": "Code Africa",
      "subtitle": "A Pan-African Coding Competition for Schools",
      "tagline": "Code. Create. Compete. Change Africa.",
      "pillar": "TECHNOLOGY",
      "pillarBlurb": "Equipping young Africans to become creators with technology.",
      "shortDescription": "Connecting schools and young coders across Africa.",
      "description": [
        "Code Africa is a pan-African coding competition designed for schools across Africa.",
        "The competition provides young learners with an opportunity to demonstrate their coding and computational thinking abilities while competing with students from different schools and countries.",
        "Code Africa seeks to move young people beyond simply using technology to becoming creators and problem-solvers through technology."
      ],
      "objectives": [
        "Promote coding and computational thinking.",
        "Encourage technology education in African schools.",
        "Identify and nurture young coding talents.",
        "Develop problem-solving and logical reasoning skills.",
        "Encourage innovation among young people.",
        "Connect learners across African countries through technology."
      ],
      "eligibility": "Schools and eligible students from participating African countries.",
      "format": "Online qualifiers → Live hackathon finals",
      "ageRange": "Ages 10 – 18",
      "image": "/images/photos/computer-lab.jpg",
      "imageAlt": "Students coding on computers in a lab",
      "accent": "sky",
      "icon": "code",
      "ctaLabel": "Explore Code Africa",
      "highlights": [
        {
          "label": "Focus",
          "value": "Coding & computational thinking"
        },
        {
          "label": "Format",
          "value": "Hybrid: online + live"
        },
        {
          "label": "Reach",
          "value": "Pan-African"
        }
      ]
    },
    "stem-kids-championship": {
      "name": "STEM Kids Championship",
      "subtitle": "Pan-African STEM Competition",
      "tagline": "Where Young Minds Compete, Discover and Excel.",
      "pillar": "STEM",
      "pillarBlurb": "Building early interest and excellence in STEM.",
      "shortDescription": "Inspiring young learners through STEM competition and excellence.",
      "description": [
        "The STEM Kids Championship — Pan-African Edition is a STEM competition designed to provide young learners across Africa with a platform to demonstrate their knowledge, develop confidence and compete in a stimulating academic environment.",
        "Candidates compete in Mathematics, Basic Science and Computer Technology across two categories: Basic 3 – 6 and JSS 1 – 3. The 5th Edition is the International Edition, with the exam holding on November 14, 2026 across selected cities in Africa.",
        "Schools registering 10 candidates or more can take advantage of an early-bird fee of ₦2,000 per candidate. The championship encourages children to develop a strong foundation in STEM while experiencing the excitement of competition and connecting with other young STEM enthusiasts."
      ],
      "objectives": [
        "Encourage early interest in STEM.",
        "Promote academic excellence.",
        "Develop critical thinking and problem-solving skills.",
        "Create opportunities for young STEM enthusiasts across Africa.",
        "Encourage healthy academic competition.",
        "Identify and celebrate outstanding young learners."
      ],
      "eligibility": "Basic 3 – 6 and JSS 1 – 3 learners in primary and secondary schools across Africa.",
      "format": "Written assessment → Practical rounds → Awards",
      "ageRange": "Ages 6 – 14",
      "image": "/images/posters/2024-skc-winners.jpg",
      "imageAlt": "STEM Kids Championship winners with their awards",
      "accent": "coral",
      "icon": "trophy",
      "ctaLabel": "Explore STEM Kids Championship",
      "highlights": [
        {
          "label": "Subjects",
          "value": "Maths · Basic Science · Computer Tech"
        },
        {
          "label": "Categories",
          "value": "Basic 3–6 and JSS 1–3"
        },
        {
          "label": "Exam date",
          "value": "November 14, 2026"
        },
        {
          "label": "Early bird",
          "value": "₦2,000 per candidate (10+ candidates)"
        }
      ]
    },
    "african-organic-chemistry-tournament": {
      "name": "African Organic Chemistry Tournament",
      "subtitle": "Interschool Organic Chemistry Olympiad",
      "tagline": "Think Chemistry. Master Organic Chemistry.",
      "pillar": "CHEMISTRY",
      "pillarBlurb": "Challenging students to achieve excellence in advanced chemistry.",
      "shortDescription": "Challenging students to think deeply and excel in organic chemistry.",
      "description": [
        "The African Organic Chemistry Tournament is an interschool organic chemistry olympiad designed to challenge students' understanding of organic chemistry and encourage excellence in chemical sciences.",
        "The tournament provides a competitive platform for students to apply their knowledge, demonstrate analytical thinking and engage with challenging organic chemistry problems.",
        "It also seeks to inspire students who have an interest in chemistry and encourage them to consider careers in science, engineering, medicine, technology and related fields."
      ],
      "objectives": [
        "Promote excellence in organic chemistry.",
        "Encourage deeper understanding of chemical concepts.",
        "Develop analytical and problem-solving abilities.",
        "Identify and celebrate talented chemistry students.",
        "Encourage interest in chemistry-related careers.",
        "Connect schools and students through academic competition."
      ],
      "eligibility": "Senior secondary students of chemistry, entered through their schools.",
      "format": "Theory paper → Problem-solving rounds → Finals",
      "ageRange": "Senior Secondary",
      "image": "/images/photos/chemistry-lab.jpg",
      "imageAlt": "Students conducting an organic chemistry experiment",
      "accent": "mint",
      "icon": "flask",
      "ctaLabel": "Explore the Tournament",
      "highlights": [
        {
          "label": "Edition",
          "value": "2nd Edition"
        },
        {
          "label": "Eligibility",
          "value": "SSS 1 - 3"
        },
        {
          "label": "Exam mode",
          "value": "CBT"
        },
        {
          "label": "Exam date",
          "value": "Nov 14 - 21, 2026"
        },
        {
          "label": "Star prize",
          "value": "₦500,000 cash + plaque"
        },
        {
          "label": "Entry",
          "value": "Through your school"
        }
      ],
      "prizeNote": "Star Prize: ₦500,000 cash prize and plaque",
      "poster": "/images/posters/aoct-2026-2nd-edition.jpg"
    }
  },
  "newsCategories": [
    {
      "name": "AFRISTEM News",
      "description": "Updates about the organisation and its activities."
    },
    {
      "name": "STEM Education",
      "description": "Articles about STEM learning and education."
    },
    {
      "name": "Innovation",
      "description": "Stories about technology, inventions and innovation."
    },
    {
      "name": "Competitions",
      "description": "Registration windows, results and competition updates."
    },
    {
      "name": "STEM Careers",
      "description": "Information about STEM careers and opportunities."
    },
    {
      "name": "Student Stories",
      "description": "Highlighting student achievements and experiences."
    },
    {
      "name": "School Stories",
      "description": "Showcasing schools making an impact through STEM."
    },
    {
      "name": "Opportunities",
      "description": "Scholarships, competitions, training and other opportunities."
    },
    {
      "name": "Resources",
      "description": "Guides, handbooks and teaching resources."
    }
  ],
  "galleryCategories": [
    "Programmes",
    "Competitions",
    "Training",
    "Workshops",
    "Students",
    "Schools",
    "STEM Projects",
    "Events"
  ],
  "offices": [
    {
      "name": "South East Nigeria Office",
      "short": "Abakaliki (Head Office)",
      "mapQuery": "PCN Plaza, Abakaliki Township Stadium, Kpirikpiri, Abakaliki, Ebonyi State"
    },
    {
      "name": "Abuja Liaison Office",
      "short": "Abuja",
      "mapQuery": "Vicbalkon Towers, Utako District, Abuja"
    },
    {
      "name": "Lagos Liaison Office",
      "short": "Lagos",
      "mapQuery": "Banana Estate, Igbe Lara, Ikorodu, Lagos"
    }
  ]
};
/* Column length limits and allowed values, copied from 01-schema.sql. */
const LIMITS = {"announcement":{"tone":10,"label":60,"message":500,"href":1024,"link_label":80},"hero_content":{"badge_label":60,"badge_text":255,"badge_href":1024,"headline":500,"primary_cta_label":80,"primary_cta_href":1024,"secondary_cta_label":80,"secondary_cta_href":1024,"background_image":1024,"feature_image":1024,"feature_eyebrow":255,"feature_caption":255,"secondary_image":1024,"secondary_image_caption":255},"site_settings":{"name":120,"tagline":255,"email":200,"primary_phone":40,"whatsapp":40,"secondary_phone":40,"address":500,"footer_note":500},"site_offices":{"id":100,"name":160,"city":120,"address":500,"phone":40,"map_query":500},"site_social_links":{"id":100,"label":80,"href":1024,"icon":20},"site_external_links":{"id":100,"label":160,"href":1024},"stats":{"id":100,"value":40,"label":120,"icon":30},"programmes":{"id":100,"slug":160,"name":200,"subtitle":255,"tagline":255,"format":255,"age_range":120,"image":1024,"image_alt":255,"pillar":20,"cta_label":120,"prize_note":500,"poster":1024,"register_href":1024,"status":20,"pillar_blurb":255,"accent":10,"icon":10},"events":{"id":100,"slug":160,"title":255,"display_date":120,"location":255,"mode":10,"deadline":120,"register_href":1024,"tag":80,"image":1024},"news_categories":{"name":60,"description":255},"news_posts":{"id":100,"slug":160,"title":300,"category":60,"display_date":120,"read_time":40,"image":1024,"author":120},"gallery_categories":{"name":60},"gallery_items":{"id":100,"src":1024,"alt":500,"caption":255,"category":60,"span":4},"videos":{"id":100,"title":255,"youtube_id":255,"thumb":1024,"category":80},"faqs":{"id":100,"question":500,"category":80},"testimonials":{"id":100,"name":120,"role":160,"org":160,"image":1024,"initials":10},"partners":{"id":100,"slug":160,"name":200,"logo":1024,"type":80,"href":1024,"cta_label":80,"country":80},"contact_messages":{"id":100,"name":120,"email":200,"phone":40,"organisation":160,"category":80,"subject":200,"status":20},"contact_message_notes":{"contact_message_id":100,"kind":10,"reply_subject":255,"email_status":20,"author":80},"registrations":{"id":100,"reference":20,"type":20,"programme_slug":160,"programme_id":100,"event_ref":160,"event_id":100,"category":80,"preferred_format":20,"full_name":120,"first_name":120,"last_name":120,"gender":20,"email":200,"phone":40,"school_name":160,"grade":80,"school_location":200,"state":80,"city":80,"role":80,"organisation":160,"participants":20,"guardian_name":120,"guardian_phone":40,"guardian_email":200,"guardian_relationship":40,"status":20},"registration_notes":{"registration_id":100,"kind":10,"reply_subject":255,"email_status":20,"author":80},"newsletter_subscribers":{"id":100,"email":200,"status":20,"source":40},"admin_account":{"password_hash":128,"password_salt":64,"hash_algorithm":30},"media_files":{"id":100,"file_name":255,"url":1024,"storage":20,"mime_type":60,"original_name":255}};
const ENUMS = {"announcementTone":["info","success","warning","urgent"],"pillar":["SCIENCE","TECHNOLOGY","STEM","CHEMISTRY"],"programmeStatus":["open","closing-soon","closed","coming-soon"],"eventMode":["Physical","Virtual","Hybrid"],"gallerySpan":["","wide","tall"],"contactStatus":["new","in-progress","replied","closed"],"registrationType":["student","school","educator","professional","partner"],"registrationStatus":["new","contacted","confirmed","waitlist","declined"],"newsletterStatus":["subscribed","unsubscribed"],"noteKind":["note","reply"],"emailStatus":["sent","logged_only","failed"]};

/* ---------------------------------------------------------------- args */
function usage(code) {
  process.stderr.write(
    "Usage: node store-json-to-sql.mjs <file.json> --dialect=postgres|mysql [--part=content,submissions,admin,media] [--uploads-dir=<folder>] [--media-base-url=/api/media]\n",
  );
  process.exit(code);
}
const opts = { file: null, dialect: null, parts: null, uploadsDir: null, mediaBase: "/api/media" };
for (const a of process.argv.slice(2)) {
  if (a === "-h" || a === "--help") usage(0);
  else if (a.startsWith("--dialect=")) opts.dialect = a.slice(10).toLowerCase();
  else if (a.startsWith("--part=")) opts.parts = a.slice(7).split(",").map((p) => p.trim()).filter(Boolean);
  else if (a.startsWith("--uploads-dir=")) opts.uploadsDir = a.slice(14);
  else if (a.startsWith("--media-base-url=")) opts.mediaBase = a.slice(17).replace(/\/+$/, "");
  else if (!opts.file) opts.file = a;
  else usage(1);
}
if (opts.dialect === "postgresql" || opts.dialect === "pg") opts.dialect = "postgres";
if (opts.dialect === "mariadb") opts.dialect = "mysql";
if (!opts.file || !["postgres", "mysql"].includes(opts.dialect)) usage(1);
const PARTS = new Set(opts.parts ?? ["content", "submissions", "admin", "media"]);
for (const p of PARTS) if (!["content", "submissions", "admin", "media"].includes(p)) usage(1);
const PG = opts.dialect === "postgres";

let store;
try {
  store = JSON.parse(fs.readFileSync(opts.file, "utf8"));
} catch (e) {
  process.stderr.write(`Cannot read ${opts.file}: ${e.message}\n`);
  process.exit(1);
}

/* ------------------------------------------------------------- values */
class Json { constructor(v) { this.v = v; } }
class Ts { constructor(d) { this.d = d; } }
class Raw { constructor(sql) { this.sql = sql; } }

const errors = [];
const warnings = [];

function lit(str) {
  const v = String(str).replace(/\u0000/g, "");
  return PG ? "'" + v.replace(/'/g, "''") + "'" : "'" + v.replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}
function val(v) {
  if (v === null || v === undefined) return "NULL";
  if (v instanceof Raw) return v.sql;
  if (v instanceof Json) return PG ? lit(JSON.stringify(v.v)) + "::jsonb" : lit(JSON.stringify(v.v));
  if (v instanceof Ts) {
    const iso = v.d.toISOString();
    const t = iso.slice(0, 10) + " " + iso.slice(11, 23);
    return PG ? lit(t + "+00") : lit(t);
  }
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  return lit(v);
}

const s = (v) => (v === null || v === undefined ? "" : typeof v === "string" ? v : String(v));
const textList = (v) => (Array.isArray(v) ? v.map(s) : typeof v === "string" && v ? v.split("\n") : []);
const list = (v) => (Array.isArray(v) ? v : []);
function oneOf(v, allowed, fallback, where) {
  if (allowed.includes(v)) return v;
  if (v !== undefined && v !== null && v !== "") warnings.push(`${where}: value '${v}' is not allowed - stored as '${fallback}'`);
  return fallback;
}
function dateOnly(v, where) {
  if (v === undefined || v === null || v === "") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  const iso = m ? `${m[1]}-${m[2]}-${m[3]}` : "";
  const d = m ? new Date(`${iso}T00:00:00Z`) : null;
  if (!d || isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) {
    warnings.push(`${where}: '${v}' is not a valid date - stored as NULL`);
    return null;
  }
  return iso;
}
function stamp(v, where, required) {
  const d = v ? new Date(v) : null;
  if (d && !isNaN(d.getTime())) return new Ts(d);
  if (required) {
    warnings.push(`${where}: missing/invalid timestamp '${s(v)}' - using 1970-01-01`);
    return new Ts(new Date(0));
  }
  return null;
}
function required(v, where) {
  const t = s(v).trim();
  if (t) return s(v);
  warnings.push(`${where}: required value is empty - stored as '(not provided)'`);
  return "(not provided)";
}

/* ------------------------------------------------------------- output */
const out = [];
const counts = {};
function checkLengths(table, row) {
  const lim = LIMITS[table] || {};
  for (const [col, v] of Object.entries(row)) {
    if (typeof v === "string" && lim[col] && [...v].length > lim[col]) {
      errors.push(`${table}.${col} (row id ${row.id ?? row.name ?? "?"}): ${[...v].length} characters, column limit is ${lim[col]}`);
    }
  }
}
function emit(table, rows, note) {
  counts[table] = (counts[table] ?? 0) + rows.length;
  out.push(`-- ${table}: ${rows.length} row(s)${note ? "  (" + note + ")" : ""}`);
  for (const r of rows) {
    checkLengths(table, r);
    const cols = Object.keys(r);
    out.push(`INSERT INTO ${table} (${cols.join(", ")})\nVALUES (${cols.map((c) => val(r[c])).join(", ")});`);
  }
  out.push("");
}
function uniqueIds(rows, table) {
  const seen = new Set();
  for (const r of rows) {
    const k = String(r.id).toLowerCase();
    if (seen.has(k)) errors.push(`${table}: duplicate id '${r.id}'`);
    seen.add(k);
  }
}
function uniqueSlugs(rows, table) {
  const seen = new Set();
  for (const r of rows) {
    const base = r.slug || String(r.id);
    let slug = base;
    let n = 2;
    while (seen.has(slug.toLowerCase())) slug = `${base}-${n++}`;
    if (slug !== r.slug) warnings.push(`${table}: empty or duplicate slug '${r.slug}' (id ${r.id}) stored as '${slug}'`);
    r.slug = slug;
    seen.add(slug.toLowerCase());
  }
}
const section = (title) => out.push(`-- =====================================================================\n-- ${title}\n-- =====================================================================\n`);

/* ============================================================ CONTENT */
function officeExtra(o) {
  // backups written by the database-backed website already carry these fields
  if (s(o.name) || s(o.mapQuery)) return { name: s(o.name), map_query: s(o.mapQuery) };
  const city = s(o.city).toLowerCase();
  const id = s(o.id).toLowerCase();
  const hit = REF.offices.find((x) => {
    const short = s(x.short).toLowerCase();
    return (city && short.startsWith(city)) || (id && short.startsWith(id));
  });
  return hit ? { name: s(hit.name), map_query: s(hit.mapQuery) } : { name: "", map_query: "" };
}
function parseHighlights(v) {
  if (Array.isArray(v)) return v.map((h) => ({ label: s(h?.label), value: s(h?.value) }));
  return s(v)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, ...rest] = l.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    });
}
const pick = (v, fallback) => (typeof v === "string" && v.trim() ? v : s(fallback));

function exportContent() {
  section("WEBSITE CONTENT");

  /* lookup tables first (other tables reference them) */
  const news = list(store.news);
  const gallery = list(store.gallery);
  const newsCats = REF.newsCategories.map((c, i) => ({ name: c.name, description: s(c.description), sort_order: i }));
  for (const p of news) {
    const c = s(p.category) || "AFRISTEM News";
    if (!newsCats.some((x) => x.name.toLowerCase() === c.toLowerCase())) {
      newsCats.push({ name: c, description: "", sort_order: newsCats.length });
      warnings.push(`news_categories: added unknown category '${c}' used by an article`);
    }
  }
  emit("news_categories", newsCats);
  const galCats = REF.galleryCategories.map((name, i) => ({ name, sort_order: i }));
  for (const g of gallery) {
    const c = s(g.category) || "Events";
    if (!galCats.some((x) => x.name.toLowerCase() === c.toLowerCase())) {
      galCats.push({ name: c, sort_order: galCats.length });
      warnings.push(`gallery_categories: added unknown category '${c}' used by a photo`);
    }
  }
  emit("gallery_categories", galCats);

  /* singletons */
  const a = store.announcement ?? {};
  emit("announcement", [
    {
      id: 1,
      enabled: Boolean(a.enabled),
      tone: oneOf(a.tone, ENUMS.announcementTone, "info", "announcement.tone"),
      label: s(a.label),
      message: s(a.message),
      href: s(a.href),
      link_label: s(a.linkLabel),
      starts_at: dateOnly(a.startsAt, "announcement.startsAt"),
      ends_at: dateOnly(a.endsAt, "announcement.endsAt"),
    },
  ]);

  const h = store.hero ?? {};
  emit("hero_content", [
    {
      id: 1,
      badge_label: s(h.badgeLabel),
      badge_text: s(h.badgeText),
      badge_href: s(h.badgeHref),
      headline: s(h.headline),
      rotating_words: new Json(textList(h.rotatingWords)),
      subheading: s(h.subheading),
      primary_cta_label: s(h.primaryCtaLabel),
      primary_cta_href: s(h.primaryCtaHref),
      secondary_cta_label: s(h.secondaryCtaLabel),
      secondary_cta_href: s(h.secondaryCtaHref),
      background_image: s(h.backgroundImage),
      feature_image: s(h.featureImage),
      feature_eyebrow: s(h.featureEyebrow),
      feature_caption: s(h.featureCaption),
      secondary_image: s(h.secondaryImage),
      secondary_image_caption: s(h.secondaryImageCaption),
    },
  ]);

  const st = store.site ?? {};
  emit("site_settings", [
    {
      id: 1,
      name: s(st.name),
      tagline: s(st.tagline),
      description: s(st.description),
      email: s(st.email),
      primary_phone: s(st.primaryPhone),
      whatsapp: s(st.whatsapp),
      secondary_phone: s(st.secondaryPhone),
      address: s(st.address),
      registration_note: s(st.registrationNote),
      registration_opens: dateOnly(st.registrationOpens, "site.registrationOpens"),
      registration_closes: dateOnly(st.registrationCloses, "site.registrationCloses"),
      footer_note: s(st.footerNote),
    },
  ]);

  const offices = list(st.offices).map((o, i) => ({
    id: s(o.id) || `office-${i + 1}`,
    name: officeExtra(o).name,
    city: s(o.city),
    address: s(o.address),
    phone: s(o.phone),
    map_query: officeExtra(o).map_query,
    sort_order: i,
  }));
  uniqueIds(offices, "site_offices");
  emit("site_offices", offices);

  const socials = list(st.socials).map((o, i) => ({
    id: s(o.id) || `social-${i + 1}`,
    label: s(o.label),
    href: s(o.href),
    icon: s(o.icon) || "link",
    sort_order: i,
  }));
  uniqueIds(socials, "site_social_links");
  emit("site_social_links", socials);

  const links = list(st.externalLinks).map((o, i) => ({
    id: s(o.id) || `ext-${i + 1}`,
    label: s(o.label),
    href: s(o.href),
    description: s(o.description),
    sort_order: i,
  }));
  uniqueIds(links, "site_external_links");
  emit("site_external_links", links);

  /* collections */
  const stats = list(store.stats).map((x, i) => ({
    id: s(x.id) || `stat-${i + 1}`,
    value: s(x.value),
    label: s(x.label),
    icon: s(x.icon) || "sparkles",
    sort_order: i,
  }));
  uniqueIds(stats, "stats");
  emit("stats", stats);

  const programmes = list(store.programmes).map((p, i) => {
    const id = s(p.id) || s(p.slug) || `prog-${i + 1}`;
    const base = REF.programmeDetails[s(p.slug)] ?? REF.programmeDetails[id] ?? null;
    let highlights = parseHighlights(p.highlights);
    if (!highlights.length && base) highlights = base.highlights; // the live site falls back the same way
    return {
      id,
      slug: s(p.slug),
      name: pick(p.name, base?.name),
      subtitle: pick(p.subtitle, base?.subtitle),
      tagline: pick(p.tagline, base?.tagline),
      short_description: pick(p.shortDescription, base?.shortDescription),
      eligibility: pick(p.eligibility, base?.eligibility),
      format: pick(p.format, base?.format),
      age_range: pick(p.ageRange, base?.ageRange),
      image: pick(p.image, base?.image),
      image_alt: pick(p.imageAlt, base?.imageAlt),
      pillar: oneOf(pick(p.pillar, base?.pillar), ENUMS.pillar, "STEM", `programmes[${id}].pillar`),
      cta_label: pick(p.ctaLabel, base?.ctaLabel) || "Register interest",
      highlights: new Json(highlights),
      prize_note: pick(p.prizeNote, base?.prizeNote),
      poster: pick(p.poster, base?.poster),
      register_href: s(p.registerHref) || "/register",
      featured: p.featured === undefined ? true : Boolean(p.featured),
      status: oneOf(p.status, ENUMS.programmeStatus, "open", `programmes[${id}].status`),
      // the database-backed website stores these with the programme; older backups get them from the code
      pillar_blurb: s(p.pillarBlurb) || s(base?.pillarBlurb),
      description: new Json(textList(Array.isArray(p.description) && p.description.length ? p.description : base?.description)),
      objectives: new Json(textList(Array.isArray(p.objectives) && p.objectives.length ? p.objectives : base?.objectives)),
      accent: s(p.accent) || s(base?.accent) || "sun",
      icon: s(p.icon) || s(base?.icon) || "trophy",
      sort_order: i,
    };
  });
  uniqueIds(programmes, "programmes");
  uniqueSlugs(programmes, "programmes");
  emit("programmes", programmes);

  const events = list(store.events).map((e, i) => {
    const id = s(e.id) || (e.slug ? `event-${e.slug}` : `event-${i + 1}`);
    let start = dateOnly(e.start, `events[${id}].start`);
    if (!start) {
      errors.push(`events[${id}]: start date is missing or invalid ('${s(e.start)}') - it is required`);
      start = "1970-01-01";
    }
    return {
      id,
      slug: s(e.slug),
      title: s(e.title),
      start_date: start,
      end_date: dateOnly(e.end, `events[${id}].end`),
      display_date: s(e.displayDate),
      location: s(e.location),
      mode: oneOf(e.mode, ENUMS.eventMode, "Physical", `events[${id}].mode`),
      description: s(e.description),
      deadline: s(e.deadline),
      register_href: s(e.registerHref) || "/register",
      tag: s(e.tag),
      image: s(e.image),
      sort_order: i,
    };
  });
  uniqueIds(events, "events");
  uniqueSlugs(events, "events");
  emit("events", events);

  const posts = news.map((p, i) => {
    const id = s(p.id) || (p.slug ? `post-${p.slug}` : `post-${i + 1}`);
    let published = dateOnly(p.date, `news[${id}].date`);
    if (!published) {
      errors.push(`news[${id}]: date is missing or invalid ('${s(p.date)}') - it is required`);
      published = "1970-01-01";
    }
    const cat = s(p.category) || "AFRISTEM News";
    return {
      id,
      slug: s(p.slug),
      title: s(p.title),
      excerpt: s(p.excerpt),
      category: newsCats.find((x) => x.name.toLowerCase() === cat.toLowerCase()).name,
      published_on: published,
      display_date: s(p.displayDate),
      read_time: s(p.readTime) || "3 min read",
      image: s(p.image),
      author: s(p.author) || "AFRISTEM Team",
      body: new Json(textList(p.body)),
      sort_order: i,
    };
  });
  uniqueIds(posts, "news_posts");
  uniqueSlugs(posts, "news_posts");
  emit("news_posts", posts);

  const photos = gallery.map((g, i) => {
    const cat = s(g.category) || "Events";
    return {
      id: s(g.id) || `photo-${i + 1}`,
      src: s(g.src),
      alt: s(g.alt),
      caption: s(g.caption),
      category: galCats.find((x) => x.name.toLowerCase() === cat.toLowerCase()).name,
      span: g.span === "wide" || g.span === "tall" ? g.span : "",
      sort_order: i,
    };
  });
  uniqueIds(photos, "gallery_items");
  emit("gallery_items", photos);

  const videos = list(store.videos).map((v, i) => ({
    id: s(v.id) || `video-${i + 1}`,
    title: s(v.title),
    description: s(v.description),
    youtube_id: s(v.youtubeId),
    thumb: s(v.thumb),
    category: s(v.category) || "Highlights",
    featured: Boolean(v.featured),
    sort_order: i,
  }));
  uniqueIds(videos, "videos");
  emit("videos", videos);

  const faqs = list(store.faqs).map((f, i) => ({
    id: s(f.id) || `faq-${i + 1}`,
    question: s(f.question ?? f.q),
    answer: s(f.answer ?? f.a),
    category: s(f.category) || "General",
    sort_order: i,
  }));
  uniqueIds(faqs, "faqs");
  emit("faqs", faqs);

  const testimonials = list(store.testimonials).map((t, i) => ({
    id: s(t.id) || `testimonial-${i + 1}`,
    quote: s(t.quote),
    name: s(t.name),
    role: s(t.role),
    org: s(t.org),
    image: s(t.image),
    initials: s(t.initials),
    featured: Boolean(t.featured),
    sort_order: i,
  }));
  uniqueIds(testimonials, "testimonials");
  emit("testimonials", testimonials);

  const partners = list(store.partners).map((p, i) => ({
    id: s(p.id) || `partner-${i + 1}`,
    slug: s(p.slug),
    name: s(p.name),
    logo: s(p.logo),
    type: s(p.type) || "Partner",
    description: new Json(textList(p.description)),
    href: s(p.href),
    cta_label: s(p.ctaLabel) || "Learn more",
    external: Boolean(p.external),
    country: s(p.country),
    sort_order: i,
  }));
  uniqueIds(partners, "partners");
  uniqueSlugs(partners, "partners");
  emit("partners", partners);
}

/* ======================================================== SUBMISSIONS */
const REPLY_RE = /^Reply sent( \(dev mode — email logged, not delivered\))?: ([^\n]*)\n\n([\s\S]*)$/;
function toNote(n, parentCol, parentId, where) {
  const text = s(n?.text);
  const m = REPLY_RE.exec(text);
  const base = { [parentCol]: parentId };
  const common = { author: s(n?.by) || "admin", created_at: stamp(n?.at, where, true) };
  // backups from the database-backed website carry the structured fields
  if (n?.kind === "reply" || n?.kind === "note") {
    const status = ["sent", "logged_only", "failed"].includes(n?.emailStatus) ? n.emailStatus : n.kind === "reply" ? "sent" : null;
    return {
      ...base,
      kind: n.kind,
      reply_subject: n.kind === "reply" ? s(n?.subject) : "",
      email_status: n.kind === "reply" ? status : null,
      body: s(n?.body) || text || "(empty)",
      ...common,
    };
  }
  if (m) {
    return { ...base, kind: "reply", reply_subject: m[2], email_status: m[1] ? "logged_only" : "sent", body: m[3] || "(empty)", ...common };
  }
  return { ...base, kind: "note", reply_subject: "", email_status: null, body: text || "(empty)", ...common };
}
const subquery = (table, slug) => (slug ? new Raw(`(SELECT id FROM ${table} WHERE slug = ${lit(slug)})`) : null);

function exportSubmissions() {
  section("FORM SUBMISSIONS");
  const subs = store.submissions ?? {};

  const contacts = list(subs.contact);
  const contactRows = [];
  const contactNotes = [];
  contacts.forEach((c, i) => {
    const id = s(c.id) || `msg-import-${i + 1}`;
    const where = `submissions.contact[${id}]`;
    contactRows.push({
      id,
      name: required(c.name, `${where}.name`),
      email: required(c.email, `${where}.email`),
      phone: s(c.phone),
      organisation: s(c.organisation),
      category: s(c.category) || "General Enquiry",
      subject: required(c.subject, `${where}.subject`),
      message: required(c.message, `${where}.message`),
      status: oneOf(c.status, ENUMS.contactStatus, "new", `${where}.status`),
      created_at: stamp(c.createdAt, `${where}.createdAt`, true),
    });
    for (const n of list(c.notes)) contactNotes.push(toNote(n, "contact_message_id", id, `${where}.notes`));
  });
  uniqueIds(contactRows, "contact_messages");
  emit("contact_messages", contactRows);
  emit("contact_message_notes", contactNotes);

  const regs = list(subs.register);
  const regRows = [];
  const regNotes = [];
  const refs = new Set();
  regs.forEach((r, i) => {
    const id = s(r.id) || `reg-import-${i + 1}`;
    const where = `submissions.register[${id}]`;
    const created = stamp(r.createdAt, `${where}.createdAt`, true);
    let reference = s(r.reference) || `AFR-${created.d.getUTCFullYear()}-${id.slice(-5).toUpperCase()}`;
    let n = 2;
    const baseRef = reference;
    while (refs.has(reference.toUpperCase())) reference = `${baseRef}-${n++}`;
    if (reference !== s(r.reference)) warnings.push(`${where}: missing or duplicate reference '${s(r.reference)}' stored as '${reference}'`);
    refs.add(reference.toUpperCase());

    let type = s(r.type);
    let extraNote = "";
    if (!ENUMS.registrationType.includes(type)) {
      warnings.push(`${where}: unknown type '${type}' stored as 'student' (original kept in applicant_notes)`);
      extraNote = `[original type: ${type}] `;
      type = "student";
    }
    const fullName = s(r.fullName) || [s(r.firstName), s(r.lastName)].filter(Boolean).join(" ").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const consent = r.consent === undefined ? true : r.consent === true || r.consent === "yes";
    const programme = s(r.programme);
    const event = s(r.event);
    regRows.push({
      id,
      reference,
      type,
      programme_slug: programme,
      programme_id: subquery("programmes", programme),
      event_ref: event,
      event_id: subquery("events", event),
      category: s(r.category),
      preferred_format: s(r.format ?? r.preferredFormat),
      full_name: required(fullName, `${where}.fullName`),
      first_name: s(r.firstName) || parts[0] || "",
      last_name: r.firstName !== undefined ? s(r.lastName) : parts.slice(1).join(" "),
      date_of_birth: dateOnly(r.dob ?? r.dateOfBirth, `${where}.dob`),
      gender: s(r.gender),
      email: required(r.email, `${where}.email`),
      phone: required(r.phone, `${where}.phone`),
      school_name: s(r.schoolName) || s(r.school),
      grade: s(r.grade),
      school_location: s(r.schoolLocation),
      state: s(r.state),
      city: s(r.city),
      role: s(r.role),
      organisation: s(r.organisation),
      participants: s(r.participants ?? r.students),
      applicant_notes: extraNote + (typeof r.notes === "string" ? r.notes : s(r.message)),
      guardian_name: s(r.guardianName),
      guardian_phone: s(r.guardianPhone),
      guardian_email: s(r.guardianEmail),
      guardian_relationship: s(r.guardianRelationship),
      consent_given: consent,
      consent_at: consent ? created : null,
      status: oneOf(r.status, ENUMS.registrationStatus, "new", `${where}.status`),
      created_at: created,
    });
    for (const nt of list(r.thread)) regNotes.push(toNote(nt, "registration_id", id, `${where}.thread`));
  });
  uniqueIds(regRows, "registrations");
  emit("registrations", regRows);
  emit("registration_notes", regNotes);

  /* newsletter: one row per email (case-insensitive); newest status wins */
  const groups = new Map();
  for (const n of list(subs.newsletter)) {
    const email = s(n.email).trim().toLowerCase();
    if (!email) continue;
    if (!groups.has(email)) groups.set(email, []);
    groups.get(email).push(n);
  }
  const subRows = [];
  for (const [email, items] of groups) {
    const time = (x) => new Date(x.createdAt ?? 0).getTime() || 0;
    const newest = items.reduce((a, b) => (time(b) > time(a) ? b : a));
    const oldest = items.reduce((a, b) => (time(b) < time(a) ? b : a));
    if (items.length > 1) warnings.push(`newsletter: ${items.length} rows for ${email} merged into one (status '${newest.status}')`);
    const status = oneOf(newest.status, ENUMS.newsletterStatus, "subscribed", `newsletter[${email}].status`);
    subRows.push({
      id: s(newest.id) || `sub-import-${subRows.length + 1}`,
      email,
      status,
      source: s(newest.source) || "newsletter",
      created_at: stamp(oldest.createdAt, `newsletter[${email}].createdAt`, true),
      unsubscribed_at: status === "unsubscribed" ? stamp(newest.unsubscribedAt, "", false) : null,
    });
  }
  uniqueIds(subRows, "newsletter_subscribers");
  emit("newsletter_subscribers", subRows);
}

/* ============================================================== ADMIN */
function exportAdmin() {
  section("ADMIN ACCOUNT");
  const u = store.admin?.user;
  if (u && s(u.passwordHash) && s(u.salt)) {
    const when = stamp(u.updatedAt, "admin.user.updatedAt", true);
    emit("admin_account", [
      {
        id: 1,
        password_hash: s(u.passwordHash),
        password_salt: s(u.salt),
        hash_algorithm: "pbkdf2-sha256",
        hash_iterations: 120000,
        created_at: when,
        updated_at: when,
      },
    ], "the current admin password keeps working");
  } else {
    emit("admin_account", [], "left empty on purpose: the first login creates it");
  }
}

/* ============================================================== MEDIA */
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".svg": "image/svg+xml" };
function exportMedia() {
  section("UPLOADED IMAGES");
  if (!opts.uploadsDir) {
    emit("media_files", [], "no --uploads-dir given");
    return;
  }
  let entries = [];
  try {
    entries = fs.readdirSync(opts.uploadsDir, { withFileTypes: true });
  } catch (e) {
    errors.push(`--uploads-dir: cannot read ${opts.uploadsDir}: ${e.message}`);
  }
  const rows = entries
    .filter((f) => f.isFile() && !f.name.startsWith(".") && MIME[path.extname(f.name).toLowerCase()])
    .map((f) => f.name)
    .sort()
    .map((name) => {
      const st = fs.statSync(path.join(opts.uploadsDir, name));
      return {
        id: "media-" + name.replace(/\.[^.]+$/, ""),
        file_name: name,
        url: `${opts.mediaBase}/${name}`,
        storage: "local",
        mime_type: MIME[path.extname(name).toLowerCase()],
        size_bytes: st.size,
        created_at: new Ts(st.mtime),
      };
    });
  uniqueIds(rows, "media_files");
  emit("media_files", rows);
}

/* =============================================================== RUN */
if (PARTS.has("content")) exportContent();
if (PARTS.has("submissions")) exportSubmissions();
if (PARTS.has("admin")) exportAdmin();
if (PARTS.has("media")) exportMedia();

for (const w of warnings) process.stderr.write(`WARNING: ${w}\n`);
if (errors.length) {
  for (const e of errors) process.stderr.write(`ERROR: ${e}\n`);
  process.stderr.write(`\n${errors.length} problem(s) found - no SQL was written. Fix the JSON (or widen the column in 01-schema.sql) and run again.\n`);
  process.exit(2);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const head = [
  "-- =====================================================================",
  `--  AFRISTEM Global website - DATA (${PG ? "PostgreSQL" : "MySQL / MariaDB"})`,
  `--  Source : ${path.basename(opts.file)}`,
  `--  Parts  : ${[...PARTS].join(", ")}`,
  `--  Rows   : ${total}`,
  "--  Load into an EMPTY database created with 01-schema.sql.",
  "--  Everything runs in one transaction: it either all loads or nothing does.",
  "-- =====================================================================",
  "",
];
const pre = PG
  ? ["SET client_encoding = 'UTF8';", "SET standard_conforming_strings = on;", "", "BEGIN;", ""]
  : [
      "SET NAMES utf8mb4;",
      "SET time_zone = '+00:00';",
      "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';",
      "",
      "START TRANSACTION;",
      "",
    ];
const post = ["COMMIT;", "", "-- Row counts loaded:", ...Object.entries(counts).map(([t, n]) => `--   ${t.padEnd(24)} ${n}`), ""];
process.stdout.write([...head, ...pre, ...out, ...post].join("\n"));
process.stderr.write(`OK: ${total} rows (${opts.dialect}).${warnings.length ? ` ${warnings.length} warning(s) above.` : ""}\n`);
