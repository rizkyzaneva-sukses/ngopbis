import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/site";
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
      slug: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  const siteUrl = getSiteUrl();

  if (!event) {
    return {
      title: "Event tidak ditemukan",
      openGraph: {
        title: "Event tidak ditemukan",
        description: "Event yang dibagikan tidak tersedia.",
        images: [{ url: `${siteUrl}/opengraph-image`, alt: "Event Pendidikan" }],
      },
    };
  }

  const dateStr = new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const description = `${event.nama} — ${dateStr}${event.lokasi ? ` di ${event.lokasi}` : ""}. Daftar sekarang di Event Pendidikan.`;
  const pageUrl = `${siteUrl}/event/${event.slug}`;
  // Prefer generated branded OG image (includes logo). Fallback to banner absolute URL.
  const ogImage = `${siteUrl}/event/${event.slug}/opengraph-image`;
  const bannerAbs = toAbsoluteUrl(event.bannerUrl);

  return {
    title: event.nama,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: event.nama,
      description,
      type: "website",
      url: pageUrl,
      siteName: "Event Pendidikan",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.nama,
        },
        ...(bannerAbs
          ? [{ url: bannerAbs, width: 1200, height: 630, alt: event.nama }]
          : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.nama,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventLanding slug={slug} />;
}
