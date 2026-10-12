import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const UPLOAD_ROOT = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/**
 * Resolves a request path inside the uploads directory, or null if it escapes.
 *
 * The naive `startsWith` check is not enough: "/data/uploads-evil/x" also starts
 * with "/data/uploads". Comparing the *relative* path is exact, and it rejects
 * absolute paths, "..", and sibling directories whose name shares the prefix.
 */
function safeJoin(parts: string[]): string | null {
  const rel = (parts ?? []).filter((p) => p && p !== "." && p !== "..").join("/");
  if (!rel || rel.includes("\0")) return null;
  const resolved = path.resolve(UPLOAD_ROOT, rel);
  const relative = path.relative(UPLOAD_ROOT, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  const segments = relative.split(path.sep);
  if (segments.some((s) => s === ".." || s.startsWith("."))) return null;
  return resolved;
}

/** Serves admin-uploaded media (stored outside the build output, so it survives redeploys). */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const resolved = safeJoin(parts ?? []);
  if (!resolved) return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });

  let stat: fs.Stats;
  try {
    stat = fs.statSync(resolved);
  } catch {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (!stat.isFile()) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const ext = path.extname(resolved).toLowerCase();
  const body = fs.readFileSync(resolved);
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      // Uploaded SVG could otherwise run script if opened directly.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
