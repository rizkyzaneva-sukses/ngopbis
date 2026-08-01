"use client";

import { useEffect, useState, use, useCallback, useRef } from "react";
import Link from "next/link";

interface EventData {
  id: string;
  nama: string;
  warnaAksen: string;
}

interface Registrasi {
  id: string;
  status: string;
  waktuDaftar: string;
  waktuHadir: string | null;
  peserta: { noWa: string; nama: string; domisili: string | null };
}

type Filter = "semua" | "belum" | "sudah";

export default function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registrasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [recentId, setRecentId] = useState<string | null>(null);
  const recentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvent = useCallback(() => {
    fetch(`/api/events/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Gagal memuat event");
        return data;
      })
      .then((data) => setEvent({ id: data.id, nama: data.nama, warnaAksen: data.warnaAksen }))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchRegistrations = useCallback(() => {
    fetch(`/api/events/${id}/registrations`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRegistrations(Array.isArray(data) ? data : []));
  }, [id]);

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
    const interval = setInterval(fetchRegistrations, 5000);
    return () => {
      clearInterval(interval);
      if (recentTimer.current) clearTimeout(recentTimer.current);
    };
  }, [fetchEvent, fetchRegistrations]);

  const handleConfirm = async (registrasiId: string) => {
    setConfirming(registrasiId);
    try {
      await fetch(`/api/events/${id}/registrations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrasiId, status: "HADIR" }),
      });
      await fetchRegistrations();
      setRecentId(registrasiId);
      if (recentTimer.current) clearTimeout(recentTimer.current);
      recentTimer.current = setTimeout(() => setRecentId(null), 2500);
    } finally {
      setConfirming(null);
    }
  };

  if (loading || !event) return <p className="text-gray-400">Loading...</p>;

  const total = registrations.length;
  const sudahHadir = registrations.filter((r) => r.status === "HADIR").length;
  const belumHadir = total - sudahHadir;

  const q = search.trim().toLowerCase();
  const filtered = registrations.filter((r) => {
    if (filter === "belum" && r.status === "HADIR") return false;
    if (filter === "sudah" && r.status !== "HADIR") return false;
    if (!q) return true;
    return (
      r.peserta.nama.toLowerCase().includes(q) ||
      r.peserta.noWa.toLowerCase().includes(q)
    );
  });

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "belum", label: "Belum Hadir" },
    { key: "sudah", label: "Sudah Hadir" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/admin/events/${id}`} className="text-gray-400 hover:text-white text-sm">
          &larr; Kembali
        </Link>
        <button
          onClick={fetchRegistrations}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold">{event.nama}</h1>
        <p className="text-sm text-gray-400">Mode Check-in Panitia</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-xs text-gray-400">Total Pendaftar</p>
        </div>
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{sudahHadir}</p>
          <p className="text-xs text-gray-400">Sudah Hadir</p>
        </div>
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{belumHadir}</p>
          <p className="text-xs text-gray-400">Belum Hadir</p>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama atau No WA..."
        className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 mb-3"
      />

      <div className="flex gap-2 mb-4">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === f.key ? "bg-blue-600 text-white" : "bg-[#111638] border border-[#1e2450] text-gray-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="max-h-[60vh] overflow-auto space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">Tidak ada peserta</p>
        )}
        {filtered.map((reg) => {
          const isHadir = reg.status === "HADIR";
          const isRecent = recentId === reg.id;
          return (
            <div
              key={reg.id}
              className={`bg-[#111638] border rounded-xl p-4 transition-colors ${
                isRecent ? "border-green-500 bg-green-950/30" : "border-[#1e2450]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{reg.peserta.nama}</p>
                  <p className="font-mono text-xs text-gray-400">{reg.peserta.noWa}</p>
                  {reg.peserta.domisili && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{reg.peserta.domisili}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isHadir ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {reg.status}
                  </span>
                  {isHadir ? (
                    reg.waktuHadir && (
                      <span className="text-xs text-green-400">
                        {new Date(reg.waktuHadir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )
                  ) : (
                    <button
                      onClick={() => handleConfirm(reg.id)}
                      disabled={confirming === reg.id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      {confirming === reg.id ? "..." : "Konfirmasi Hadir"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
