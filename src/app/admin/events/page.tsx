"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  id: string;
  nama: string;
  slug: string;
  status: string;
  tanggalMulai: string;
  lokasi: string | null;
  _count: { registrasi: number };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-400",
    PUBLISHED: "bg-green-500/20 text-green-400",
    CLOSED: "bg-yellow-500/20 text-yellow-400",
    SELESAI: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Daftar Event</h1>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Buat Event
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Belum ada event.</p>
          <Link href="/admin/events/new" className="text-blue-400 hover:underline text-sm">
            Buat event pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="bg-[#111638] border border-[#1e2450] rounded-xl p-5 hover:border-blue-500/50 transition-colors block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{event.nama}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(event.tanggalMulai).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {event.lokasi && ` — ${event.lokasi}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">/{event.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {event._count.registrasi} peserta
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[event.status] || ""}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
