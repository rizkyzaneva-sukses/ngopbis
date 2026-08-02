"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface ThankYouConfig {
  heading?: string;
  message?: string;
}

export default function ThankYouPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [config, setConfig] = useState<ThankYouConfig | null>(null);
  const [eventName, setEventName] = useState("");
  const [warnaAksen, setWarnaAksen] = useState("#2563eb");

  useEffect(() => {
    fetch(`/api/events/public/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEventName(data.nama);
        setWarnaAksen(data.warnaAksen);
        setConfig(data.thankYouConfig || {});
      });
  }, [slug]);

  return (
    <main className="public-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg text-center">
        <div className="surface-card p-6 sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: warnaAksen + "20" }}>
            <svg className="h-8 w-8" style={{ color: warnaAksen }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          </div>

        <p className="eyebrow mb-3">Pendaftaran berhasil</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#152238] sm:text-3xl">
          {config?.heading || "Terima kasih telah mendaftar!"}
        </h1>

        <p className="mb-6 leading-7 text-[#526176]">
          {config?.message || `Anda telah terdaftar di ${eventName}. Simpan No WhatsApp Anda untuk check-in nanti di lokasi.`}
        </p>

        <div className="mb-6 rounded-xl border border-[#cfe4e8] bg-[#f2fafb] p-4 text-left">
          <p className="text-sm font-semibold leading-6 text-[#176b87]">
            Simpan No WhatsApp Anda untuk check-in saat hari-H di lokasi event.
          </p>
        </div>

        <Link
          href={`/event/${slug}`}
          className="text-sm font-bold hover:underline"
          style={{ color: warnaAksen }}
        >
          Kembali ke halaman event
        </Link>
        </div>
      </div>
    </main>
  );
}
