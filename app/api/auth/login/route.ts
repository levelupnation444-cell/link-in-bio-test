import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DASHBOARD_COOKIE,
  getExpectedDashboardToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!verifyPassword(password)) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url), 302);
  }

  const sessionToken = getExpectedDashboardToken();

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url), 302);
  }

  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url), 302);
}
