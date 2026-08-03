"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import FormattedDescription from "@/components/FormattedDescription";

interface EventData {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  lokasi: string | null;
  googleMapsUrl: string | null;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  bannerUrl: string | null;
  warnaAksen: string;
  kuota: number | null;
  status: string;
  totalRegistrasi: number;
  questions: Array<{ id: string; label: string; tipe: string; opsiJawaban: string[] | null; wajib: boolean }>;
}

export default function EventLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/events/public/${slug}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setEvent)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="public-shell flex min-h-screen items-center justify-center">
        <p className="text-sm font-medium text-[#718096]">Memuat informasi event...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="public-shell flex min-h-screen items-center justify-center p-5">
        <div className="text-center">
          <p className="eyebrow mb-3">404 / Event</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#152238]">Event tidak ditemukan</h1>
          <p className="mt-2 text-[#718096]">Link yang Anda buka tidak valid atau event sudah dihapus.</p>
        </div>
      </div>
    );
  }

  const isClosed = event.status !== "PUBLISHED";
  const isQuotaFull = event.kuota !== null && event.totalRegistrasi >= event.kuota;

  return (
    <main className="public-shell">
      <header className="public-container flex min-w-0 items-center justify-between gap-3 py-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-sm font-bold tracking-tight text-[#152238]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102a3d] text-[10px] font-bold text-white">EP</span>
          <span className="truncate">Event Pendidikan</span>
        </Link>
        <span className="hidden flex-none text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a98a8] sm:block">Informasi event</span>
      </header>
      {event.bannerUrl && (
        <div className="public-container overflow-hidden rounded-2xl border border-[#e5eaf1] bg-white shadow-[0_18px_50px_rgba(31,55,80,0.07)]">
          <img
            src={event.bannerUrl}
            alt={event.nama}
            className="block h-auto w-full max-w-full object-contain"
          />
        </div>
      )}

      <div className="public-container max-w-3xl py-8 pb-12 sm:py-12">
        <p className="eyebrow mb-3">Anda diundang</p>
        <h1
          className="max-w-full break-words text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl"
          style={{ color: event.warnaAksen }}
        >
          {event.nama}
        </h1>
        <p className="mt-4 max-w-2xl break-words text-base leading-7 text-[#526176]">Siapkan waktu Anda dan daftar untuk mengamankan tempat di event ini.</p>

        <div className="surface-card mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#176b87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="min-w-0 text-[#152238]">
              <p className="font-semibold">
                {new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
                  timeZone: "Asia/Jakarta",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-1 text-sm text-[#718096]">
                Pukul {new Date(event.tanggalMulai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false })} WIB
                {event.tanggalSelesai && (
                  <> - {new Date(event.tanggalSelesai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false })} WIB</>
                )}
              </p>
            </div>
          </div>

          {event.lokasi && (
            <div className="flex min-w-0 items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#176b87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="min-w-0">
                <p className="break-words font-semibold text-[#152238]">{event.lokasi}</p>
                {event.googleMapsUrl && (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-sm font-semibold hover:underline"
                    style={{ color: event.warnaAksen }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Lihat di Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {event.deskripsi && (
          <div className="mt-8 break-words leading-8 text-[#526176]">
            <FormattedDescription value={event.deskripsi} />
          </div>
        )}

        <div className="mt-8">
          {isClosed || isQuotaFull ? (
            <div className="rounded-2xl border border-[#ead9b7] bg-[#fff9ef] p-6 text-center">
              <p className="font-semibold text-[#8a5a16]">
                {isQuotaFull ? "Kuota pendaftaran sudah penuh." : "Pendaftaran sudah ditutup."}
              </p>
            </div>
          ) : (
            <Link
              href={`/event/${event.slug}/register`}
              className="block w-full rounded-xl py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:opacity-90 sm:text-lg"
              style={{ backgroundColor: event.warnaAksen }}
            >
              Saya Mau Daftar
            </Link>
          )}
        </div>

        {event.kuota && !isQuotaFull && (
          <p className="mt-3 text-center text-sm text-[#718096]">
            Sisa kuota: {event.kuota - event.totalRegistrasi} dari {event.kuota}
          </p>
        )}
      </div>
    </main>
  );
}
