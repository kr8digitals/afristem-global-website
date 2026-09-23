import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "uploads");

/** Accepts an image, normalises it to a web-friendly JPEG, returns its public URL. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "Only images can be uploaded" }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Image must be under 12 MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}.jpg`;
  const target = path.join(UPLOAD_DIR, name);

  try {
    await sharp(buffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(target);
  } catch {
    return NextResponse.json({ ok: false, error: "That file could not be processed as an image" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: `/api/media/${name}`, bytes: fs.statSync(target).size });
}
