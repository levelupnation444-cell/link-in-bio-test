# Level Up Nation

Next.js 16 app that migrates `levelupnation.html` into the App Router and adds a protected `/dashboard` for editing links.

## Setup

Create `.env.local`:

```bash
DASHBOARD_PASSWORD=change-me
# Optional on Vercel Blob:
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

## Development

```bash
bun dev
```

Open `/` for the public page and `/dashboard` for the protected editor.

## Link Storage

- Local fallback: `data/links.json`
- Remote storage: private Vercel Blob object named `links.json`

If `BLOB_READ_WRITE_TOKEN` is present, saves go to both the local JSON file and Vercel Blob. If Blob is not configured, the app continues using only `data/links.json`.

## Logo Uploads

The dashboard can upload a logo image. It is compressed in the browser, stored as `uploaded-logo.webp`, and served through `/api/logo` so it still works with a private Blob store.
