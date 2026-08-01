import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatNoWa, validateNoWa } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventSlug, noWa, nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi, jawabanKustom } = body;

  if (!eventSlug || !noWa || !nama) {
    return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
  }

  if (!validateNoWa(noWa)) {
    return NextResponse.json({ error: "Format No WhatsApp tidak valid" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: { _count: { select: { registrasi: true } } },
  });

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Event tidak ditemukan atau belum dibuka" }, { status: 404 });
  }

  if (event.kuota && event._count.registrasi >= event.kuota) {
    return NextResponse.json({ error: "Kuota pendaftaran sudah penuh" }, { status: 400 });
  }

  const normalizedNoWa = formatNoWa(noWa);

  const peserta = await prisma.peserta.upsert({
    where: { noWa: normalizedNoWa },
    update: { nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi },
    create: { noWa: normalizedNoWa, nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi },
  });

  const existingReg = await prisma.registrasi.findUnique({
    where: { eventId_pesertaId: { eventId: event.id, pesertaId: peserta.id } },
  });

  if (existingReg) {
    if (jawabanKustom && Array.isArray(jawabanKustom)) {
      await prisma.jawabanKustom.deleteMany({ where: { registrasiId: existingReg.id } });
      for (const jawaban of jawabanKustom) {
        if (jawaban.eventQuestionId && jawaban.nilai) {
          await prisma.jawabanKustom.create({
            data: {
              registrasiId: existingReg.id,
              eventQuestionId: jawaban.eventQuestionId,
              nilai: String(jawaban.nilai),
            },
          });
        }
      }
    }
    return NextResponse.json({ ok: true, registrasiId: existingReg.id, updated: true });
  }

  const registrasi = await prisma.registrasi.create({
    data: {
      eventId: event.id,
      pesertaId: peserta.id,
    },
  });

  if (jawabanKustom && Array.isArray(jawabanKustom)) {
    for (const jawaban of jawabanKustom) {
      if (jawaban.eventQuestionId && jawaban.nilai) {
        await prisma.jawabanKustom.create({
          data: {
            registrasiId: registrasi.id,
            eventQuestionId: jawaban.eventQuestionId,
            nilai: String(jawaban.nilai),
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, registrasiId: registrasi.id }, { status: 201 });
}
