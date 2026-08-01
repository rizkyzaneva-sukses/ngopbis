import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await getPrisma().event.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { urutan: "asc" } },
      _count: { select: { registrasi: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    id: event.id,
    nama: event.nama,
    slug: event.slug,
    deskripsi: event.deskripsi,
    lokasi: event.lokasi,
    googleMapsUrl: event.googleMapsUrl,
    tanggalMulai: event.tanggalMulai,
    tanggalSelesai: event.tanggalSelesai,
    bannerUrl: event.bannerUrl,
    warnaAksen: event.warnaAksen,
    kuota: event.kuota,
    status: event.status,
    thankYouConfig: event.thankYouConfig,
    totalRegistrasi: event._count.registrasi,
    questions: event.questions,
  }, { headers: { "Cache-Control": "no-store" } });
}
