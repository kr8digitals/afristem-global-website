// Writes src/generated/public-images.json: every image under public/images, for the
// admin media library. (On Vercel the public/ folder is served by the CDN and is not
// readable from server functions, so the list is built at build time.)
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public", "images");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const out = [];
function walk(dir, prefix) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, `${prefix}/${entry.name}`);
    else if (exts.has(path.extname(entry.name).toLowerCase())) out.push(`${prefix}/${entry.name}`);
  }
}
walk(root, "/images");
const target = path.join(process.cwd(), "src", "generated", "public-images.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
const json = `${JSON.stringify(out, null, 2)}\n`;
if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== json) fs.writeFileSync(target, json);
console.log(`[images] ${out.length} site images listed`);
