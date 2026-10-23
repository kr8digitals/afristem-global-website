import { NextResponse } from "next/server";
import { logDbError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";
import { getReceipt } from "@/lib/store";
import { receiptSignedUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/receipt?id=<history id> — opens one receipt for an admin.
 *
 * The bucket is private, so this redirects to a signed URL that expires in two
 * minutes. The path is read from the database by history id (never from the
 * query string), so an admin can only ever see files the database knows about.
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = Number(new URL(req.url).searchParams.get("id") ?? "");
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Unknown receipt" }, { status: 400, headers: NO_STORE_HEADERS });
  }

  try {
    const record = await getReceipt(id);
    if (!record || record.kind !== "receipt" || !record.filePath) {
      return NextResponse.json({ ok: false, error: "Receipt not found" }, { status: 404, headers: NO_STORE_HEADERS });
    }
    const url = await receiptSignedUrl(record.filePath, 120);
    if (!url) {
      return NextResponse.json({ ok: false, error: "The receipt could not be opened. Try again." }, { status: 502, headers: NO_STORE_HEADERS });
    }
    return NextResponse.redirect(url, { status: 302, headers: NO_STORE_HEADERS });
  } catch (error) {
    logDbError("admin receipt", error);
    return NextResponse.json({ ok: false, error: "The receipt could not be opened." }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
