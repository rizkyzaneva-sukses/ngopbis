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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Database Peserta</h1>
        <Link
          href="/api/peserta/export"
          target="_blank"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Export Excel
        </Link>
      </div>

      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / No WA..."
            className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            value={domisili}
            onChange={(e) => setDomisili(e.target.value)}
            placeholder="Domisili..."
            className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
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
        <div className="overflow-x-auto bg-[#111638] border border-[#1e2450] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2450] text-gray-400 text-left">
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
                <tr key={p.id} className="border-b border-[#1e2450]/50 hover:bg-[#0a0e27]/40">
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.noWa}</td>
                  <td className="px-4 py-3 text-gray-400">{p.domisili || "-"}</td>
                  <td className="px-4 py-3 text-gray-400">{p.namaBisnis || "-"}</td>
                  <td className="px-4 py-3">
                    {p.statusKeanggotaan && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {p.statusKeanggotaan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{p.totalEvent}</td>
                  <td className="px-4 py-3 text-center text-green-400">{p.totalHadir}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/participants/${p.id}`}
                      className="text-blue-400 hover:underline text-xs cursor-pointer"
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
    </div>
  );
}
