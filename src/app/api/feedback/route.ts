import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { formatNoWa } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (!checkRateLimit("feedback:" + getClientIp(req), 20, 60000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }

  const { eventSlug, noWa, rating, komentar } = await req.json();

  if (!eventSlug || !noWa) {
    return NextResponse.json({ error: "Event dan No WA wajib diisi" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus antara 1 sampai 5" }, { status: 400 });
  }

  const normalizedNoWa = formatNoWa(noWa);

  const event = await getPrisma().event.findUnique({ where: { slug: eventSlug } });
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const peserta = await getPrisma().peserta.findUnique({ where: { noWa: normalizedNoWa } });
  if (!peserta) {
    return NextResponse.json({ status: "NOT_FOUND", message: "Nomor tidak terdaftar. Hubungi panitia." });
  }

  const registrasi = await getPrisma().registrasi.findUnique({
    where: { eventId_pesertaId: { eventId: event.id, pesertaId: peserta.id } },
  });

  if (!registrasi) {
    return NextResponse.json({ status: "NOT_FOUND", message: "Anda tidak terdaftar di event ini." });
  }

  if (registrasi.status !== "HADIR") {
    return NextResponse.json({ status: "NOT_CHECKED_IN", message: "Anda belum check-in. Selesaikan check-in terlebih dahulu." });
  }

  const existing = await getPrisma().feedback.findUnique({
    where: { registrasiId: registrasi.id },
  });

  if (existing) {
    return NextResponse.json({ status: "ALREADY_SUBMITTED", message: "Anda sudah mengisi feedback untuk event ini." });
  }

  await getPrisma().feedback.create({
    data: {
      registrasiId: registrasi.id,
      eventId: event.id,
      rating,
      komentar: typeof komentar === "string" ? komentar.trim() || null : null,
    },
  });

  return NextResponse.json({ status: "SUBMITTED", message: "Terima kasih atas feedback Anda!" });
}
