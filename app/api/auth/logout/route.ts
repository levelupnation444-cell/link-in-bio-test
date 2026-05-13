import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DASHBOARD_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(DASHBOARD_COOKIE);

  return NextResponse.redirect(new URL("/dashboard/login", request.url), 302);
}
