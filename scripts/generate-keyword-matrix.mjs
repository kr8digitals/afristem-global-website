#!/usr/bin/env node
/**
 * ------------------------------------------------------------------
 *  AFRISTEM keyword matrix generator.
 *
 *  Produces the full long-tail keyword universe (~20,000 phrases) for
 *  afristemglobal.org as CSV + summary JSON under /seo/keywords/.
 *
 *  HOW THE MATRIX IS IMPLEMENTED
 *  -----------------------------
 *  Raw keyword stuffing is a spam signal, so the matrix is implemented
 *  the way modern search engines reward:
 *
 *  1. PRIORITY 1 (implemented directly in code):
 *     - src/content/seo.ts — per-page <title>, meta description,
 *       keywords meta and visible FAQ copy (brand + core + intent terms).
 *     - src/lib/seo.ts — schema.org entities (programmes, courses,
 *       events, services) that resolve exact entity queries.
 *     - Headings, alt text and internal links across the site.
 *
 *  2. PRIORITY 2/3 (content roadmap driven by this matrix):
 *     Each remaining long-tail phrase maps to a cluster covered by an
 *     existing page (see target_page column) — search engines match
 *     those queries through semantic relevance, FAQ answers and
 *     structured data rather than literal repetition.
 *
 *  Run: node scripts/generate-keyword-matrix.mjs
 * ------------------------------------------------------------------
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "seo", "keywords");
mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------------------ seed lists */

const REGIONS = [
  "Africa", "West Africa", "East Africa", "Nigeria", "Lagos", "Abuja", "Abakaliki", "Ebonyi State", "Rivers State", "Enugu State",
  "Owerri", "Port Harcourt", "Kano", "Ibadan", "Benin City", "Uyo", "Asaba", "Onitsha", "Awka", "Jos",
  "Kaduna", "Benue", "Delta State", "Anambra State", "Imo State", "Ghana", "Accra", "Kenya", "Nairobi", "South Africa",
  "Johannesburg", "Cape Town", "Rwanda", "Kigali", "Uganda", "Kampala", "Cameroon", "Tanzania", "Ethiopia", "Zambia",
  "Zimbabwe", "Senegal", "Ivory Coast", "Sierra Leone", "Liberia", "the UK", "London", "the US", "Houston", "Atlanta",
  "Canada", "Toronto", "worldwide", "globally", "online",
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos State", "Nasarawa", "Niger State", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "the FCT",
];

const AUDIENCES = [
  "for kids", "for children", "for teenagers", "for youth", "for primary school students", "for secondary school students",
  "for JSS students", "for SSS students", "for primary schools", "for secondary schools", "for teachers", "for educators",
  "for schools", "for parents", "for beginners", "for girls", "for homeschoolers",
];

const INTENTS = [
  "registration", "how to register", "registration form", "entry requirements", "eligibility", "fees", "cost",
  "past questions", "past questions and answers", "results", "winners", "timetable", "exam date", "syllabus",
  "preparatory guide", "how it works", "benefits", "certificates", "near me", "online", "free", "2026", "2027",
];

const TOPICS = [
  "STEM education", "STEM learning", "STEM training", "science education", "technology education", "engineering education",
  "mathematics education", "STEM programmes", "STEM competitions", "science competitions", "coding competitions", "robotics programmes",
  "coding classes", "robotics classes", "coding boot camps", "STEM boot camps", "science fairs", "STEM workshops",
  "science spelling bee", "chemistry olympiad", "science olympiad", "maths competition", "coding and robotics",
  "digital literacy", "digital skills training", "online science school", "online school", "virtual learning",
  "WAEC preparation", "NECO preparation", "JAMB preparation", "exam preparation", "after-school STEM clubs",
  "STEM clubs", "science and technology curricula", "advanced STEM programmes", "engineering training",
  "teacher training", "STEM professional development", "STEM mentorship", "STEM scholarships", "STEM careers",
  "science lab equipment", "robotics kits", "EdTech platforms", "educational technology", "AI education",
  "practical science lessons", "global STEM education", "digital science school",
];

const QUALIFIERS = ["best", "top", "leading", "affordable", "accredited", "recognized", "pan-African", "international", "award-winning", "practical"];

const PROGRAMMES = [
  { name: "SciSPELL", page: "/programmes/scispell" },
  { name: "Code Africa", page: "/programmes/code-africa" },
  { name: "STEM Kids Championship", page: "/programmes/stem-kids-championship" },
  { name: "African Organic Chemistry Tournament", page: "/programmes/african-organic-chemistry-tournament" },
  { name: "Annual National Science Championship", page: "/prime-stem-nigeria" },
  { name: "AFRISTEM Digital Science School", page: "/digital-science-school" },
  { name: "International STEMx Boot Camp", page: "/events" },
  { name: "Laptop for Schools Project", page: "/prime-stem-nigeria" },
];

const QUESTION_TEMPLATES = [
  "what is %s", "who organises %s", "when is %s", "where does %s hold", "how to register for %s",
  "how much is %s registration", "is %s open to all schools", "who can join %s", "what are the prizes for %s",
  "how to prepare for %s", "is %s online or physical", "what age group is %s for", "does %s give certificates",
  "how do schools enter %s", "what subjects are in %s", "latest news about %s", "past winners of %s",
  "syllabus for %s", "deadline for %s registration", "benefits of %s for students",
];

const CAREERS = [
  "careers in science", "careers in technology", "careers in engineering", "careers in mathematics", "careers in data science",
  "careers in software development", "careers in robotics", "careers in medicine", "careers in artificial intelligence",
  "careers in renewable energy", "careers in chemistry", "careers in biotechnology", "careers in agriculture technology",
  "how to become a software engineer", "how to become a data scientist", "how to become a doctor", "how to become an engineer",
  "STEM courses in university", "best university courses for the future", "high-paying STEM careers", "STEM careers for women",
];

const EXAMS = ["WAEC", "NECO", "JAMB", "BECE", "common entrance"];
const EXAM_SUBJECTS = ["mathematics", "biology", "chemistry", "physics", "basic science", "english language", "further mathematics", "computer studies", "agricultural science"];
const EXAM_TEMPLATES = [
  "online %s preparation", "%s past questions and answers", "best %s tutorial", "free %s lessons", "%s practice tests",
  "how to pass %s", "%s syllabus", "%s timetable", "%s study guide", "intensive %s coaching", "%s revision classes",
  "%s expo", "%s mock exams", "%s answers app",
];

const NIGERIAN_CITIES = ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Abakaliki", "Owerri", "Benin City", "Uyo", "Asaba", "Onitsha", "Awka", "Kaduna", "Jos", "Abeokuta", "Ilorin", "Warri", "Calabar", "Makurdi"];

/* ------------------------------------------------------------- helpers */

function pageForTopic(topic) {
  const t = topic.toLowerCase();
  if (t.includes("spelling")) return "/programmes/scispell";
  if (t.includes("coding") || t.includes("code") || t.includes("digital literacy") || t.includes("ai education")) return "/programmes/code-africa";
  if (t.includes("chemistry") || t.includes("olympiad")) return "/programmes/african-organic-chemistry-tournament";
  if (t.includes("waec") || t.includes("neco") || t.includes("jamb") || t.includes("online") || t.includes("virtual") || t.includes("exam")) return "/digital-science-school";
  if (t.includes("teacher") || t.includes("professional development") || t.includes("mentorship")) return "/educators";
  if (t.includes("lab") || t.includes("kits") || t.includes("equipment")) return "/services";
  if (t.includes("career")) return "/news";
  return "/programmes";
}

/** @type {Map<string, {keyword: string, cluster: string, target_page: string, intent: string, priority: number}>} */
const matrix = new Map();
const add = (keyword, cluster, targetPage, intent, priority) => {
  const k = keyword.toLowerCase().replace(/\s+/g, " ").trim();
  if (!k || matrix.has(k)) return;
  matrix.set(k, { keyword: k, cluster, target_page: targetPage, intent, priority });
};

/* ------------------------------------------------------- matrix groups */

// A. Topic × Region — "STEM education in Nigeria"
for (const t of TOPICS) for (const r of REGIONS) add(`${t} in ${r}`, "topic-location", pageForTopic(t), "informational", 3);

// B. Topic × Audience — "coding classes for kids"
for (const t of TOPICS) for (const a of AUDIENCES) add(`${t} ${a}`, "topic-audience", pageForTopic(t), "informational", 3);

// C. Best/top queries — "best STEM competitions in Africa"
for (const q of QUALIFIERS) for (const t of TOPICS.slice(0, 25)) for (const r of REGIONS.slice(0, 16)) add(`${q} ${t} in ${r}`, "best-of", pageForTopic(t), "commercial", 2);

// D. Programme × question templates
for (const p of PROGRAMMES) for (const q of QUESTION_TEMPLATES) add(q.replace("%s", p.name), "programme-question", p.page, "conversational", 1);

// E. Programme × region + registration
for (const p of PROGRAMMES) for (const r of REGIONS) {
  add(`${p.name.toLowerCase()} ${r}`, "programme-location", p.page, "navigational", 1);
  if (r !== "online") add(`${p.name.toLowerCase()} registration ${r}`, "programme-location", p.page, "transactional", 1);
}

// F. Programme × intent
for (const p of PROGRAMMES) for (const i of INTENTS) add(`${p.name.toLowerCase()} ${i}`, "programme-intent", p.page, "transactional", 1);

// G. "near me" queries
for (const t of TOPICS) add(`${t} near me`, "near-me", pageForTopic(t), "local", 2);
for (const t of TOPICS.slice(0, 30)) for (const r of REGIONS.slice(0, 25)) add(`${t} in ${r} near me`, "near-me", pageForTopic(t), "local", 3);

// H. Conversational / AI-style questions
const CONVO = [
  "where can I study %s online", "what is the best platform for %s", "how do I get my child into %s",
  "are there %s in Africa", "which organisation runs %s", "is %s worth it", "how can schools access %s",
  "tell me about %s", "recommend %s for my child", "what age can children start %s",
  "how much do %s cost", "do %s offer certificates", "can I join %s from another country",
  "what do students learn in %s", "who runs %s in Nigeria", "where to find %s for my school",
  "how to choose the right %s", "what makes a good %s", "are %s recognised internationally",
  "how long do %s last", "can teachers join %s", "is there financial aid for %s",
  "what equipment do I need for %s", "how competitive are %s",
];
for (const c of CONVO) for (const t of TOPICS.slice(0, 38)) add(c.replace("%s", t), "conversational", pageForTopic(t), "conversational", 2);

// I. Exam-prep combos
for (const e of EXAMS) for (const s of EXAM_SUBJECTS) for (const t of EXAM_TEMPLATES) add(t.replace("%s", `${e} ${s}`), "exam-prep", "/digital-science-school", "transactional", 2);

// J. Careers & guidance
for (const c of CAREERS) {
  add(c, "careers", "/news", "informational", 3);
  add(`guide to ${c}`, "careers", "/news", "informational", 3);
  for (const r of REGIONS.slice(0, 6)) add(`${c} ${r}`, "careers", "/news", "informational", 3);
}

// K. Brand & entity queries
const BRAND = ["AFRISTEM", "AFRISTEM Global", "afristemglobal", "AFRISTEM GLOBAL RC 9452641", "AFRISTEM Abakaliki", "Prime STEM Nigeria", "AFRISTEM Digital Science School"];
const BRAND_TEMPLATES = [
  "%s", "%s website", "%s official website", "%s contact", "%s programmes", "%s founder", "%s CEO", "%s address",
  "%s phone number", "%s registration", "%s events", "%s news", "who is behind %s", "is %s legit", "%s reviews",
  "about %s", "%s vision and mission", "%s partners", "join %s", "work with %s", "donate to %s", "%s social media",
  "%s competitions", "%s boot camp", "%s online school", "%s teacher training", "%s logo", "%s meaning",
  "what does %s do", "%s careers",
];
for (const b of BRAND) for (const t of BRAND_TEMPLATES) add(t.replace("%s", b.toLowerCase()), "brand", "/about", "navigational", 1);

// L. Long-tail compound queries
const COMPOUND_A = ["affordable", "free", "weekend", "holiday", "after-school", "online", "certified", "government-approved", "scholarship-backed", "competition-focused"];
const COMPOUND_B = ["STEM classes", "science lessons", "coding lessons", "robotics training", "maths coaching", "exam coaching", "STEM camps", "science clubs", "technology workshops", "engineering workshops"];
for (const a of COMPOUND_A) for (const b of COMPOUND_B) for (const r of REGIONS.slice(0, 40)) add(`${a} ${b} in ${r}`, "compound", pageForTopic(b), "commercial", 3);

// M. Age & grade queries
const AGES = ["ages 5-8", "ages 8-12", "ages 10-14", "ages 12-18", "Primary 4", "Primary 5", "Primary 6", "Basic 4", "Basic 5", "Basic 6", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const AGE_TOPICS = ["STEM classes", "coding classes", "science tutoring", "maths tutoring", "exam preparation", "robotics training", "online lessons", "holiday coaching"];
for (const age of AGES) for (const t of AGE_TOPICS) add(`${t} for ${age}`, "age-grade", "/digital-science-school", "transactional", 2);

// N. School-leader / B2B queries
const B2B = [
  "how to start a STEM club in my school", "STEM curriculum for private schools", "STEM equipment for schools",
  "robotics lab setup for schools", "science lab equipment suppliers", "teacher training for science teachers",
  "STEM consultancy for schools", "organise a science fair", "school STEM strategy", "STEM accreditation for schools",
  "corporate sponsorship for education", "CSR opportunities in education", "sponsor a science competition",
  "NGO partnerships for schools", "STEM grants for African schools", "donate laptops to schools",
];
for (const b of B2B) {
  add(b, "b2b", "/services", "transactional", 2);
  for (const r of REGIONS.slice(0, 22)) add(`${b} ${r}`, "b2b", "/services", "transactional", 3);
}

// O. Best-of comparison queries
const COMPARE = ["best", "biggest", "most popular", "largest", "most affordable"];
for (const c of COMPARE) for (const t of ["science competition", "coding competition", "STEM programme", "online science school", "STEM boot camp"]) for (const r of ["in Africa", "in Nigeria", "in West Africa", "for African students", "in East Africa", "for the diaspora"]) add(`${c} ${t} ${r}`, "best-of", pageForTopic(t), "commercial", 2);

// P. Nigerian state targeting — "STEM competitions in Ebonyi State"
for (const s of NIGERIAN_STATES) {
  for (const t of TOPICS.slice(0, 20)) add(`${t} in ${s}`, "nigerian-states", pageForTopic(t), "local", 3);
  for (const p of PROGRAMMES.slice(0, 4)) add(`${p.name.toLowerCase()} ${s}`, "nigerian-states", p.page, "local", 2);
}

// Q. School-type combinations
const SCHOOL_TYPES = ["private schools", "public schools", "international schools", "faith-based schools", "boarding schools", "rural schools"];
for (const st of SCHOOL_TYPES) for (const t of TOPICS.slice(0, 18)) for (const r of REGIONS.slice(0, 12)) add(`${t} for ${st} in ${r}`, "school-type", pageForTopic(t), "commercial", 3);

// R. Seasonal / holiday programmes
const SEASONS = ["summer", "holiday", "December", "Easter", "half-term", "weekend"];
for (const s of SEASONS) for (const t of ["STEM camp", "coding camp", "robotics camp", "science camp", "STEM boot camp", "exam prep", "maths camp", "coding classes", "robotics classes", "science classes"]) for (const r of REGIONS.slice(0, 30)) add(`${s} ${t} in ${r}`, "seasonal", pageForTopic(t), "transactional", 3);

// S. Parent-focused queries
const PARENT = [
  "is online school safe for my child", "how to get my child interested in science", "STEM gifts for kids",
  "how to support my child's STEM education", "best extracurricular activities for kids", "coding at home for kids",
  "science experiments to do at home", "how to choose an online school", "online school vs traditional school",
  "is AFRISTEM good for my child", "STEM activities for curious kids", "how to prepare my child for a science competition",
  "monitoring my child's online classes", "screen time and online learning", "holiday activities for kids",
];
for (const p of PARENT) {
  add(p, "parents", "/schools", "informational", 2);
  for (const r of REGIONS.slice(0, 20)) add(`${p} ${r}`, "parents", "/schools", "informational", 3);
}

// T. Jobs / volunteering
const WORK = ["jobs at STEM organisations", "volunteer as a STEM mentor", "internships in EdTech", "teach STEM online", "facilitator jobs", "remote teaching jobs", "NGO jobs in education", "science communication jobs"];
for (const w of WORK) {
  add(w, "work", "/stem-professionals", "transactional", 2);
  for (const r of REGIONS.slice(0, 28)) add(`${w} ${r}`, "work", "/stem-professionals", "transactional", 3);
}

// U. Subject deep-dives × intents
const SUBJECTS = ["organic chemistry", "inorganic chemistry", "physical chemistry", "algebra", "geometry", "calculus", "statistics", "mechanics", "electricity", "genetics", "ecology", "human biology"];
const SUBJECT_TEMPLATES = ["how to learn %s fast", "%s practice questions", "%s for beginners", "best way to study %s", "%s tutoring online", "%s study group", "%s past papers", "%s formulas", "%s made easy", "free %s lessons"];
for (const s of SUBJECTS) {
  for (const t of SUBJECT_TEMPLATES) add(t.replace("%s", s), "subject-deep-dive", "/digital-science-school", "informational", 3);
  for (const r of REGIONS.slice(0, 10)) add(`${s} lessons in ${r}`, "subject-deep-dive", "/digital-science-school", "transactional", 3);
}

// V. City-level local queries (Nigerian cities)
for (const c of NIGERIAN_CITIES) for (const t of TOPICS.slice(0, 18)) add(`${t} in ${c}`, "city-local", pageForTopic(t), "local", 3);

/* ------------------------------------------------------------- output */

const rows = [...matrix.values()].sort((a, b) => a.priority - b.priority || a.cluster.localeCompare(b.cluster) || a.keyword.localeCompare(b.keyword));
const priorityCounts = { 1: 0, 2: 0, 3: 0 };
const clusterCounts = {};
for (const r of rows) {
  priorityCounts[r.priority] = (priorityCounts[r.priority] ?? 0) + 1;
  clusterCounts[r.cluster] = (clusterCounts[r.cluster] ?? 0) + 1;
}

const csv = [
  "keyword,cluster,intent,target_page,priority",
  ...rows.map((r) => `"${r.keyword.replace(/"/g, '""')}",${r.cluster},${r.intent},${r.target_page},${r.priority}`),
].join("\n");

writeFileSync(join(outDir, "keyword-matrix.csv"), csv);
writeFileSync(
  join(outDir, "keyword-matrix-summary.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalKeywords: rows.length,
      byPriority: priorityCounts,
      byCluster: clusterCounts,
      implementationNote:
        "Priority 1 = implemented directly in titles, meta, schema and visible FAQ copy (src/content/seo.ts). Priority 2/3 = covered semantically by the mapped target pages; use as a content & PPC roadmap.",
    },
    null,
    2,
  ),
);

console.log(`Wrote ${rows.length} unique keywords to seo/keywords/keyword-matrix.csv`);
console.log("By priority:", priorityCounts);
console.log("By cluster:", clusterCounts);
