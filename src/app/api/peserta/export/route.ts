import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pesertaList = await getPrisma().peserta.findMany({
    include: { registrasi: { select: { status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = pesertaList.map((p, idx) => ({
    No: idx + 1,
    "No WhatsApp": p.noWa,
    Nama: p.nama,
    Domisili: p.domisili || "",
    "Nama Bisnis": p.namaBisnis || "",
    "Status Keanggotaan": p.statusKeanggotaan || "",
    "Sumber Informasi": p.sumberInformasi || "",
    "Total Event": p.registrasi.length,
    "Total Hadir": p.registrasi.filter((r) => r.status === "HADIR").length,
    Terdaftar: new Date(p.createdAt).toLocaleString("id-ID"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Peserta");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="database-peserta.xlsx"`,
    },
  });
}
