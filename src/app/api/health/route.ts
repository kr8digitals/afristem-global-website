import { NextResponse } from "next/server";
import { dbHealth } from "@/lib/store";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * Uptime / configuration check. Reveals no data and no secrets — only whether
 * the database answers and whether email delivery is switched on.
 */
export async function GET() {
  const db = await dbHealth();
  const body = {
    ok: db.ok,
    database: db.ok ? "ok" : db.error === "not-configured" ? "not-configured" : "unreachable",
    tables: db.tables ?? 0,
    email: mailConfigured() ? "configured" : "not-configured",
    time: new Date().toISOString(),
  };
  return NextResponse.json(body, { status: db.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
