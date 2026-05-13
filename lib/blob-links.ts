import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { defaultLinkData } from "./default-links";
import type { LinkData } from "./types";

const localFilePath = path.join(process.cwd(), "data", "links.json");
const blobPath = "links.json";

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
    socials: input?.socials ?? defaultLinkData.socials,
    links: input?.links ?? defaultLinkData.links,
  };
}

async function readLocalLinks() {
  await ensureLocalFile();
  const raw = await readFile(localFilePath, "utf8");
  return normalizeLinkData(JSON.parse(raw) as LinkData);
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

export async function getLinks() {
  if (!hasBlobToken()) {
    return readLocalLinks();
  }

  try {
    const blob = await head(blobPath, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const response = await fetch(blob.url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Blob read failed with ${response.status}`);
    }

    const json = (await response.json()) as LinkData;
    return normalizeLinkData(json);
  } catch (error) {
    const local = await readLocalLinks();

    if (error instanceof BlobNotFoundError) {
      await put(blobPath, JSON.stringify(local, null, 2), {
        access: "public",
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
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  }

  return normalized;
}
