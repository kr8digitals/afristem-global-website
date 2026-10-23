import { NextResponse } from "next/server";
import { exportEverything, getSubmissions } from "@/lib/store";
import { logDbError, publicError } from "@/lib/db";
import { NO_STORE_HEADERS, requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    // neutralise spreadsheet formulas (CSV injection) and quote when needed
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "contact";
  const format = url.searchParams.get("format") ?? "csv";
  const stamp = new Date().toISOString().slice(0, 10);

  try {
    if (type === "all") {
      // complete backup (includes the admin password hash — admin only)
      const all = await exportEverything();
      return new NextResponse(JSON.stringify(all, null, 2), {
        headers: {
          ...NO_STORE_HEADERS,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="afristem-all-${stamp}.json"`,
        },
      });
    }
    if (type !== "contact" && type !== "register" && type !== "newsletter") {
      return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
    }
    const rows = (await getSubmissions())[type] as unknown as Record<string, unknown>[];
    if (format === "json") {
      return new NextResponse(JSON.stringify(rows, null, 2), {
        headers: {
          ...NO_STORE_HEADERS,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="afristem-${type}-${stamp}.json"`,
        },
      });
    }
    return new NextResponse(`\uFEFF${toCsv(rows)}`, {
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="afristem-${type}-${stamp}.csv"`,
      },
    });
  } catch (error) {
    logDbError("export", error);
    return NextResponse.json({ ok: false, error: publicError(error) }, { status: 500 });
  }
}
