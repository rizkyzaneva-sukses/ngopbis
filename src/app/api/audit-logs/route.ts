import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entitas = searchParams.get("entitas") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50") || 50;
  const offset = parseInt(searchParams.get("offset") || "0") || 0;

  const logs = await getPrisma().auditLog.findMany({
    where: entitas ? { entitas } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    select: {
      id: true,
      adminNama: true,
      aksi: true,
      entitas: true,
      entitasId: true,
      detail: true,
      createdAt: true,
    },
  });

  return NextResponse.json(logs, { headers: { "Cache-Control": "no-store" } });
}
