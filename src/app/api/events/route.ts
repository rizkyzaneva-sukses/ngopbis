import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { registrasi: true } },
    },
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nama, deskripsi, lokasi, googleMapsUrl, tanggalMulai, tanggalSelesai, bannerUrl, warnaAksen, kuota, slug: customSlug } = body;

  if (!nama || !tanggalMulai) {
    return NextResponse.json({ error: "Nama dan tanggal mulai wajib diisi" }, { status: 400 });
  }

  let slug = customSlug || generateSlug(nama);
  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const event = await prisma.event.create({
    data: {
      nama,
      slug,
      deskripsi: deskripsi || null,
      lokasi: lokasi || null,
      googleMapsUrl: googleMapsUrl || null,
      tanggalMulai: new Date(tanggalMulai),
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
      bannerUrl: bannerUrl || null,
      warnaAksen: warnaAksen || "#2563eb",
      kuota: kuota ? parseInt(kuota) : null,
    },
  });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "EVENT_CREATE",
    entitas: "Event",
    entitasId: event.id,
    detail: { nama: event.nama, slug: event.slug },
  });

  return NextResponse.json(event, { status: 201 });
}
