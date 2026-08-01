import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { hashSync } from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminRole !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, nama: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(admins, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminRole !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { nama, email, password, role } = body;

  if (!nama || !email || !password) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
  }

  const finalRole = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

  let admin;
  try {
    admin = await prisma.admin.create({
      data: {
        nama,
        email,
        passwordHash: hashSync(password, 10),
        role: finalRole,
      },
      select: { id: true, nama: true, email: true, role: true, createdAt: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }
    throw error;
  }

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "ADMIN_CREATE",
    entitas: "Admin",
    entitasId: admin.id,
    detail: { nama, email, role: finalRole },
  });

  return NextResponse.json(admin, { status: 201 });
}
