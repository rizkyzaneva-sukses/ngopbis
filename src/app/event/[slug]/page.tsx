import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import EventLanding from "./EventLanding";

async function getEvent(slug: string) {
  return getPrisma().event.findUnique({
    where: { slug },
    select: {
      nama: true,
      deskripsi: true,
      lokasi: true,
      tanggalMulai: true,
      bannerUrl: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "Event tidak ditemukan" };
  }

  const dateStr = new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const description = `${event.nama} — ${dateStr}${event.lokasi ? ` di ${event.lokasi}` : ""}. Daftar sekarang di Event Pendidikan.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const ogImage = event.bannerUrl?.startsWith("http")
    ? event.bannerUrl
    : baseUrl
      ? `${baseUrl}${event.bannerUrl || ""}`
      : event.bannerUrl || undefined;

  return {
    title: event.nama,
    description,
    openGraph: {
      title: event.nama,
      description,
      type: "website",
      ...(event.bannerUrl ? { images: [{ url: ogImage || event.bannerUrl, alt: event.nama }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: event.nama,
      description,
      ...(event.bannerUrl ? { images: [{ url: ogImage || event.bannerUrl, alt: event.nama }] } : {}),
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventLanding slug={slug} />;
}
