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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: warnaAksen + "20" }}>
          <svg className="w-8 h-8" style={{ color: warnaAksen }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {config?.heading || "Terima kasih telah mendaftar!"}
        </h1>

        <p className="text-gray-600 mb-6">
          {config?.message || `Anda telah terdaftar di ${eventName}. Simpan No WhatsApp Anda untuk check-in nanti di lokasi.`}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            Simpan No WhatsApp Anda untuk check-in saat hari-H di lokasi event.
          </p>
        </div>

        <Link
          href={`/event/${slug}`}
          className="text-sm hover:underline"
          style={{ color: warnaAksen }}
        >
          Kembali ke halaman event
        </Link>
      </div>
    </div>
  );
}
