import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/lib/auth";
import { getLinks, persistLinks } from "@/lib/blob-links";
import type { LinkData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getLinks();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as LinkData;
  const saved = await persistLinks(body);
  return NextResponse.json(saved);
}
