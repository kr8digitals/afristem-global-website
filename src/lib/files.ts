/**
 * What a receipt really is.
 *
 * The browser's file type and the file extension can both lie, so the server
 * reads the first bytes of every upload and accepts only:
 *   JPEG  FF D8 FF
 *   PNG   89 50 4E 47 0D 0A 1A 0A
 *   WebP  "RIFF" .... "WEBP"
 *   PDF   "%PDF-"
 *
 * Shared by the receipt upload route and the browser (the browser check is a
 * courtesy; only this one counts).
 */

export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export type ReceiptMime = (typeof RECEIPT_TYPES)[number];

export const RECEIPT_EXTENSION: Record<ReceiptMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/** The real type of a file, from its first bytes. null = not an accepted receipt. */
export function detectReceiptType(buf: Buffer): ReceiptMime | null {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  return null;
}

/** Human label for an accepted type. */
export const RECEIPT_LABEL: Record<ReceiptMime, string> = {
  "image/jpeg": "JPG image",
  "image/png": "PNG image",
  "image/webp": "WebP image",
  "application/pdf": "PDF document",
};

/** A safe, original-looking file name for storage keys and the admin list. */
export function cleanFileName(name: string): string {
  const base = (name || "receipt").replace(/\\/g, "/").split("/").pop() ?? "receipt";
  const clean = base.replace(/[^\w.\- ()]+/g, "").trim().slice(0, 120);
  return clean || "receipt";
}
