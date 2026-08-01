import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getPrisma().eventQuestion.delete({ where: { id: questionId } });
  return NextResponse.json({ ok: true });
}
