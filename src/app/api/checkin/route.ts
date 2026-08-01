import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { formatNoWa } from "@/lib/utils";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (!checkRateLimit("checkin:" + getClientIp(req), 30, 60000)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });
  }

  const { eventSlug, noWa, confirm } = await req.json();

  if (!eventSlug || !noWa) {
    return NextResponse.json({ error: "Event dan No WA wajib diisi" }, { status: 400 });
  }

  const normalizedNoWa = formatNoWa(noWa);

  const event = await getPrisma().event.findUnique({ where: { slug: eventSlug } });
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const peserta = await getPrisma().peserta.findUnique({ where: { noWa: normalizedNoWa } });
  if (!peserta) {
    return NextResponse.json({ status: "NOT_FOUND", message: "Nomor tidak terdaftar di event ini. Hubungi panitia." });
  }

  const registrasi = await getPrisma().registrasi.findUnique({
    where: { eventId_pesertaId: { eventId: event.id, pesertaId: peserta.id } },
  });

  if (!registrasi) {
    return NextResponse.json({ status: "NOT_FOUND", message: "Nomor tidak terdaftar di event ini. Hubungi panitia." });
  }

  if (registrasi.status === "HADIR") {
    const waktu = registrasi.waktuHadir
      ? new Date(registrasi.waktuHadir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "";
    return NextResponse.json({
      status: "ALREADY_CHECKED_IN",
      message: `Sudah absen jam ${waktu}`,
      nama: peserta.nama,
    });
  }

  if (!confirm) {
    return NextResponse.json({
      status: "FOUND",
      nama: peserta.nama,
      pesertaId: peserta.id,
      registrasiId: registrasi.id,
    });
  }

  await getPrisma().registrasi.update({
    where: { id: registrasi.id },
    data: { status: "HADIR", waktuHadir: new Date() },
  });

  return NextResponse.json({
    status: "CHECKED_IN",
    message: "Check-in berhasil!",
    nama: peserta.nama,
  });
}
