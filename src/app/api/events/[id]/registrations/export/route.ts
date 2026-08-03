import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getPrisma().event.findUnique({
    where: { id },
    include: { questions: { orderBy: { urutan: "asc" } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const registrations = await getPrisma().registrasi.findMany({
    where: { eventId: id },
    include: {
      peserta: true,
      jawaban: { include: { eventQuestion: true } },
    },
    orderBy: { waktuDaftar: "asc" },
  });

  const rows = registrations.map((reg, idx) => {
    const row: Record<string, unknown> = {
      No: idx + 1,
      "No WhatsApp": reg.peserta.noWa,
      Nama: reg.peserta.nama,
      Domisili: reg.peserta.domisili || "",
      "Nama Bisnis": reg.peserta.namaBisnis || "",
      "Status Keanggotaan": reg.peserta.statusKeanggotaan || "",
      "Sumber Informasi": reg.peserta.sumberInformasi || "",
      Status: reg.status,
      "Waktu Daftar": reg.waktuDaftar ? new Date(reg.waktuDaftar).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }) : "",
      "Waktu Hadir": reg.waktuHadir ? new Date(reg.waktuHadir).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }) : "",
    };

    for (const q of event.questions) {
      const jawaban = reg.jawaban.find((j) => j.eventQuestionId === q.id);
      row[q.label] = jawaban?.nilai || "";
    }

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Peserta");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${event.slug}-peserta.xlsx"`,
    },
  });
}
