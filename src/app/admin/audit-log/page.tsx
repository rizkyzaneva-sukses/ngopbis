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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Audit Log</h1>
        <select
          className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
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
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl overflow-hidden">
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
