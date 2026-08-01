"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Event Tidak Ditemukan</h1>
          <p className="text-gray-500 mt-2">Link yang Anda buka tidak valid.</p>
        </div>
      </div>
    );
  }

  const isClosed = event.status !== "PUBLISHED";
  const isQuotaFull = event.kuota !== null && event.totalRegistrasi >= event.kuota;

  return (
    <div className="min-h-screen bg-gray-50">
      {event.bannerUrl && (
        <div className="w-full bg-white flex justify-center">
          <img
            src={event.bannerUrl}
            alt={event.nama}
            className="w-full max-w-2xl object-contain"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: event.warnaAksen }}
        >
          {event.nama}
        </h1>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-gray-700">
              <p className="font-medium">
                {new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-500">
                Pukul {new Date(event.tanggalMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                {event.tanggalSelesai && (
                  <> - {new Date(event.tanggalSelesai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</>
                )}
              </p>
            </div>
          </div>

          {event.lokasi && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-gray-700 font-medium">{event.lokasi}</p>
                {event.googleMapsUrl && (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm inline-flex items-center gap-1 mt-1 hover:underline"
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
          <div className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.deskripsi}
          </div>
        )}

        <div className="mt-8">
          {isClosed || isQuotaFull ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-800 font-medium">
                {isQuotaFull ? "Kuota pendaftaran sudah penuh." : "Pendaftaran sudah ditutup."}
              </p>
            </div>
          ) : (
            <Link
              href={`/event/${event.slug}/register`}
              className="block w-full text-center py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: event.warnaAksen }}
            >
              Saya Mau Daftar
            </Link>
          )}
        </div>

        {event.kuota && !isQuotaFull && (
          <p className="text-center text-sm text-gray-400 mt-3">
            Sisa kuota: {event.kuota - event.totalRegistrasi} dari {event.kuota}
          </p>
        )}
      </div>
    </div>
  );
}
