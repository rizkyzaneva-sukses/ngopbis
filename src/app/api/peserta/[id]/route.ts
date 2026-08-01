import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const peserta = await prisma.peserta.findUnique({
    where: { id },
    include: {
      registrasi: {
        include: {
          event: { select: { id: true, nama: true, slug: true, status: true, tanggalMulai: true } },
        },
        orderBy: { waktuDaftar: "desc" },
      },
    },
  });

  if (!peserta) {
    return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(peserta, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nama, domisili, namaBisnis, statusKeanggotaan, sumberInformasi } = body;

    const data: Record<string, unknown> = {};
    if (nama !== undefined) data.nama = nama;
    if (domisili !== undefined) data.domisili = domisili || null;
    if (namaBisnis !== undefined) data.namaBisnis = namaBisnis || null;
    if (statusKeanggotaan !== undefined) data.statusKeanggotaan = statusKeanggotaan || null;
    if (sumberInformasi !== undefined) data.sumberInformasi = sumberInformasi || null;

    const updated = await prisma.peserta.update({ where: { id }, data });

    await logAudit({
      adminId: session.adminId,
      adminNama: session.adminNama,
      aksi: "PESERTA_UPDATE",
      entitas: "Peserta",
      entitasId: id,
      detail: data,
    });

    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to update peserta", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan peserta" }, { status: 500 });
  }
}
