import { redirect } from "next/navigation";
import { DashboardEditor } from "@/components/dashboard-editor";
import { getLinks, hasBlobToken } from "@/lib/blob-links";
import { isDashboardAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authenticated = await isDashboardAuthenticated();

  if (!process.env.DASHBOARD_PASSWORD) {
    return (
      <main className="dashboard-shell flex items-center justify-center">
        <div className="dashboard-card p-8 text-center text-white">
          <p className="text-xl font-semibold">Missing `DASHBOARD_PASSWORD`.</p>
          <p className="mt-3 text-sm text-white/65">
            Set the environment variable before using `/dashboard`.
          </p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    redirect("/dashboard/login");
  }

  const data = await getLinks();

  return (
    <main className="dashboard-shell">
      <div className="dashboard-card p-6 sm:p-8">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8a6e2f]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Edit Level Up Nation links
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Updates write to `data/links.json` locally and to Vercel Blob when
              `BLOB_READ_WRITE_TOKEN` is configured.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/65">
            <span>{hasBlobToken() ? "Blob sync enabled" : "Local JSON fallback only"}</span>
            <form action="/api/auth/logout" method="post">
              <button className="dashboard-button secondary" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>

        <DashboardEditor initialData={data} />
      </div>
    </main>
  );
}
