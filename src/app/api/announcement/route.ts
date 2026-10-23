import { NextResponse } from "next/server";
import { getContent, visibleAnnouncement } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const announcement = visibleAnnouncement((await getContent()).announcement);
  return NextResponse.json(
    { announcement },
    { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } },
  );
}
