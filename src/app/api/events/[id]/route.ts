import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { parseWibDateTime } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getPrisma().event.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { urutan: "asc" } },
      _count: { select: { registrasi: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nama, deskripsi, lokasi, googleMapsUrl, tanggalMulai, tanggalSelesai, bannerUrl, warnaAksen, kuota, status, thankYouConfig, slug } = body;

    const data: Record<string, unknown> = {};
    if (nama !== undefined) data.nama = nama;
    if (slug !== undefined) data.slug = slug;
    if (deskripsi !== undefined) data.deskripsi = deskripsi;
    if (lokasi !== undefined) data.lokasi = lokasi;
    if (googleMapsUrl !== undefined) data.googleMapsUrl = googleMapsUrl;
    if (tanggalMulai !== undefined) {
      const mulai = parseWibDateTime(tanggalMulai);
      if (!mulai) {
        return NextResponse.json({ error: "Format tanggal mulai tidak valid" }, { status: 400 });
      }
      data.tanggalMulai = mulai;
    }
    if (tanggalSelesai !== undefined) {
      if (!tanggalSelesai) {
        data.tanggalSelesai = null;
      } else {
        const selesai = parseWibDateTime(tanggalSelesai);
        if (!selesai) {
          return NextResponse.json({ error: "Format tanggal selesai tidak valid" }, { status: 400 });
        }
        data.tanggalSelesai = selesai;
      }
    }
    if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
    if (warnaAksen !== undefined) data.warnaAksen = warnaAksen;
    if (kuota !== undefined) data.kuota = kuota ? parseInt(kuota) : null;
    if (status !== undefined) data.status = status;
    if (thankYouConfig !== undefined) data.thankYouConfig = thankYouConfig;

    const event = await getPrisma().event.update({ where: { id }, data });

    await logAudit({
      adminId: session.adminId,
      adminNama: session.adminNama,
      aksi: "EVENT_UPDATE",
      entitas: "Event",
      entitasId: id,
      detail: { fields: Object.keys(data) },
    });

    return NextResponse.json(event, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getPrisma().event.delete({ where: { id } });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "EVENT_DELETE",
    entitas: "Event",
    entitasId: id,
  });

  return NextResponse.json({ ok: true });
}
