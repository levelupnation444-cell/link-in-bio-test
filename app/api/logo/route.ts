import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/lib/auth";
import { getLinks, getLogoAsset, persistLinks, saveLogoAsset } from "@/lib/blob-links";

export const dynamic = "force-dynamic";

export async function GET() {
  const asset = await getLogoAsset();

  if (!asset) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(asset.stream, {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    await saveLogoAsset(buffer, file.type || "image/webp");

    const data = await getLinks();
    const saved = await persistLinks({
      ...data,
      logoUpdatedAt: new Date().toISOString(),
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to upload logo.",
      },
      { status: 500 },
    );
  }
}
