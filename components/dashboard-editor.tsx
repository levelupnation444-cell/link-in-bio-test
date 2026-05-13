"use client";

import { useState, useTransition } from "react";
import type { LinkData } from "@/lib/types";

type Props = {
  initialData: LinkData;
};

export function DashboardEditor({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const updateSocial = (index: number, field: "label" | "href", value: string) => {
    setData((current) => ({
      ...current,
      socials: current.socials.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateLink = (
    index: number,
    field: "title" | "subtitle" | "href" | "icon" | "badge",
    value: string,
  ) => {
    setData((current) => ({
      ...current,
      links: current.links.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const save = () => {
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setMessage("Save failed. Check dashboard auth and blob configuration.");
        return;
      }

      const next = (await response.json()) as LinkData;
      setData(next);
      setMessage("Saved.");
    });
  };

  return (
    <div className="dashboard-grid pt-6">
      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <h2 className="text-xl font-semibold text-white">Page content</h2>
        <div className="dashboard-form-grid">
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Profile name
            <input
              className="dashboard-input"
              value={data.profileName}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  profileName: event.target.value,
                }))
              }
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Section label
            <input
              className="dashboard-input"
              value={data.sectionLabel}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  sectionLabel: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <label className="dashboard-grid gap-2 text-sm text-white/72">
          Bio HTML
          <textarea
            className="dashboard-textarea"
            value={data.bioHtml}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                bioHtml: event.target.value,
              }))
            }
          />
        </label>
        <label className="dashboard-grid gap-2 text-sm text-white/72">
          Footer verse
          <textarea
            className="dashboard-textarea"
            value={data.footerVerse}
            onChange={(event) =>
              setData((current) => ({
                ...current,
                footerVerse: event.target.value,
              }))
            }
          />
        </label>
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <h2 className="text-xl font-semibold text-white">Social links</h2>
        {data.socials.map((social, index) => (
          <div key={social.id} className="dashboard-form-grid rounded-xl border border-white/8 p-4">
            <label className="dashboard-grid gap-2 text-sm text-white/72">
              Label
              <input
                className="dashboard-input"
                value={social.label}
                onChange={(event) => updateSocial(index, "label", event.target.value)}
              />
            </label>
            <label className="dashboard-grid gap-2 text-sm text-white/72">
              URL
              <input
                className="dashboard-input"
                value={social.href}
                onChange={(event) => updateSocial(index, "href", event.target.value)}
              />
            </label>
          </div>
        ))}
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <h2 className="text-xl font-semibold text-white">Primary links</h2>
        {data.links.map((link, index) => (
          <div key={link.id} className="dashboard-grid rounded-xl border border-white/8 p-4">
            <div className="dashboard-form-grid">
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Title
                <input
                  className="dashboard-input"
                  value={link.title}
                  onChange={(event) => updateLink(index, "title", event.target.value)}
                />
              </label>
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Icon
                <input
                  className="dashboard-input"
                  value={link.icon}
                  onChange={(event) => updateLink(index, "icon", event.target.value)}
                />
              </label>
            </div>
            <label className="dashboard-grid gap-2 text-sm text-white/72">
              Subtitle
              <input
                className="dashboard-input"
                value={link.subtitle}
                onChange={(event) => updateLink(index, "subtitle", event.target.value)}
              />
            </label>
            <label className="dashboard-grid gap-2 text-sm text-white/72">
              URL
              <input
                className="dashboard-input"
                value={link.href}
                onChange={(event) => updateLink(index, "href", event.target.value)}
              />
            </label>
            {link.featured ? (
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Featured badge
                <input
                  className="dashboard-input"
                  value={link.badge ?? ""}
                  onChange={(event) => updateLink(index, "badge", event.target.value)}
                />
              </label>
            ) : null}
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/65">{message || "Changes save directly to the active link store."}</p>
        <button className="dashboard-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
