import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registrations = await getPrisma().registrasi.findMany({
    where: { eventId: id },
    include: {
      peserta: true,
      jawaban: { include: { eventQuestion: true } },
    },
    orderBy: { waktuDaftar: "desc" },
  });

  return NextResponse.json(registrations);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { registrasiId, status } = await req.json();

  if (!registrasiId) {
    return NextResponse.json({ error: "registrasiId wajib" }, { status: 400 });
  }

  const data: Record<string, unknown> = { status };
  if (status === "HADIR") {
    data.waktuHadir = new Date();
  }

  const updated = await getPrisma().registrasi.update({
    where: { id: registrasiId },
    data,
    include: { peserta: true },
  });

  return NextResponse.json(updated);
}
