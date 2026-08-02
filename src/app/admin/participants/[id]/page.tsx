"use client";

import { useEffect, useState, use, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Registrasi {
  id: string;
  status: string;
  waktuDaftar: string;
  waktuHadir: string | null;
  event: {
    id: string;
    nama: string;
    slug: string;
    status: string;
    tanggalMulai: string;
  };
}

interface PesertaDetail {
  id: string;
  noWa: string;
  nama: string;
  domisili: string | null;
  namaBisnis: string | null;
  statusKeanggotaan: string | null;
  sumberInformasi: string | null;
  createdAt: string;
  registrasi: Registrasi[];
}

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [peserta, setPeserta] = useState<PesertaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchPeserta = () =>
    fetch(`/api/peserta/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Gagal memuat peserta");
        return data;
      })
      .then(setPeserta)
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchPeserta();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setToast("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/peserta/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: fd.get("nama"),
          domisili: fd.get("domisili"),
          namaBisnis: fd.get("namaBisnis"),
          statusKeanggotaan: fd.get("statusKeanggotaan"),
          sumberInformasi: fd.get("sumberInformasi"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan");
      setToast("Data peserta diperbarui");
      fetchPeserta();
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Gagal menyimpan perubahan");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !peserta) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/participants")}
          className="text-gray-400 hover:text-white cursor-pointer"
        >
          &larr;
        </button>
        <div><p className="eyebrow mb-1">Profil peserta</p><h1 className="text-2xl font-bold tracking-tight">{peserta.nama}</h1></div>
        {toast && (
          <div
            className={`fixed right-6 top-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-xl ${
              toast.includes("diperbarui")
                ? "border-green-500/40 bg-green-950 text-green-300"
                : "border-red-500/40 bg-red-950 text-red-300"
            }`}
            role="status"
          >
            {toast}
          </div>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-[#718096]">Detail peserta</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">No WhatsApp</dt>
              <dd className="font-mono text-xs">{peserta.noWa}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Nama</dt>
              <dd>{peserta.nama}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Domisili</dt>
              <dd>{peserta.domisili || "-"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Nama Bisnis</dt>
              <dd>{peserta.namaBisnis || "-"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status Keanggotaan</dt>
              <dd>
                {peserta.statusKeanggotaan ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {peserta.statusKeanggotaan}
                  </span>
                ) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Sumber Informasi</dt>
              <dd>{peserta.sumberInformasi || "-"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Terdaftar</dt>
              <dd className="text-gray-400 text-xs">{new Date(peserta.createdAt).toLocaleString("id-ID")}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="admin-card space-y-4 p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#718096]">Edit data peserta</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nama</label>
            <input
              name="nama"
              defaultValue={peserta.nama}
              required
             className="admin-input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Domisili</label>
            <input
              name="domisili"
              defaultValue={peserta.domisili || ""}
               className="admin-input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nama Bisnis</label>
            <input
              name="namaBisnis"
              defaultValue={peserta.namaBisnis || ""}
               className="admin-input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status Keanggotaan</label>
            <select
              name="statusKeanggotaan"
              defaultValue={peserta.statusKeanggotaan || ""}
               className="admin-input"
            >
              <option value="">(tidak ada)</option>
              <option value="Umum">Umum</option>
              <option value="Muda Juara">Muda Juara</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sumber Informasi</label>
            <input
              name="sumberInformasi"
              defaultValue={peserta.sumberInformasi || ""}
               className="admin-input"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
             className="primary-button cursor-pointer disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="border-b border-[#edf0f4] p-4">
          <h2 className="text-sm font-medium">Riwayat Event ({peserta.registrasi.length})</h2>
        </div>
        {peserta.registrasi.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">Belum ada riwayat event.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2450] text-gray-400 text-left">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Waktu Hadir</th>
                </tr>
              </thead>
              <tbody>
                {peserta.registrasi.map((reg) => (
                  <tr key={reg.id} className="border-b border-[#1e2450]/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/events/${reg.event.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        {reg.event.nama}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(reg.event.tanggalMulai)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          reg.status === "HADIR"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {reg.waktuHadir ? new Date(reg.waktuHadir).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
