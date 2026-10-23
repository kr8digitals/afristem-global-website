import { NextResponse } from "next/server";
import { dbConfigured, listMediaFiles } from "@/lib/store";
import { logDbError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";
import siteImages from "@/generated/public-images.json";

export const dynamic = "force-dynamic";

/** Lists every image available to the admin: uploads (newest first), then the site's built-in images. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  let uploads: { url: string; name: string }[] = [];
  if (dbConfigured()) {
    try {
      uploads = (await listMediaFiles()).map((f) => ({ url: f.url, name: f.name }));
    } catch (error) {
      logDbError("media list", error);
    }
  }
  const assets = (siteImages as string[]).map((url) => ({ url, name: url.split("/").pop() ?? url }));
  return NextResponse.json({ ok: true, files: [...uploads, ...assets] }, { headers: NO_STORE_HEADERS });
}
