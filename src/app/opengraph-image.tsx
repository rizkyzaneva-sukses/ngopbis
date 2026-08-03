import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Event Pendidikan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #102a3d 0%, #176b87 55%, #0f4f66 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "#d8eef0",
              color: "#176b87",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            EP
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>Event Pendidikan</div>
            <div style={{ fontSize: 22, opacity: 0.85 }}>Registrasi & Kehadiran</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, maxWidth: 980 }}>
            Platform registrasi event yang rapi dan mudah digunakan
          </div>
          <div style={{ fontSize: 26, opacity: 0.9 }}>ngopbis.mudajuara.my.id</div>
        </div>
      </div>
    ),
    size,
  );
}
