import { redirect } from "next/navigation";
import { isDashboardAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLoginPage() {
  if (await isDashboardAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="dashboard-shell flex items-center justify-center">
      <div className="dashboard-card w-full max-w-md p-8 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8a6e2f]">
          Protected Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Dashboard login</h1>
        <p className="mt-2 text-sm text-white/65">
          Enter `process.env.DASHBOARD_PASSWORD` to edit `links.json`.
        </p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <input
            className="dashboard-input"
            type="password"
            name="password"
            placeholder="Dashboard password"
            autoComplete="current-password"
            required
          />
          <button className="dashboard-button w-full" type="submit">
            Unlock dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
