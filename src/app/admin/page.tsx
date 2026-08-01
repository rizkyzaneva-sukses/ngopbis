"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface UpcomingEvent {
  id: string;
  nama: string;
  slug: string;
  lokasi: string | null;
  status: string;
  tanggalMulai: string;
  kuota: number | null;
  _count: { registrasi: number };
}

interface RecentReg {
  id: string;
  waktuDaftar: string;
  peserta: { nama: string; noWa: string };
  event: { nama: string };
}

interface BreakdownItem {
  label: string;
  count: number;
}

interface DashboardData {
  totalEvent: number;
  activeEvent: number;
  totalPeserta: number;
  totalRegistrasi: number;
  totalHadir: number;
  attendanceRate: number;
  perDay: { date: string; count: number }[];
  upcoming: UpcomingEvent[];
  recent: RecentReg[];
  breakdown: {
    domisili: BreakdownItem[];
    statusKeanggotaan: BreakdownItem[];
    sumberInformasi: BreakdownItem[];
  };
}

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  PUBLISHED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-yellow-500/20 text-yellow-400",
  SELESAI: "bg-blue-500/20 text-blue-400",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function BreakdownPanel({ title, items }: { title: string; items: BreakdownItem[] }) {
  const max = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 0;
  return (
    <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada data.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm">
                <span className="truncate text-gray-300 pr-2">{item.label}</span>
                <span className="text-gray-400">{item.count}</span>
              </div>
              <div className="h-1.5 bg-[#1e2450] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${max > 0 ? (item.count / max) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat dashboard");
        return r.json();
      })
      .then((d: DashboardData) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }
  if (error || !data) {
    return (
      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
        <p className="text-red-400">{error || "Gagal memuat dashboard"}</p>
      </div>
    );
  }

  const maxDay = Math.max(...data.perDay.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/events/new"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Buat Event
          </Link>
          <Link
            href="/admin/participants"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Manajemen Peserta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Event" value={data.totalEvent} />
        <StatCard label="Event Aktif" value={data.activeEvent} />
        <StatCard label="Total Peserta" value={data.totalPeserta} />
        <StatCard label="Total Pendaftar" value={data.totalRegistrasi} />
        <StatCard label="Total Hadir" value={data.totalHadir} />
        <StatCard label="Kehadiran" value={`${data.attendanceRate}%`} />
      </div>

      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-4">Pendaftar 14 Hari Terakhir</h2>
        {data.perDay.every((d) => d.count === 0) ? (
          <p className="text-gray-500 text-sm py-8 text-center">Belum ada pendaftar dalam 14 hari terakhir.</p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {data.perDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-blue-500 hover:bg-blue-400 rounded-t transition-colors"
                  style={{ height: `${(d.count / maxDay) * 100}%` }}
                  title={`${d.date}: ${d.count} pendaftar`}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(d.date).toLocaleDateString("id-ID", { day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
          <h2 className="font-semibold mb-4">Event Terdekat</h2>
          {data.upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada event terdekat.</p>
          ) : (
            <div className="space-y-3">
              {data.upcoming.map((event) => {
                const count = event._count.registrasi;
                const pct = event.kuota && event.kuota > 0 ? Math.min((count / event.kuota) * 100, 100) : 0;
                return (
                  <div key={event.id} className="border border-[#1e2450] rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{event.nama}</p>
                        <p className="text-gray-400 text-sm">{formatDate(event.tanggalMulai)}</p>
                        {event.lokasi && <p className="text-gray-500 text-xs">{event.lokasi}</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColor[event.status] || ""}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>
                          {count} / {event.kuota ?? "Tanpa Kuota"}
                        </span>
                        {event.kuota && <span>{Math.round(pct)}%</span>}
                      </div>
                      <div className="h-1.5 bg-[#1e2450] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${event.kuota ? pct : count > 0 ? 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
          <h2 className="font-semibold mb-4">Aktivitas Terbaru</h2>
          {data.recent.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada aktivitas.</p>
          ) : (
            <div className="space-y-3">
              {data.recent.map((reg) => (
                <div key={reg.id} className="flex items-start gap-3 border-b border-[#1e2450] pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{reg.peserta.nama}</span> mendaftar di{" "}
                      <span className="text-blue-400">{reg.event.nama}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(reg.waktuDaftar).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <BreakdownPanel title="Domisili" items={data.breakdown.domisili} />
        <BreakdownPanel title="Status Keanggotaan" items={data.breakdown.statusKeanggotaan} />
        <BreakdownPanel title="Sumber Informasi" items={data.breakdown.sumberInformasi} />
      </div>
    </div>
  );
}
