import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { compareSync } from "bcryptjs";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !compareSync(password, admin.passwordHash)) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.adminNama = admin.nama;
  session.adminEmail = admin.email;
  session.adminRole = admin.role;
  session.isLoggedIn = true;
  await session.save();

  await logAudit({
    adminId: admin.id,
    adminNama: admin.nama,
    aksi: "LOGIN",
    entitas: "Admin",
    entitasId: admin.id,
  });

  return NextResponse.json({ ok: true, nama: admin.nama });
}
