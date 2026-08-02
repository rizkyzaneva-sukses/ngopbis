"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface EventItem {
  id: string;
  nama: string;
  slug: string;
  status: string;
  tanggalMulai: string;
  lokasi: string | null;
  kuota: number | null;
  warnaAksen: string | null;
  _count: { registrasi: number };
}

type SortKey = "terbaru" | "tanggal" | "peserta";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sort, setSort] = useState<SortKey>("terbaru");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const fetchEvents = useCallback(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-500/20 text-gray-400",
    PUBLISHED: "bg-green-500/20 text-green-400",
    CLOSED: "bg-yellow-500/20 text-yellow-400",
    SELESAI: "bg-blue-500/20 text-blue-400",
  };

  const filtered = events
    .filter((e) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || e.nama.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q);
      const matchStatus = statusFilter === "Semua" || e.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "terbaru") {
        return 0;
      }
      if (sort === "tanggal") {
        const da = new Date(a.tanggalMulai).getTime();
        const db = new Date(b.tanggalMulai).getTime();
        return da - db;
      }
      return b._count.registrasi - a._count.registrasi;
    });

  const handleCopyLink = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/event/${slug}`);
      showToast("Link disalin");
    } catch {
      showToast("Gagal menyalin link", "error");
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBusyId(id);
    try {
      const res = await fetch(`/api/events/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error();
      showToast("Event diduplikat");
      fetchEvents();
    } catch {
      showToast("Gagal menduplikat event", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Hapus event ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Event dihapus");
      fetchEvents();
    } catch {
      showToast("Gagal menghapus event", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow mb-2">Workspace event</p><h1 className="text-2xl font-bold tracking-tight">Daftar event</h1><p className="mt-1 text-sm text-[#718096]">Buat, bagikan, dan pantau pendaftaran event.</p></div>
        <Link
          href="/admin/events/new"
          className="primary-button cursor-pointer"
        >
          + Buat Event
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari nama atau slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
           className="admin-input flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
           className="admin-input"
        >
          <option value="Semua">Semua Status</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="SELESAI">SELESAI</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
           className="admin-input"
        >
          <option value="terbaru">Terbaru</option>
          <option value="tanggal">Tanggal Terdekat</option>
          <option value="peserta">Peserta Terbanyak</option>
        </select>
      </div>

      {loading ? (
           <p className="text-sm text-[#718096]">Memuat event...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{events.length === 0 ? "Belum ada event." : "Tidak ada event yang cocok."}</p>
          {events.length === 0 && (
            <Link href="/admin/events/new" className="text-blue-400 hover:underline text-sm">
              Buat event pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((event) => {
            const count = event._count.registrasi;
            const kuota = event.kuota;
            const isFull = kuota !== null && count >= kuota;
            const progress = kuota ? Math.min(100, (count / kuota) * 100) : 0;
            const aksen = event.warnaAksen || "#2563eb";

            return (
              <div
                key={event.id}
                 className="admin-card p-5 transition-colors hover:border-[#a6d2d9]"
              >
                <Link href={`/admin/events/${event.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-lg truncate">{event.nama}</h2>
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
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-gray-400">{count} peserta</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor[event.status] || ""}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    {kuota ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={isFull ? "text-red-400" : "text-gray-400"}>
                            {count}/{kuota}
                          </span>
                          {isFull && <span className="text-red-400">Kuota Penuh</span>}
                        </div>
                        <div className="w-full h-1.5 bg-[#1e2450] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: aksen }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Tanpa Kuota</span>
                    )}
                  </div>
                </Link>

                <div className="flex gap-2 mt-4 pt-4 border-t border-[#1e2450]">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, event.slug)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(e, event.id)}
                    disabled={busyId === event.id}
                    className="bg-[#1e2450] hover:bg-[#2a3170] px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Duplikat
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, event.id)}
                    disabled={busyId === event.id}
                    className="bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
