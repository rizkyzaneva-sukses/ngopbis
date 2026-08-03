import { ImageResponse } from "next/og";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Preview event";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPrisma().event.findUnique({
    where: { slug },
    select: {
      nama: true,
      lokasi: true,
      tanggalMulai: true,
      bannerUrl: true,
    },
  });

  const title = event?.nama || "Event Pendidikan";
  const dateStr = event?.tanggalMulai
    ? new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const subtitle = [dateStr, event?.lokasi].filter(Boolean).join(" · ");
  const bannerUrl = event?.bannerUrl
    ? event.bannerUrl.startsWith("http")
      ? event.bannerUrl
      : `${process.env.NEXT_PUBLIC_APP_URL || "https://ngopbis.mudajuara.my.id"}${event.bannerUrl}`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(145deg, #102a3d 0%, #176b87 55%, #0f4f66 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.28,
            }}
          />
        ) : null}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px",
            background: bannerUrl
              ? "linear-gradient(180deg, rgba(16,42,61,0.72) 0%, rgba(15,79,102,0.88) 100%)"
              : "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 20,
                background: "#d8eef0",
                color: "#176b87",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              EP
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>Event Pendidikan</div>
              <div style={{ fontSize: 20, opacity: 0.88 }}>Registrasi & Kehadiran</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1040 }}>
            <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.12 }}>{title}</div>
            {subtitle ? <div style={{ fontSize: 28, opacity: 0.92 }}>{subtitle}</div> : null}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
