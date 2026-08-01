import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { formatNoWa } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { noWa } = await req.json();
  if (!noWa) {
    return NextResponse.json({ found: false });
  }

  const normalized = formatNoWa(noWa);
  const peserta = await getPrisma().peserta.findUnique({
    where: { noWa: normalized },
  });

  if (!peserta) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    nama: peserta.nama,
    domisili: peserta.domisili,
    namaBisnis: peserta.namaBisnis,
    statusKeanggotaan: peserta.statusKeanggotaan,
    sumberInformasi: peserta.sumberInformasi,
  });
}
