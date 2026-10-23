import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { dbConfigured } from "@/lib/store";
import { SAFE_MEDIA_NAME, storagePublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Older single-server installs kept uploads on disk; they are still served if present. */
const LEGACY_UPLOADS = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

const HEADERS = {
  // uploads never change (each upload gets a new random name), so cache them everywhere for a year
  "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  "Access-Control-Allow-Origin": "*",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
};

/** Serves an uploaded image from Supabase Storage at a stable URL on this site. */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  // uploads are stored flat: exactly one safe file name, nothing else
  const name = (parts ?? []).length === 1 ? parts[0] : "";
  if (!name || !SAFE_MEDIA_NAME.test(name)) return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
  const ext = path.extname(name).toLowerCase();

  const legacy = path.join(LEGACY_UPLOADS, name);
  if (path.dirname(legacy) === LEGACY_UPLOADS && fs.existsSync(legacy) && fs.statSync(legacy).isFile()) {
    const body = fs.readFileSync(legacy);
    return new NextResponse(new Uint8Array(body), { headers: { ...HEADERS, "Content-Type": TYPES[ext] ?? "application/octet-stream" } });
  }

  if (!dbConfigured()) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const upstream = await fetch(storagePublicUrl(name), { cache: "no-store", signal: AbortSignal.timeout(15_000) }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) {
    const status = upstream && (upstream.status === 404 || upstream.status === 400) ? 404 : 502;
    return NextResponse.json({ ok: false, error: status === 404 ? "Not found" : "Storage unavailable" }, { status, headers: { "Cache-Control": "no-store" } });
  }
  return new NextResponse(upstream.body, {
    headers: {
      ...HEADERS,
      "Content-Type": TYPES[ext] ?? upstream.headers.get("content-type") ?? "application/octet-stream",
      ...(upstream.headers.get("content-length") ? { "Content-Length": upstream.headers.get("content-length") as string } : {}),
    },
  });
}
