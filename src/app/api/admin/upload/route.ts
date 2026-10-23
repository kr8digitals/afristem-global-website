import { NextResponse } from "next/server";
import crypto from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { addMediaFile, dbConfigured } from "@/lib/store";
import { uploadToStorage } from "@/lib/storage";
import { logDbError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Accepts an image, normalises it to a web-friendly JPEG, stores it in Supabase
 * Storage (bucket "media") and returns its public URL on this site.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!dbConfigured()) {
    return NextResponse.json({ ok: false, error: "Image uploads need the database and storage to be configured." }, { status: 503 });
  }
  const len = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(len) && len > MAX_BYTES + 512 * 1024) {
    return NextResponse.json({ ok: false, error: "Image must be under 12 MB" }, { status: 413 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "Only images can be uploaded" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Image must be under 12 MB" }, { status: 400 });

  let out: { data: Buffer; info: OutputInfo };
  try {
    out = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return NextResponse.json({ ok: false, error: "That file could not be processed as an image" }, { status: 400 });
  }

  const name = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}.jpg`;
  const url = `/api/media/${name}`;
  try {
    await uploadToStorage(name, out.data, "image/jpeg");
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ ok: false, error: "The image could not be stored. Please try again." }, { status: 502 });
  }
  try {
    await addMediaFile({
      id: `media-${name.replace(/\.jpg$/, "")}`,
      fileName: name,
      url,
      storage: "supabase",
      mimeType: "image/jpeg",
      sizeBytes: out.info.size,
      width: out.info.width,
      height: out.info.height,
      originalName: file.name,
    });
  } catch (error) {
    // the file is stored and usable; only the library listing misses it
    logDbError("upload (media_files)", error);
  }

  return NextResponse.json({ ok: true, url, bytes: out.info.size }, { headers: NO_STORE_HEADERS });
}
