import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { formatDateTime, formatNoWa, validateNoWa } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendWhatsAppMessage, renderTemplate, DEFAULT_TEMPLATE_KONFIRMASI, type NotifConfig } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  if (!checkRateLimit("register:" + getClientIp(req), 20, 60000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  const body = await req.json();
  const { eventSlug, noWa, nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi, jawabanKustom } = body;

  if (!eventSlug || !noWa || !nama) {
    return NextResponse.json({ error: "Data wajib belum lengkap" }, { status: 400 });
  }

  if (!validateNoWa(noWa)) {
    return NextResponse.json({ error: "Format No WhatsApp tidak valid" }, { status: 400 });
  }

  const event = await getPrisma().event.findUnique({
    where: { slug: eventSlug },
    include: {
      _count: { select: { registrasi: true } },
      questions: { orderBy: { urutan: "asc" } },
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Event tidak ditemukan atau belum dibuka" }, { status: 404 });
  }

  if (event.kuota && event._count.registrasi >= event.kuota) {
    return NextResponse.json({ error: "Kuota pendaftaran sudah penuh" }, { status: 400 });
  }

  const jawabanMap = new Map<string, string>();
  if (jawabanKustom && Array.isArray(jawabanKustom)) {
    for (const jawaban of jawabanKustom) {
      if (jawaban.eventQuestionId) {
        jawabanMap.set(jawaban.eventQuestionId, jawaban.nilai != null ? String(jawaban.nilai) : "");
      }
    }
  }

  for (const q of event.questions) {
    const nilai = (jawabanMap.get(q.id) || "").trim();
    if (q.wajib && !nilai) {
      return NextResponse.json({ error: `Pertanyaan wajib belum diisi: ${q.label}` }, { status: 400 });
    }
    if (q.tipe === "NUMBER" && nilai) {
      if (isNaN(Number(nilai))) {
        return NextResponse.json({ error: `Jawaban untuk ${q.label} harus berupa angka` }, { status: 400 });
      }
    }
  }

  const normalizedNoWa = formatNoWa(noWa);

  const peserta = await getPrisma().peserta.upsert({
    where: { noWa: normalizedNoWa },
    update: { nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi },
    create: { noWa: normalizedNoWa, nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi },
  });

  const existingReg = await getPrisma().registrasi.findUnique({
    where: { eventId_pesertaId: { eventId: event.id, pesertaId: peserta.id } },
  });

  if (existingReg) {
    if (jawabanKustom && Array.isArray(jawabanKustom)) {
      await getPrisma().jawabanKustom.deleteMany({ where: { registrasiId: existingReg.id } });
      for (const jawaban of jawabanKustom) {
        if (jawaban.eventQuestionId && jawaban.nilai) {
          await getPrisma().jawabanKustom.create({
            data: {
              registrasiId: existingReg.id,
              eventQuestionId: jawaban.eventQuestionId,
              nilai: String(jawaban.nilai),
            },
          });
        }
      }
    }

    try {
      const cfg = event.notifConfig as NotifConfig | null;
      if (cfg?.konfirmasiAktif) {
        const template = cfg.templateKonfirmasi || DEFAULT_TEMPLATE_KONFIRMASI;
        const text = renderTemplate(template, {
          nama,
          event: event.nama,
          tanggal: formatDateTime(event.tanggalMulai) + " WIB",
          lokasi: event.lokasi || "-",
        });
        sendWhatsAppMessage(normalizedNoWa, text).catch(() => {});
      }
    } catch {}

    return NextResponse.json({ ok: true, registrasiId: existingReg.id, updated: true });
  }

  const registrasi = await getPrisma().registrasi.create({
    data: {
      eventId: event.id,
      pesertaId: peserta.id,
    },
  });

  if (jawabanKustom && Array.isArray(jawabanKustom)) {
    for (const jawaban of jawabanKustom) {
      if (jawaban.eventQuestionId && jawaban.nilai) {
        await getPrisma().jawabanKustom.create({
          data: {
            registrasiId: registrasi.id,
            eventQuestionId: jawaban.eventQuestionId,
            nilai: String(jawaban.nilai),
          },
        });
      }
    }
  }

  try {
    const cfg = event.notifConfig as NotifConfig | null;
    if (cfg?.konfirmasiAktif) {
      const template = cfg.templateKonfirmasi || DEFAULT_TEMPLATE_KONFIRMASI;
      const text = renderTemplate(template, {
        nama,
        event: event.nama,
        tanggal: formatDateTime(event.tanggalMulai) + " WIB",
        lokasi: event.lokasi || "-",
      });
      sendWhatsAppMessage(normalizedNoWa, text).catch(() => {});
    }
  } catch {}

  return NextResponse.json({ ok: true, registrasiId: registrasi.id }, { status: 201 });
}
