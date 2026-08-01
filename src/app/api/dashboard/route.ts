import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const windowStart = new Date(todayStart);
  windowStart.setDate(windowStart.getDate() - 13);

  const [totalEvent, activeEvent, totalPeserta, totalRegistrasi, totalHadir, recent, upcoming, windowRegs] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.peserta.count(),
      prisma.registrasi.count(),
      prisma.registrasi.count({ where: { status: "HADIR" } }),
      prisma.registrasi.findMany({
        orderBy: { waktuDaftar: "desc" },
        take: 8,
        include: {
          peserta: { select: { nama: true, noWa: true } },
          event: { select: { nama: true } },
        },
      }),
      prisma.event.findMany({
        where: { tanggalMulai: { gte: todayStart } },
        orderBy: { tanggalMulai: "asc" },
        take: 5,
        include: { _count: { select: { registrasi: true } } },
      }),
      prisma.registrasi.findMany({
        where: { waktuDaftar: { gte: windowStart } },
        select: { waktuDaftar: true },
      }),
    ]);

  const perDay: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(windowStart);
    d.setDate(windowStart.getDate() + i);
    perDay.push({ date: toISODate(d), count: 0 });
  }
  const idx = new Map<string, number>();
  perDay.forEach((d, i) => idx.set(d.date, i));
  for (const r of windowRegs) {
    const key = toISODate(new Date(r.waktuDaftar));
    const i = idx.get(key);
    if (i !== undefined) perDay[i].count++;
  }

  const attendanceRate = totalRegistrasi === 0 ? 0 : Math.round((totalHadir / totalRegistrasi) * 1000) / 10;

  const allRegs = await prisma.registrasi.findMany({
    select: {
      peserta: { select: { domisili: true, statusKeanggotaan: true, sumberInformasi: true } },
    },
  });

  function top5(key: "domisili" | "statusKeanggotaan" | "sumberInformasi") {
    const map = new Map<string, number>();
    for (const r of allRegs) {
      const v = r.peserta[key];
      if (!v) continue;
      map.set(v, (map.get(v) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  const breakdown = {
    domisili: top5("domisili"),
    statusKeanggotaan: top5("statusKeanggotaan"),
    sumberInformasi: top5("sumberInformasi"),
  };

  return NextResponse.json(
    {
      totalEvent,
      activeEvent,
      totalPeserta,
      totalRegistrasi,
      totalHadir,
      attendanceRate,
      perDay,
      upcoming,
      recent,
      breakdown,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
