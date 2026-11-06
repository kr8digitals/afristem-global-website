import { NextResponse } from "next/server";

/**
 * TEMPORARY setup helper for the Resend domain. Removed after verification.
 * Reads the key from the environment; never returns it.
 */
export const dynamic = "force-dynamic";

const SETUP_TOKEN = "8b6369a69385252b651c508da296a276271f3d266b5a9854";

function authorised(req: Request): boolean {
  return new URL(req.url).searchParams.get("token") === SETUP_TOKEN;
}

async function callResend(path: string, init?: RequestInit) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { status: 500, body: { error: "RESEND_API_KEY is not set" } };
  try {
    const res = await fetch(`https://api.resend.com${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* keep text */
    }
    return { status: res.status, body };
  } catch (error) {
    return { status: 502, body: { error: String(error) } };
  }
}

export async function GET(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const create = new URL(req.url).searchParams.get("create");
  if (create) {
    const result = await callResend("/domains", {
      method: "POST",
      body: JSON.stringify({ name: create }),
    });
    return NextResponse.json(result.body, { status: result.status });
  }
  const result = await callResend("/domains");
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as
    | { action?: string; id?: string; name?: string }
    | null;
  const action = body?.action;
  const id = body?.id;
  if (action === "verify" && id) {
    const result = await callResend(`/domains/${id}/verify`, { method: "POST" });
    return NextResponse.json(result.body, { status: result.status });
  }
  if (action === "create" && body?.name) {
    const result = await callResend("/domains", {
      method: "POST",
      body: JSON.stringify({ name: body.name }),
    });
    return NextResponse.json(result.body, { status: result.status });
  }
  if (action === "delete" && id) {
    const result = await callResend(`/domains/${id}`, { method: "DELETE" });
    return NextResponse.json(result.body, { status: result.status });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
