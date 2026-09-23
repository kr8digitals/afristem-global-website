import { NextResponse } from "next/server";
import { getAnnouncement } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const announcement = getAnnouncement();
  return NextResponse.json(
    { announcement },
    { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } },
  );
}
