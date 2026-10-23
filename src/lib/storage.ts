/**
 * Uploaded images live in the Supabase Storage bucket "media" (public read).
 * The website keeps serving them at /api/media/<file> (see
 * src/app/api/media/[...path]/route.ts), so content never depends on the
 * storage provider's URL.
 */
import "server-only";
import { db, storageBaseUrl } from "@/lib/db";

export const MEDIA_BUCKET = "media";

/** Upload file names the site generates: <time>-<random>.jpg */
export const SAFE_MEDIA_NAME = /^[a-z0-9][a-z0-9._-]{0,200}\.(jpe?g|png|webp|avif|gif)$/i;

export async function uploadToStorage(name: string, body: Buffer, contentType: string): Promise<void> {
  const { error } = await db()
    .storage.from(MEDIA_BUCKET)
    .upload(name, body, { contentType, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

/** Public URL of a stored file (the bucket is public). */
export function storagePublicUrl(name: string): string {
  return `${storageBaseUrl()}/object/public/${MEDIA_BUCKET}/${encodeURIComponent(name)}`;
}
