/** Reproducible query ideation, NOT measured search volume or ranking evidence. */
import fs from 'node:fs';
const topics = [
  ['STEM education', '/services', 'STEM education and training'],
  ['STEM competitions', '/programmes', 'Competition overview'],
  ['STEM Kids Championship', '/programmes/stem-kids-championship', 'SKC'],
  ['STEM Kids Championship 2026', '/events/stem-kids-championship-2026', 'SKC current edition'],
  ['African Organic Chemistry Tournament', '/programmes/african-organic-chemistry-tournament', 'AOCT'],
  ['AOCT 2026', '/events/african-organic-chemistry-tournament-2026', 'AOCT current edition'],
  ['science spelling bee', '/programmes/scispell', 'SciSPELL'],
  ['SciSPELL', '/programmes/scispell', 'SciSPELL branded'],
  ['Code Africa', '/programmes/code-africa', 'Code Africa'],
  ['coding competitions', '/programmes/code-africa', 'Coding'],
  ['school STEM clubs', '/schools', 'School enrichment'],
  ['STEM boot camps', '/events', 'Boot camps'],
  ['STEM workshops', '/services', 'Workshops'],
  ['teacher STEM training', '/educators', 'Teacher development'],
  ['science teacher development', '/educators', 'Science educators'],
  ['STEM mentoring', '/stem-professionals', 'Mentoring'],
  ['school science laboratory equipment', '/services', 'Equipment support'],
  ['robotics learning kits', '/services', 'STEM educational products'],
  ['STEM education consultancy', '/services', 'Consultancy'],
  ['school STEM partnerships', '/partners', 'Partnerships'],
  ['Annual National Science Championship', '/prime-stem-nigeria', 'ANSC'],
  ['Prime STEM Nigeria', '/prime-stem-nigeria', 'Prime STEM'],
  ['AFRISTEM Digital Science School', '/digital-science-school', 'Digital school'],
  ['online science learning', '/digital-science-school', 'Online learning'],
  ['school STEM planning', '/stem-guide-for-schools', 'School STEM guide'],
];
const contexts = ['in Nigeria', 'in Africa', 'for Nigerian schools', 'for African schools', 'for public schools', 'for private schools', 'for school administrators', 'for school coordinators', 'for teachers', 'for educators', 'for parents', 'for families', 'for students', 'for school communities', 'for education partners', 'in Abuja', 'in Lagos', 'in Abakaliki', 'in Nigeria in 2026', 'in Africa in 2026'];
const templates = [
  ['{topic} {context}', 'discovery'],
  ['{topic} information {context}', 'informational'],
  ['how to find {topic} {context}', 'discovery'],
  ['where to find {topic} {context}', 'discovery'],
  ['{topic} requirements {context}', 'eligibility'],
  ['{topic} costs {context}', 'cost enquiry'],
  ['how to get started with {topic} {context}', 'participation'],
  ['{topic} enquiries {context}', 'contact'],
  ['{topic} guidance {context}', 'informational'],
  ['{topic} support {context}', 'support'],
  ['{topic} resources {context}', 'resources'],
  ['{topic} opportunities {context}', 'discovery'],
  ['learn about {topic} {context}', 'informational'],
  ['{topic} benefits {context}', 'evaluation'],
  ['{topic} frequently asked questions {context}', 'informational'],
  ['{topic} contact details {context}', 'contact'],
  ['{topic} latest updates {context}', 'updates'],
  ['{topic} official information {context}', 'navigational'],
  ['how to prepare for {topic} {context}', 'preparation'],
  ['{topic} step by step guide {context}', 'informational'],
];
const rows = topics.flatMap(([topic, target, cluster]) => templates.flatMap(([template, intent]) => contexts.map(context => ({ query: template.replace('{topic}', topic).replace('{context}', context).toLowerCase(), cluster, intent, target, evidence: 'generated candidate; no measured volume', review: 'validate demand, eligibility and local availability before using in copy' }))));
if (rows.length !== 10000 || new Set(rows.map(r => r.query)).size !== 10000) throw new Error('Expected exactly 10,000 unique query candidates');
const columns = ['query', 'cluster', 'intent', 'target', 'evidence', 'review'];
const csv = [columns.join(','), ...rows.map(row => columns.map(key => `"${row[key].replaceAll('"', '""')}"`).join(','))].join('\n') + '\n';
fs.mkdirSync('docs/seo', { recursive: true });
fs.writeFileSync('docs/seo/keyword-research-10000.csv', csv);
fs.writeFileSync('docs/seo/topic-map.md', '# Search topic map\n\nThese are content-grounded seed topics; each has 400 generated query candidates in the CSV.\nThe public pages address the underlying topic, not every generated wording.\n\n| Topic | Preferred page | Cluster |\n|---|---|---|\n' + topics.map(([t,u,c]) => `| ${t} | ${u} | ${c} |`).join('\n') + '\n');
console.log(`Wrote ${rows.length} unique query candidates across ${topics.length} topic clusters.`);
