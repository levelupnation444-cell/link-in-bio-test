"use client";

import { useRef, useState, useTransition } from "react";
import type { LinkData, MainLink, SocialLink } from "@/lib/types";

type Props = {
  initialData: LinkData;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || crypto.randomUUID().slice(0, 8);
}

function newSocial(): SocialLink {
  return {
    id: crypto.randomUUID(),
    label: "New social",
    href: "#",
    icon: "link",
  };
}

function newLink(): MainLink {
  return {
    id: crypto.randomUUID(),
    title: "New link",
    subtitle: "Add a subtitle",
    href: "#",
    icon: "🔗",
    featured: false,
    badge: "",
  };
}

export function DashboardEditor({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [message, setMessage] = useState<string>("");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setMessage(payload?.error || "Save failed. Check dashboard auth and blob configuration.");
        return;
      }

      const next = (await response.json()) as LinkData;
      setData(next);
      setMessage("Saved.");
    });
  };

  const updateTopLevel = (
    field: "profileName" | "sectionLabel" | "bioHtml" | "footerVerse",
    value: string,
  ) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const updateTheme = (field: keyof LinkData["theme"], value: string) => {
    setData((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [field]: value,
      },
    }));
  };

  const updateSocial = (
    index: number,
    field: keyof SocialLink,
    value: string,
  ) => {
    setData((current) => ({
      ...current,
      socials: current.socials.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === "id") {
          return { ...item, id: slugify(value) };
        }

        return { ...item, [field]: value };
      }),
    }));
  };

  const removeSocial = (index: number) => {
    setData((current) => ({
      ...current,
      socials: current.socials.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addSocial = () => {
    setData((current) => ({
      ...current,
      socials: [...current.socials, newSocial()],
    }));
  };

  const updateLink = (
    index: number,
    field: keyof MainLink,
    value: string | boolean,
  ) => {
    setData((current) => ({
      ...current,
      links: current.links.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === "id" && typeof value === "string") {
          return { ...item, id: slugify(value) };
        }

        return { ...item, [field]: value };
      }),
    }));
  };

  const removeLink = (index: number) => {
    setData((current) => ({
      ...current,
      links: current.links.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addLink = () => {
    setData((current) => ({
      ...current,
      links: [...current.links, newLink()],
    }));
  };

  const compressImage = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const maxSize = 720;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });

    bitmap.close();

    if (!blob) {
      throw new Error("Unable to compress image.");
    }

    return new File([blob], "uploaded-logo.webp", { type: "image/webp" });
  };

  const uploadLogo = async (file: File) => {
    setUploadMessage("");
    setIsUploading(true);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const response = await fetch("/api/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Logo upload failed.");
      }

      const next = (await response.json()) as LinkData;
      setData(next);
      setUploadMessage("Logo uploaded.");
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Logo upload failed.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
              onChange={(event) => updateTopLevel("profileName", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Section label
            <input
              className="dashboard-input"
              value={data.sectionLabel}
              onChange={(event) => updateTopLevel("sectionLabel", event.target.value)}
            />
          </label>
        </div>
        <label className="dashboard-grid gap-2 text-sm text-white/72">
          Bio HTML
          <textarea
            className="dashboard-textarea"
            value={data.bioHtml}
            onChange={(event) => updateTopLevel("bioHtml", event.target.value)}
          />
        </label>
        <label className="dashboard-grid gap-2 text-sm text-white/72">
          Footer verse
          <textarea
            className="dashboard-textarea"
            value={data.footerVerse}
            onChange={(event) => updateTopLevel("footerVerse", event.target.value)}
          />
        </label>
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Logo</h2>
          <p className="text-sm text-white/55">
            Uploads are compressed in the browser and stored in Blob.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="lun-logo-fallback shrink-0 overflow-hidden">
            {data.logoUpdatedAt ? (
              <img
                className="lun-logo-img"
                src={`/api/logo?v=${encodeURIComponent(data.logoUpdatedAt)}`}
                alt="Current logo"
              />
            ) : (
              "LN"
            )}
          </div>
          <div className="dashboard-grid flex-1 gap-3">
            <input
              ref={fileInputRef}
              className="dashboard-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadLogo(file);
                }
              }}
            />
            <p className="text-sm text-white/65">
              Best results: square image, at least 400x400.
            </p>
            <p className="text-sm text-white/65">
              {uploadMessage || (isUploading ? "Uploading..." : "No new upload yet.")}
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Theme</h2>
          <p className="text-sm text-white/55">Hex colors work best. `rgba(...)` also works.</p>
        </div>
        <div className="dashboard-form-grid">
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Background
            <input
              className="dashboard-input"
              value={data.theme.background}
              onChange={(event) => updateTheme("background", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Background secondary
            <input
              className="dashboard-input"
              value={data.theme.backgroundSecondary}
              onChange={(event) => updateTheme("backgroundSecondary", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Foreground
            <input
              className="dashboard-input"
              value={data.theme.foreground}
              onChange={(event) => updateTheme("foreground", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Foreground dim
            <input
              className="dashboard-input"
              value={data.theme.foregroundDim}
              onChange={(event) => updateTheme("foregroundDim", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Accent
            <input
              className="dashboard-input"
              value={data.theme.accent}
              onChange={(event) => updateTheme("accent", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Accent light
            <input
              className="dashboard-input"
              value={data.theme.accentLight}
              onChange={(event) => updateTheme("accentLight", event.target.value)}
            />
          </label>
          <label className="dashboard-grid gap-2 text-sm text-white/72">
            Accent dark
            <input
              className="dashboard-input"
              value={data.theme.accentDark}
              onChange={(event) => updateTheme("accentDark", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Social links</h2>
          <button className="dashboard-button secondary" type="button" onClick={addSocial}>
            Add social
          </button>
        </div>
        {data.socials.map((social, index) => (
          <div key={social.id} className="dashboard-grid rounded-xl border border-white/8 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">{social.label || `Social ${index + 1}`}</p>
              <button
                className="dashboard-button secondary"
                type="button"
                onClick={() => removeSocial(index)}
              >
                Remove
              </button>
            </div>
            <div className="dashboard-form-grid">
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                ID
                <input
                  className="dashboard-input"
                  value={social.id}
                  onChange={(event) => updateSocial(index, "id", event.target.value)}
                />
              </label>
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Label
                <input
                  className="dashboard-input"
                  value={social.label}
                  onChange={(event) => updateSocial(index, "label", event.target.value)}
                />
              </label>
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Icon
                <input
                  className="dashboard-input"
                  value={social.icon}
                  onChange={(event) => updateSocial(index, "icon", event.target.value)}
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
          </div>
        ))}
      </section>

      <section className="dashboard-grid rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Primary links</h2>
          <button className="dashboard-button secondary" type="button" onClick={addLink}>
            Add link
          </button>
        </div>
        {data.links.map((link, index) => (
          <div key={link.id} className="dashboard-grid rounded-xl border border-white/8 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-white">{link.title || `Link ${index + 1}`}</p>
              <button
                className="dashboard-button secondary"
                type="button"
                onClick={() => removeLink(index)}
              >
                Remove
              </button>
            </div>
            <div className="dashboard-form-grid">
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                ID
                <input
                  className="dashboard-input"
                  value={link.id}
                  onChange={(event) => updateLink(index, "id", event.target.value)}
                />
              </label>
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
              <label className="dashboard-grid gap-2 text-sm text-white/72">
                Badge
                <input
                  className="dashboard-input"
                  value={link.badge ?? ""}
                  onChange={(event) => updateLink(index, "badge", event.target.value)}
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
            <label className="flex items-center gap-3 text-sm text-white/72">
              <input
                type="checkbox"
                checked={Boolean(link.featured)}
                onChange={(event) => updateLink(index, "featured", event.target.checked)}
              />
              Featured link
            </label>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/65">
          {message || "You can now add, remove, and restyle the full link-in-bio from here."}
        </p>
        <button className="dashboard-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
