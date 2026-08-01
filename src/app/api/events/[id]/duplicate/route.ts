import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: { questions: { orderBy: { urutan: "asc" } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const newNama = `${event.nama} (Salinan)`;
  let slug = generateSlug(newNama);
  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const newEvent = await prisma.$transaction(async (tx) => {
    const created = await tx.event.create({
      data: {
        nama: newNama,
        slug,
        deskripsi: event.deskripsi,
        lokasi: event.lokasi,
        googleMapsUrl: event.googleMapsUrl,
        tanggalMulai: event.tanggalMulai,
        tanggalSelesai: event.tanggalSelesai,
        bannerUrl: event.bannerUrl,
        warnaAksen: event.warnaAksen,
        kuota: event.kuota,
        thankYouConfig: event.thankYouConfig ?? undefined,
        status: "DRAFT",
      },
    });

    if (event.questions.length > 0) {
      await tx.eventQuestion.createMany({
        data: event.questions.map((q) => ({
          eventId: created.id,
          label: q.label,
          tipe: q.tipe,
          opsiJawaban: q.opsiJawaban ?? undefined,
          wajib: q.wajib,
          urutan: q.urutan,
        })),
      });
    }

    return created;
  });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "EVENT_DUPLICATE",
    entitas: "Event",
    entitasId: newEvent.id,
    detail: { fromId: id },
  });

  return NextResponse.json(newEvent, { status: 201 });
}
