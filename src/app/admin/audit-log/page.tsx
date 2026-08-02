"use client";

import { useEffect, useState, useCallback } from "react";

interface AuditLog {
  id: string;
  adminNama: string | null;
  aksi: string;
  entitas: string;
  entitasId: string | null;
  detail: unknown;
  createdAt: string;
}

const ENTITAS_OPTIONS = [
  "Admin",
  "Event",
  "EventQuestion",
  "Peserta",
  "Registrasi",
  "Notif",
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entitas, setEntitas] = useState("");
  const [limit, setLimit] = useState(100);

  const fetchLogs = useCallback(
    async (currentEntitas: string, currentLimit: number) => {
      try {
        const params = new URLSearchParams();
        if (currentEntitas) params.set("entitas", currentEntitas);
        params.set("limit", String(currentLimit));
        const res = await fetch(`/api/audit-logs?${params.toString()}`, { cache: "no-store" });
        if (res.ok) setLogs(await res.json());
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLogs(entitas, limit);
  }, [entitas, limit, fetchLogs]);

  const handleLoadMore = () => {
    setLimit((l) => l + 50);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow mb-2">Jejak aktivitas</p><h1 className="text-2xl font-bold tracking-tight">Audit log</h1><p className="mt-1 text-sm text-[#718096]">Riwayat perubahan dan aktivitas admin.</p></div>
        <select
          className="admin-input w-full sm:w-auto"
          value={entitas}
          onChange={(e) => {
            setLimit(100);
            setEntitas(e.target.value);
          }}
        >
          <option value="">Semua</option>
          {ENTITAS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">Tidak ada log.</p>
      ) : (
           <div className="admin-card hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-[#0a0e27] text-gray-400">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Waktu</th>
                <th className="text-left px-4 py-3 font-medium">Admin</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
                <th className="text-left px-4 py-3 font-medium">Entitas</th>
                <th className="text-left px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const detailStr = log.detail ? JSON.stringify(log.detail, null, 2) : "-";
                return (
                  <tr key={log.id} className="border-t border-[#1e2450] align-top">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{log.adminNama || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.aksi}</td>
                    <td className="px-4 py-3">{log.entitas}</td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-gray-400 max-w-xs truncate"
                      title={detailStr}
                    >
                      {detailStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
         </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="grid gap-3 md:hidden">
          {logs.map((log) => {
            const detailStr = log.detail ? JSON.stringify(log.detail, null, 2) : "-";
            return (
              <article key={log.id} className="admin-card p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{log.aksi}</p><p className="mt-1 text-xs text-[#718096]">{new Date(log.createdAt).toLocaleString("id-ID")}</p></div><span className="rounded-full bg-[#e8f4f7] px-2 py-1 text-[11px] font-bold text-[#176b87]">{log.entitas}</span></div>
                <p className="mt-3 text-sm text-[#526176]">Admin: {log.adminNama || "-"}</p>
                <p className="mt-2 break-words font-mono text-xs text-[#718096]">{detailStr}</p>
              </article>
            );
          })}
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Muat lebih banyak
          </button>
        </div>
      )}
    </div>
  );
}
