import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");
const UPLOADS = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

function walk(dir: string, prefix: string, out: { url: string; name: string }[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, `${prefix}/${entry.name}`, out);
    else if (EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push({ url: `${prefix}/${entry.name}`, name: entry.name });
    }
  }
}

/** Lists every image available to the admin (site assets + uploads). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const files: { url: string; name: string }[] = [];
  walk(PUBLIC_IMAGES, "/images", files);
  walk(UPLOADS, "/api/media", files);
  // uploads first (newest names sort naturally), then site assets alphabetically
  const uploads = files.filter((f) => f.url.startsWith("/api/media")).reverse();
  const assets = files.filter((f) => f.url.startsWith("/images")).sort((a, b) => a.url.localeCompare(b.url));
  return NextResponse.json({ ok: true, files: [...uploads, ...assets] });
}
