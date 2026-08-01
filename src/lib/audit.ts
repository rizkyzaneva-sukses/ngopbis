import { getPrisma } from "./prisma";

export async function logAudit(params: {
  adminId?: string;
  adminNama?: string;
  aksi: string;
  entitas: string;
  entitasId?: string;
  detail?: Record<string, unknown>;
}) {
  try {
    await getPrisma().auditLog.create({
      data: {
        adminId: params.adminId,
        adminNama: params.adminNama,
        aksi: params.aksi,
        entitas: params.entitas,
        entitasId: params.entitasId,
        detail: (params.detail ?? undefined) as never,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Gagal mencatat:", error);
  }
}
