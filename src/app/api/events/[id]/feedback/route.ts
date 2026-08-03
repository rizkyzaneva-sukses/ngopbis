import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

  const total = feedbacks.length;
  const avgRating = total > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total : 0;
  const ratingBreakdown = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: feedbacks.filter((f) => f.rating === rating).length,
  }));

  return NextResponse.json(
    {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingBreakdown,
      items: feedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        komentar: f.komentar,
        waktuIsi: f.waktuIsi,
        nama: f.registrasi.peserta.nama,
        noWa: f.registrasi.peserta.noWa,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
