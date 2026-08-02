"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Peserta {
  id: string;
  noWa: string;
  nama: string;
  domisili: string | null;
  namaBisnis: string | null;
  statusKeanggotaan: string | null;
  sumberInformasi: string | null;
  createdAt: string;
  totalEvent: number;
  totalHadir: number;
}

export default function ParticipantsPage() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [domisili, setDomisili] = useState("");
  const [status, setStatus] = useState("");

  const fetchPeserta = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (domisili) params.set("domisili", domisili);
    if (status) params.set("statusKeanggotaan", status);
    fetch(`/api/peserta?${params.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { setPeserta(Array.isArray(data) ? data : []); setLoading(false); });
  }, [q, domisili, status]);

  useEffect(() => {
    fetchPeserta();
  }, [fetchPeserta]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow mb-2">Database terpusat</p><h1 className="text-2xl font-bold tracking-tight">Peserta</h1><p className="mt-1 text-sm text-[#718096]">Kelola profil dan riwayat kehadiran peserta.</p></div>
        <Link
          href="/api/peserta/export"
          target="_blank"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#147d64] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f654f]"
        >
          Export Excel
        </Link>
      </div>

      <div className="admin-card mb-6 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / No WA..."
            className="admin-input"
          />
          <input
            value={domisili}
            onChange={(e) => setDomisili(e.target.value)}
            placeholder="Domisili..."
            className="admin-input"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-input"
          >
            <option value="">Semua Status</option>
            <option value="Umum">Umum</option>
            <option value="Muda Juara">Muda Juara</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : peserta.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Tidak ada peserta ditemukan.</p>
        </div>
      ) : (
        <div className="admin-card hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#edf0f4] text-left text-[#718096]">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">No WA</th>
                <th className="px-4 py-3">Domisili</th>
                <th className="px-4 py-3">Bisnis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Total Event</th>
                <th className="px-4 py-3 text-center">Total Hadir</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {peserta.map((p) => (
                <tr key={p.id} className="border-b border-[#edf0f4] hover:bg-[#f8fbfc]">
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.noWa}</td>
                  <td className="px-4 py-3 text-[#718096]">{p.domisili || "-"}</td>
                  <td className="px-4 py-3 text-[#718096]">{p.namaBisnis || "-"}</td>
                  <td className="px-4 py-3">
                    {p.statusKeanggotaan && (
                      <span className="rounded-full bg-[#e8f4f7] px-2 py-0.5 text-xs font-semibold text-[#176b87]">
                        {p.statusKeanggotaan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{p.totalEvent}</td>
                  <td className="px-4 py-3 text-center font-semibold text-[#147d64]">{p.totalHadir}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/participants/${p.id}`}
                      className="cursor-pointer text-xs font-semibold text-[#176b87] hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && peserta.length > 0 && (
        <div className="grid gap-3 md:hidden">
          {peserta.map((p) => (
            <Link key={p.id} href={`/admin/participants/${p.id}`} className="admin-card block p-4 transition hover:border-[#a6d2d9]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="truncate font-bold text-[#152238]">{p.nama}</p><p className="mt-1 font-mono text-xs text-[#718096]">{p.noWa}</p></div>
                {p.statusKeanggotaan && <span className="rounded-full bg-[#e8f4f7] px-2.5 py-1 text-[11px] font-bold text-[#176b87]">{p.statusKeanggotaan}</span>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf0f4] pt-3 text-xs">
                <div><p className="text-[#8a98a8]">Domisili</p><p className="mt-1 font-semibold text-[#526176]">{p.domisili || "-"}</p></div>
                <div><p className="text-[#8a98a8]">Partisipasi</p><p className="mt-1 font-semibold text-[#526176]">{p.totalEvent} event <span className="text-[#147d64]">/ {p.totalHadir} hadir</span></p></div>
              </div>
              <p className="mt-4 text-xs font-bold text-[#176b87]">Lihat detail peserta</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
