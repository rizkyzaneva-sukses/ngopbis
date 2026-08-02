"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      nama: formData.get("nama"),
      slug: formData.get("slug") || undefined,
      deskripsi: formData.get("deskripsi"),
      lokasi: formData.get("lokasi"),
      googleMapsUrl: formData.get("googleMapsUrl") || undefined,
      bannerUrl: bannerUrl || undefined,
      tanggalMulai: formData.get("tanggalMulai"),
      tanggalSelesai: formData.get("tanggalSelesai") || undefined,
      warnaAksen: formData.get("warnaAksen") || "#2563eb",
      kuota: formData.get("kuota") || undefined,
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal membuat event");
      return;
    }

    router.push(`/admin/events/${data.id}`);
  };

  return (
    <div className="max-w-2xl">
      <p className="eyebrow mb-2">Workspace event</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Buat event baru</h1>
      <p className="mb-7 text-sm text-[#718096]">Siapkan informasi dasar event sebelum dibagikan ke peserta.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-[#f0caca] bg-[#fff6f6] px-4 py-3 text-sm text-[#a94242]">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nama Event *</label>
          <input name="nama" required className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Slug (opsional, auto-generate)</label>
          <input name="slug" placeholder="contoh: seminar-bisnis-2024" className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tanggal Mulai *</label>
            <input name="tanggalMulai" type="datetime-local" required className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tanggal Selesai</label>
            <input name="tanggalSelesai" type="datetime-local" className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Lokasi</label>
          <input name="lokasi" className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Link Google Maps</label>
          <input name="googleMapsUrl" placeholder="https://maps.google.com/..." className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Flyer / Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) { setError("Ukuran file maksimal 5MB"); return; }
              setUploadingBanner(true);
              const fd = new FormData();
              fd.append("file", file);
              try {
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setBannerUrl(data.url);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Upload gagal");
              } finally {
                setUploadingBanner(false);
              }
            }}
            className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
          />
          {uploadingBanner && <p className="text-xs text-gray-500 mt-1">Mengupload...</p>}
          {bannerUrl && (
            <img src={bannerUrl} alt="Preview" className="mt-2 max-h-32 rounded-lg" />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
          <textarea name="deskripsi" rows={4} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Warna Aksen</label>
            <input name="warnaAksen" type="color" defaultValue="#2563eb" className="h-10 w-full bg-[#111638] border border-[#1e2450] rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Kuota (kosongkan = unlimited)</label>
            <input name="kuota" type="number" min="1" className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <button type="submit" disabled={loading} className="primary-button cursor-pointer disabled:opacity-50">
            {loading ? "Menyimpan..." : "Buat Event"}
          </button>
          <button type="button" onClick={() => router.back()} className="secondary-button cursor-pointer">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
