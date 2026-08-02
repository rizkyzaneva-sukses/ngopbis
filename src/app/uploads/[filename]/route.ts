import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadDir } from "@/lib/uploads";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // Uploaded names are generated server-side. Reject path traversal defensively.
  if (!filename || path.basename(filename) !== filename) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(path.join(getUploadDir(), filename));
    const extension = path.extname(filename).toLowerCase();

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[extension] || "application/octet-stream",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
