import { NextResponse } from "next/server";
import { content } from "@/lib/content";
import { eventState } from "@/lib/events";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = content().events.find((e) => e.slug === slug);
  return NextResponse.json(event ? { event, state: eventState(event) } : { error: "Event not found" }, { status: event ? 200 : 404, headers: { "Cache-Control": "no-store" } });
}
