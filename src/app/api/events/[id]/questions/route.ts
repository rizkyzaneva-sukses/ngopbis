import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const questions = await prisma.eventQuestion.findMany({
    where: { eventId: id },
    orderBy: { urutan: "asc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, tipe, opsiJawaban, wajib, urutan } = body;

  if (!label || !tipe) {
    return NextResponse.json({ error: "Label dan tipe wajib diisi" }, { status: 400 });
  }

  const question = await prisma.eventQuestion.create({
    data: {
      eventId: id,
      label,
      tipe,
      opsiJawaban: opsiJawaban || null,
      wajib: wajib ?? false,
      urutan: urutan ?? 0,
    },
  });

  return NextResponse.json(question, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { questions } = body as { questions: Array<{ id: string; label: string; tipe: string; opsiJawaban?: unknown; wajib: boolean; urutan: number }> };

  for (const q of questions) {
    await prisma.eventQuestion.update({
      where: { id: q.id },
      data: {
        label: q.label,
        tipe: q.tipe as "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN" | "NUMBER" | "FILE_UPLOAD",
        opsiJawaban: q.opsiJawaban as string | undefined,
        wajib: q.wajib,
        urutan: q.urutan,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
