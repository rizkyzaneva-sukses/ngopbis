import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import {
  sendWhatsAppMessage,
  isWahaConfigured,
  renderTemplate,
  DEFAULT_TEMPLATE_REMINDER,
  type NotifConfig,
} from "@/lib/whatsapp";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getPrisma().event.findUnique({
    where: { id },
    select: { nama: true, tanggalMulai: true, lokasi: true, notifConfig: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const template = (event.notifConfig as NotifConfig | null)?.templateReminder || DEFAULT_TEMPLATE_REMINDER;
  const tanggal = new Date(event.tanggalMulai).toLocaleString("id-ID");
  const lokasi = event.lokasi || "-";

  const regs = await getPrisma().registrasi.findMany({
    where: { eventId: id, status: "TERDAFTAR" },
    include: { peserta: { select: { nama: true, noWa: true } } },
  });

  let sent = 0;
  let failed = 0;
  const total = regs.length;

  for (const r of regs) {
    const text = renderTemplate(template, {
      nama: r.peserta.nama,
      event: event.nama,
      tanggal,
      lokasi,
    });
    try {
      const res = await sendWhatsAppMessage(r.peserta.noWa, text);
      if (res.ok) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "REMINDER_BLAST",
    entitas: "Event",
    entitasId: id,
    detail: { sent, failed, total },
  });

  return NextResponse.json({ sent, failed, total, wahaConfigured: isWahaConfigured() });
}
