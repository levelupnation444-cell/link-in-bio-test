import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, get, put } from "@vercel/blob";
import { defaultLinkData } from "./default-links";
import type { LinkData } from "./types";

const localFilePath = path.join(process.cwd(), "data", "links.json");
const localLogoPath = path.join(process.cwd(), "public", "uploaded-logo.webp");
const blobPath = "links.json";
const logoBlobPath = "uploaded-logo.webp";

async function ensureLocalFile() {
  await mkdir(path.dirname(localFilePath), { recursive: true });

  try {
    await readFile(localFilePath, "utf8");
  } catch {
    await writeFile(localFilePath, JSON.stringify(defaultLinkData, null, 2));
  }
}

function normalizeLinkData(input: Partial<LinkData> | null | undefined): LinkData {
  return {
    profileName: input?.profileName ?? defaultLinkData.profileName,
    bioHtml: input?.bioHtml ?? defaultLinkData.bioHtml,
    sectionLabel: input?.sectionLabel ?? defaultLinkData.sectionLabel,
    footerVerse: input?.footerVerse ?? defaultLinkData.footerVerse,
    logoUpdatedAt: input?.logoUpdatedAt ?? defaultLinkData.logoUpdatedAt,
    theme: {
      background: input?.theme?.background ?? defaultLinkData.theme.background,
      backgroundSecondary:
        input?.theme?.backgroundSecondary ??
        defaultLinkData.theme.backgroundSecondary,
      foreground: input?.theme?.foreground ?? defaultLinkData.theme.foreground,
      foregroundDim:
        input?.theme?.foregroundDim ?? defaultLinkData.theme.foregroundDim,
      accent: input?.theme?.accent ?? defaultLinkData.theme.accent,
      accentLight:
        input?.theme?.accentLight ?? defaultLinkData.theme.accentLight,
      accentDark: input?.theme?.accentDark ?? defaultLinkData.theme.accentDark,
    },
    socials:
      input?.socials?.length
        ? input.socials.map((social, index) => ({
            id: social.id || `social-${index + 1}`,
            label: social.label ?? "",
            href: social.href ?? "#",
            icon: social.icon ?? "link",
          }))
        : defaultLinkData.socials,
    links:
      input?.links?.length
        ? input.links.map((link, index) => ({
            id: link.id || `link-${index + 1}`,
            title: link.title ?? "",
            subtitle: link.subtitle ?? "",
            href: link.href ?? "#",
            icon: link.icon ?? "🔗",
            featured: Boolean(link.featured),
            badge: link.badge ?? "",
          }))
        : defaultLinkData.links,
  };
}

async function readLocalLinks() {
  await ensureLocalFile();
  const raw = await readFile(localFilePath, "utf8");
  const trimmed = raw.trim();

  if (!trimmed) {
    await writeLocalLinks(defaultLinkData);
    return defaultLinkData;
  }

  try {
    return normalizeLinkData(JSON.parse(trimmed) as LinkData);
  } catch {
    await writeLocalLinks(defaultLinkData);
    return defaultLinkData;
  }
}

async function writeLocalLinks(data: LinkData) {
  await ensureLocalFile();
  await writeFile(localFilePath, JSON.stringify(data, null, 2));
}

async function writeLocalLinksIfPossible(data: LinkData) {
  if (process.env.VERCEL) {
    return;
  }

  await writeLocalLinks(data);
}

export function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function getLogoAsset() {
  if (hasBlobToken()) {
    const blob = await get(logoBlobPath, {
      access: "private",
      useCache: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob || !blob.stream) {
      return null;
    }

    return {
      stream: blob.stream,
      contentType: blob.blob.contentType || "image/webp",
    };
  }

  try {
    const buffer = await readFile(localLogoPath);
    return {
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        },
      }),
      contentType: "image/webp",
    };
  } catch {
    return null;
  }
}

export async function saveLogoAsset(data: ArrayBuffer, contentType: string) {
  const buffer = Buffer.from(data);

  if (!hasBlobToken() && process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for logo uploads on Vercel.",
    );
  }

  if (!process.env.VERCEL) {
    await mkdir(path.dirname(localLogoPath), { recursive: true });
    await writeFile(localLogoPath, buffer);
  }

  if (hasBlobToken()) {
    await put(logoBlobPath, buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  }
}

export async function getLinks() {
  if (!hasBlobToken()) {
    return readLocalLinks();
  }

  try {
    const blob = await get(blobPath, {
      access: "private",
      useCache: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob || !blob.stream) {
      throw new BlobNotFoundError();
    }

    const raw = await new Response(blob.stream).text();
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new Error("Blob content is empty.");
    }

    return normalizeLinkData(JSON.parse(trimmed) as LinkData);
  } catch (error) {
    const local = await readLocalLinks();

    if (error instanceof BlobNotFoundError) {
      await put(blobPath, JSON.stringify(local, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    return local;
  }
}

export async function persistLinks(data: LinkData) {
  const normalized = normalizeLinkData(data);

  if (!hasBlobToken() && process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required for dashboard writes on Vercel.",
    );
  }

  await writeLocalLinksIfPossible(normalized);

  if (hasBlobToken()) {
    await put(blobPath, JSON.stringify(normalized, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  }

  return normalized;
}
