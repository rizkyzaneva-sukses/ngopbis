import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { hashSync } from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminRole !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { password, role } = body;

  const existing = await getPrisma().admin.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  const data: { passwordHash?: string; role?: "SUPER_ADMIN" | "ADMIN" } = {};
  const detail: Record<string, unknown> = {};

  if (password) {
    data.passwordHash = hashSync(password, 10);
    detail.passwordReset = true;
  }
  if (role !== undefined) {
    data.role = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    detail.role = data.role;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  const admin = await getPrisma().admin.update({
    where: { id },
    data,
    select: { id: true, nama: true, email: true, role: true, createdAt: true },
  });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "ADMIN_UPDATE",
    entitas: "Admin",
    entitasId: id,
    detail,
  });

  return NextResponse.json(admin, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminRole !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (id === session.adminId) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  const existing = await getPrisma().admin.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  await getPrisma().admin.delete({ where: { id } });

  await logAudit({
    adminId: session.adminId,
    adminNama: session.adminNama,
    aksi: "ADMIN_DELETE",
    entitas: "Admin",
    entitasId: id,
    detail: { nama: existing.nama, email: existing.email },
  });

  return NextResponse.json({ ok: true });
}
