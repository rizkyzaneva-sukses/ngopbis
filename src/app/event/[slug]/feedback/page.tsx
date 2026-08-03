import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import FeedbackForm from "./FeedbackForm";

async function getEvent(slug: string) {
  return getPrisma().event.findUnique({
    where: { slug },
    select: { nama: true, warnaAksen: true },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return {
    title: event ? `Feedback ${event.nama}` : "Feedback Event",
    description: "Bagikan penilaian dan saran Anda tentang event ini.",
  };
}

export default async function FeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FeedbackForm slug={slug} />;
}
