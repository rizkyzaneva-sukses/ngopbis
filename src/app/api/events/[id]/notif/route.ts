import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { isWahaConfigured, DEFAULT_TEMPLATE_KONFIRMASI, DEFAULT_TEMPLATE_REMINDER, type NotifConfig } from "@/lib/whatsapp";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: { notifConfig: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const cfg = (event.notifConfig as NotifConfig | null) || {};

  return NextResponse.json(
    {
      konfirmasiAktif: cfg.konfirmasiAktif ?? false,
      reminderAktif: cfg.reminderAktif ?? false,
      templateKonfirmasi: cfg.templateKonfirmasi || DEFAULT_TEMPLATE_KONFIRMASI,
      templateReminder: cfg.templateReminder || DEFAULT_TEMPLATE_REMINDER,
      wahaConfigured: isWahaConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { konfirmasiAktif, reminderAktif, templateKonfirmasi, templateReminder } = body;

  const notifConfig: NotifConfig = {
    konfirmasiAktif: Boolean(konfirmasiAktif),
    reminderAktif: Boolean(reminderAktif),
    templateKonfirmasi: typeof templateKonfirmasi === "string" ? templateKonfirmasi : undefined,
    templateReminder: typeof templateReminder === "string" ? templateReminder : undefined,
  };

  await prisma.event.update({
    where: { id },
    data: { notifConfig: notifConfig as object },
  });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "NOTIF_UPDATE",
    entitas: "Event",
    entitasId: id,
  });

  const cfg = notifConfig;

  return NextResponse.json(
    {
      konfirmasiAktif: cfg.konfirmasiAktif ?? false,
      reminderAktif: cfg.reminderAktif ?? false,
      templateKonfirmasi: cfg.templateKonfirmasi || DEFAULT_TEMPLATE_KONFIRMASI,
      templateReminder: cfg.templateReminder || DEFAULT_TEMPLATE_REMINDER,
      wahaConfigured: isWahaConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
