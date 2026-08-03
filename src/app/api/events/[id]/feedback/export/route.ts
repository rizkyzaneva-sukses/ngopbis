import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await getPrisma().event.findUnique({ where: { id }, select: { nama: true, slug: true } });
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  }

  const feedbacks = await getPrisma().feedback.findMany({
    where: { eventId: id },
    include: {
      registrasi: {
        include: {
          peserta: { select: { nama: true, noWa: true } },
        },
      },
    },
    orderBy: { waktuIsi: "desc" },
  });

  const rows = feedbacks.map((f, index) => ({
    No: index + 1,
    Nama: f.registrasi.peserta.nama,
    "No WA": f.registrasi.peserta.noWa,
    Rating: f.rating,
    Komentar: f.komentar || "",
    "Waktu Isi": new Date(f.waktuIsi).toLocaleString("id-ID"),
  }));

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Feedback");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="feedback-${event.slug}.xlsx"`,
    },
  });
}
