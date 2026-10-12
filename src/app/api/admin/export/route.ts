import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { requireAdmin } from "@/lib/security";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v: unknown) => {
    const raw = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    const s = /^[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "contact";
  const format = url.searchParams.get("format") ?? "csv";
  const store = readStore();
  const map = {
    contact: store.submissions.contact,
    register: url.searchParams.has("event") ? store.submissions.register.filter((r) => r.event === url.searchParams.get("event")) : store.submissions.register,
    newsletter: store.submissions.newsletter,
    all: store,
  } as Record<string, unknown>;

  const data = map[type];
  if (data === undefined) return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });

  if (format === "json" || type === "all") {
    return new NextResponse(JSON.stringify(type === "all" ? store : data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="afristem-${type}-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  const csv = toCsv(data as Record<string, unknown>[]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="afristem-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
