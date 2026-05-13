import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DASHBOARD_COOKIE = "dashboard_session";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedDashboardToken() {
  const password = process.env.DASHBOARD_PASSWORD;

  if (!password) {
    return null;
  }

  return hashValue(password);
}

export function verifyPassword(password: string) {
  const expected = getExpectedDashboardToken();

  if (!expected) {
    return false;
  }

  const incoming = hashValue(password);
  return timingSafeEqual(Buffer.from(incoming), Buffer.from(expected));
}

export async function isDashboardAuthenticated() {
  const expected = getExpectedDashboardToken();

  if (!expected) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(DASHBOARD_COOKIE)?.value;

  if (!session) {
    return false;
  }

  return timingSafeEqual(Buffer.from(session), Buffer.from(expected));
}
