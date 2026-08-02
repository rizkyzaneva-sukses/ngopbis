import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${uuidv4()}${ext}`;
  // Use a mounted directory in production so uploads survive container redeploys.
  const uploadDir = process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "public", "uploads");
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await mkdir(uploadDir, { recursive: true });
  await writeFile(filepath, Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${filename}`, filename: file.name });
}
