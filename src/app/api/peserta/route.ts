import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const domisili = url.searchParams.get("domisili")?.trim() || "";
  const statusKeanggotaan = url.searchParams.get("statusKeanggotaan")?.trim() || "";
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50") || 50, 1), 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0") || 0, 0);

  const conditions: Prisma.PesertaWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { nama: { contains: q } },
        { noWa: { contains: q } },
      ],
    });
  }
  if (domisili) {
    conditions.push({ domisili: { contains: domisili } });
  }
  if (statusKeanggotaan) {
    conditions.push({ statusKeanggotaan: statusKeanggotaan });
  }

  const where: Prisma.PesertaWhereInput = conditions.length ? { AND: conditions } : {};

  const pesertaList = await prisma.peserta.findMany({
    where,
    include: { registrasi: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const result = pesertaList.map((p) => ({
    id: p.id,
    noWa: p.noWa,
    nama: p.nama,
    domisili: p.domisili,
    namaBisnis: p.namaBisnis,
    statusKeanggotaan: p.statusKeanggotaan,
    sumberInformasi: p.sumberInformasi,
    createdAt: p.createdAt,
    totalEvent: p.registrasi.length,
    totalHadir: p.registrasi.filter((r) => r.status === "HADIR").length,
  }));

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
