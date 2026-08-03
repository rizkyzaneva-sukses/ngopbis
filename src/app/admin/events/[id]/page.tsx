"use client";

import { useEffect, useState, use, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownEditor from "@/components/MarkdownEditor";
import { toDatetimeLocalWib } from "@/lib/utils";

interface EventQuestion {
  id: string;
  label: string;
  tipe: string;
  opsiJawaban: string[] | null;
  wajib: boolean;
  urutan: number;
}

interface EventData {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  lokasi: string | null;
  googleMapsUrl: string | null;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  bannerUrl: string | null;
  warnaAksen: string;
  kuota: number | null;
  status: string;
  thankYouConfig: { heading?: string; message?: string; imageUrl?: string } | null;
  questions: EventQuestion[];
  _count: { registrasi: number };
}

interface Registrasi {
  id: string;
  status: string;
  waktuDaftar: string;
  waktuHadir: string | null;
  peserta: { noWa: string; nama: string; domisili: string | null; namaBisnis: string | null; statusKeanggotaan: string | null; sumberInformasi: string | null };
  jawaban: Array<{ nilai: string; eventQuestion: { label: string } }>;
}

type Tab = "detail" | "questions" | "thankyou" | "notifikasi" | "checkin_qr" | "registrations" | "report";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registrasi[]>([]);
  const [tab, setTab] = useState<Tab>("detail");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const fetchEvent = () =>
    fetch(`/api/events/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Gagal memuat event");
        return data;
      })
      .then((data) => { setEvent(data); setBannerUrl(data.bannerUrl); })
      .finally(() => setLoading(false));

  const fetchRegistrations = () =>
    fetch(`/api/events/${id}/registrations`)
      .then((r) => r.json())
      .then((data) => setRegistrations(data));

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (tab === "registrations" || tab === "report") fetchRegistrations();
  }, [tab, id]);

  if (loading || !event) return <p className="text-gray-400">Loading...</p>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "detail", label: "Detail" },
    { key: "questions", label: "Pertanyaan Kustom" },
    { key: "thankyou", label: "Thank You" },
    { key: "notifikasi", label: "Notifikasi WA" },
    { key: "checkin_qr", label: "QR Check-in" },
    { key: "registrations", label: `Peserta (${event._count.registrasi})` },
    { key: "report", label: "Laporan" },
  ];

  const updateEvent = async (data: Record<string, unknown>, redirectAfterSave = false) => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan perubahan");

      setEvent((current) => current ? { ...current, ...result } : result);
      setBannerUrl(result.bannerUrl);
      setMsg("Perubahan event berhasil diperbarui");
      if (redirectAfterSave) {
        setTimeout(() => router.push("/admin/events"), 800);
      } else {
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDetailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateEvent({
      nama: fd.get("nama"),
      slug: fd.get("slug"),
      deskripsi: fd.get("deskripsi"),
      lokasi: fd.get("lokasi"),
      googleMapsUrl: fd.get("googleMapsUrl") || null,
      bannerUrl: bannerUrl || null,
      tanggalMulai: fd.get("tanggalMulai"),
      tanggalSelesai: fd.get("tanggalSelesai") || null,
      warnaAksen: fd.get("warnaAksen"),
      kuota: fd.get("kuota") || null,
    }, true);
  };

  const handleStatusChange = (status: string) => updateEvent({ status });

  const handleManualCheckin = async (registrasiId: string) => {
    await fetch(`/api/events/${id}/registrations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrasiId, status: "HADIR" }),
    });
    fetchRegistrations();
  };

  const handleExport = () => {
    window.open(`/api/events/${id}/registrations/export`, "_blank");
  };

  const hadirCount = registrations.filter((r) => r.status === "HADIR").length;

  return (
    <div>
       <div className="mb-6 flex flex-wrap items-start gap-3">
        <button onClick={() => router.push("/admin/events")} className="text-gray-400 hover:text-white cursor-pointer">&larr;</button>
         <div className="min-w-0"><p className="eyebrow mb-1">Detail event</p><h1 className="truncate text-2xl font-bold tracking-tight">{event.nama}</h1></div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          event.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" :
          event.status === "CLOSED" ? "bg-yellow-500/20 text-yellow-400" :
          event.status === "SELESAI" ? "bg-blue-500/20 text-blue-400" :
          "bg-gray-500/20 text-gray-400"
        }`}>{event.status}</span>
        {msg && (
           <div className={`fixed left-4 right-4 top-20 z-50 rounded-lg border px-4 py-3 text-sm shadow-xl sm:left-auto sm:right-6 sm:top-6 ${
            msg.includes("berhasil") ? "border-green-500/40 bg-green-950 text-green-300" : "border-red-500/40 bg-red-950 text-red-300"
          }`} role="status">
            {msg}
          </div>
        )}
      </div>

       <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link href={`/event/${event.slug}`} target="_blank" className="text-blue-400 hover:underline font-mono">
          /event/{event.slug}
        </Link>
        <span className="text-gray-600">|</span>
        {["DRAFT", "PUBLISHED", "CLOSED", "SELESAI"].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={event.status === s}
            className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${event.status === s ? "bg-blue-600 text-white" : "bg-[#1e2450] text-gray-400 hover:text-white"}`}
          >
            {s}
          </button>
        ))}
      </div>

       <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#dce6ed] pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
             className={`whitespace-nowrap px-3 py-2 text-sm transition-colors cursor-pointer ${tab === t.key ? "border-b-2 border-[#176b87] font-semibold text-[#176b87]" : "text-[#718096] hover:text-[#152238]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "detail" && (
         <form onSubmit={handleDetailSubmit} className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nama Event</label>
            <input name="nama" defaultValue={event.nama} required className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Slug</label>
            <input name="slug" defaultValue={event.slug} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 font-mono" />
          </div>
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tanggal Mulai</label>
              <input name="tanggalMulai" type="datetime-local" defaultValue={toDatetimeLocalWib(event.tanggalMulai)} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              <p className="mt-1 text-[11px] text-gray-500">Waktu dalam WIB (UTC+7)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tanggal Selesai</label>
              <input name="tanggalSelesai" type="datetime-local" defaultValue={toDatetimeLocalWib(event.tanggalSelesai)} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              <p className="mt-1 text-[11px] text-gray-500">Waktu dalam WIB (UTC+7)</p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Lokasi</label>
            <input name="lokasi" defaultValue={event.lokasi || ""} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Link Google Maps</label>
            <input name="googleMapsUrl" defaultValue={event.googleMapsUrl || ""} placeholder="https://maps.google.com/..." className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Flyer / Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { setMsg("Ukuran file maksimal 5MB"); return; }
                setUploadingBanner(true);
                const fd = new FormData();
                fd.append("file", file);
                try {
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error);
                  setBannerUrl(data.url);
                } catch {
                  setMsg("Upload gagal");
                } finally {
                  setUploadingBanner(false);
                }
              }}
              className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            />
            {uploadingBanner && <p className="text-xs text-gray-500 mt-1">Mengupload...</p>}
            {bannerUrl && (
              <div className="mt-2 relative inline-block">
                 <img src={bannerUrl} alt="Preview" className="block h-auto max-w-full rounded-lg object-contain" />
                <button
                  type="button"
                  onClick={() => setBannerUrl(null)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
           <MarkdownEditor name="deskripsi" defaultValue={event.deskripsi} rows={7} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Warna Aksen</label>
              <input name="warnaAksen" type="color" defaultValue={event.warnaAksen} className="h-10 w-full bg-[#111638] border border-[#1e2450] rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Kuota</label>
              <input name="kuota" type="number" min="1" defaultValue={event.kuota || ""} className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      )}

      {tab === "questions" && <QuestionsTab eventId={id} questions={event.questions} onRefresh={fetchEvent} />}

      {tab === "thankyou" && (
        <ThankYouTab eventId={id} config={event.thankYouConfig} onSave={updateEvent} saving={saving} />
      )}

      {tab === "notifikasi" && <NotifTab eventId={id} />}

      {tab === "checkin_qr" && <CheckinQRTab slug={event.slug} eventNama={event.nama} eventId={id} />}

      {tab === "registrations" && (
        <div>
           <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">{registrations.length} peserta terdaftar, {hadirCount} hadir</p>
            <button onClick={handleExport} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">
              Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2450] text-gray-400 text-left">
                  <th className="pb-2 pr-4">No WA</th>
                  <th className="pb-2 pr-4">Nama</th>
                  <th className="pb-2 pr-4">Domisili</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Waktu Daftar</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-[#1e2450]/50">
                    <td className="py-2 pr-4 font-mono text-xs">{reg.peserta.noWa}</td>
                    <td className="py-2 pr-4">{reg.peserta.nama}</td>
                    <td className="py-2 pr-4 text-gray-400">{reg.peserta.domisili}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${reg.status === "HADIR" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{new Date(reg.waktuDaftar).toLocaleString("id-ID")}</td>
                    <td className="py-2">
                      {reg.status !== "HADIR" && (
                        <button onClick={() => handleManualCheckin(reg.id)} className="text-xs text-blue-400 hover:underline cursor-pointer">
                          Manual Check-in
                        </button>
                      )}
                      {reg.status === "HADIR" && reg.waktuHadir && (
                        <span className="text-xs text-gray-500">
                          {new Date(reg.waktuHadir).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "report" && (
        <ReportTab registrations={registrations} event={event} />
      )}
    </div>
  );
}

function QuestionsTab({ eventId, questions, onRefresh }: { eventId: string; questions: EventQuestion[]; onRefresh: () => void }) {
  const [newLabel, setNewLabel] = useState("");
  const [newTipe, setNewTipe] = useState("TEXT");
  const [newWajib, setNewWajib] = useState(false);
  const [newOpsi, setNewOpsi] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editWajib, setEditWajib] = useState(false);
  const [editOpsi, setEditOpsi] = useState("");

  const tipeOptions = ["TEXT", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "NUMBER", "FILE_UPLOAD"];
  const needsOpsi = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(newTipe);
  const editNeedsOpsi = (tipe: string) => ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(tipe);

  const bulkUpdate = async (list: EventQuestion[]) => {
    await fetch(`/api/events/${eventId}/questions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questions: list.map((q, i) => ({
          id: q.id,
          label: q.label,
          tipe: q.tipe,
          opsiJawaban: q.opsiJawaban,
          wajib: q.wajib,
          urutan: i,
        })),
      }),
    });
    onRefresh();
  };

  const handleReorder = async (idx: number, dir: -1 | 1) => {
    const newOrder = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    await bulkUpdate(newOrder);
  };

  const handleDuplicate = async (q: EventQuestion) => {
    await fetch(`/api/events/${eventId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: `${q.label} (salinan)`,
        tipe: q.tipe,
        opsiJawaban: q.opsiJawaban,
        wajib: q.wajib,
        urutan: questions.length,
      }),
    });
    onRefresh();
  };

  const startEdit = (q: EventQuestion) => {
    setEditingId(q.id);
    setEditLabel(q.label);
    setEditWajib(q.wajib);
    setEditOpsi(q.opsiJawaban ? q.opsiJawaban.join(", ") : "");
  };

  const handleSaveEdit = async (q: EventQuestion, idx: number) => {
    const updated: EventQuestion = {
      ...q,
      label: editLabel,
      wajib: editWajib,
      opsiJawaban: editNeedsOpsi(q.tipe)
        ? editOpsi.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
    };
    const list = [...questions];
    list[idx] = updated;
    await bulkUpdate(list);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newLabel) return;
    setAdding(true);
    await fetch(`/api/events/${eventId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel,
        tipe: newTipe,
        wajib: newWajib,
        opsiJawaban: needsOpsi ? newOpsi.split(",").map((s) => s.trim()).filter(Boolean) : null,
        urutan: questions.length,
      }),
    });
    setNewLabel("");
    setNewOpsi("");
    setNewWajib(false);
    setAdding(false);
    onRefresh();
  };

  const handleDelete = async (questionId: string) => {
    await fetch(`/api/events/${eventId}/questions/${questionId}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 p-4 bg-[#111638] border border-[#1e2450] rounded-xl">
        <p className="text-sm text-gray-400 mb-3">6 pertanyaan wajib default (No WA, Nama, Domisili, Nama Bisnis, Status Keanggotaan, Sumber Informasi) selalu ada di semua event.</p>
        <p className="text-sm text-gray-400">Tambahkan pertanyaan kondisional khusus event ini di bawah:</p>
      </div>

      {questions.length > 0 && (
        <div className="space-y-2 mb-6">
          {questions.map((q, idx) => (
             <div key={q.id} className="flex flex-col gap-3 rounded-lg border border-[#edf0f4] bg-[#111638] p-3 sm:flex-row sm:items-center">
              <span className="text-gray-500 text-xs w-6">{idx + 1}.</span>
              {editingId === q.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Label pertanyaan"
                    className="w-full bg-[#0a0e27] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  {editNeedsOpsi(q.tipe) && (
                    <input
                      value={editOpsi}
                      onChange={(e) => setEditOpsi(e.target.value)}
                      placeholder="Opsi jawaban (pisahkan dengan koma)"
                      className="w-full bg-[#0a0e27] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  )}
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={editWajib} onChange={(e) => setEditWajib(e.target.checked)} className="cursor-pointer" />
                    Wajib diisi
                  </label>
                </div>
              ) : (
                <div className="flex-1">
                  <span className="text-sm">{q.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{q.tipe}</span>
                  {q.wajib && <span className="text-xs text-red-400 ml-2">*wajib</span>}
                </div>
              )}
              {editingId === q.id ? (
                 <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                  <button onClick={() => handleSaveEdit(q, idx)} className="text-green-400 hover:text-green-300 text-xs cursor-pointer">Simpan</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300 text-xs cursor-pointer">Batal</button>
                </div>
              ) : (
                 <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                  <button onClick={() => handleReorder(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-white disabled:text-gray-700 text-xs cursor-pointer">&uarr;</button>
                  <button onClick={() => handleReorder(idx, 1)} disabled={idx === questions.length - 1} className="text-gray-400 hover:text-white disabled:text-gray-700 text-xs cursor-pointer">&darr;</button>
                  <button onClick={() => startEdit(q)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">Edit</button>
                  <button onClick={() => handleDuplicate(q)} className="text-yellow-400 hover:text-yellow-300 text-xs cursor-pointer">Duplikat</button>
                  <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-300 text-xs cursor-pointer">Hapus</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium mb-2">Tambah Pertanyaan</h3>
           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label pertanyaan"
            className="bg-[#0a0e27] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={newTipe}
            onChange={(e) => setNewTipe(e.target.value)}
            className="bg-[#0a0e27] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {tipeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {needsOpsi && (
          <input
            value={newOpsi}
            onChange={(e) => setNewOpsi(e.target.value)}
            placeholder="Opsi jawaban (pisahkan dengan koma)"
            className="w-full bg-[#0a0e27] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        )}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={newWajib} onChange={(e) => setNewWajib(e.target.checked)} className="cursor-pointer" />
            Wajib diisi
          </label>
          <button onClick={handleAdd} disabled={adding || !newLabel} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">
            {adding ? "Menambahkan..." : "Tambah"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThankYouTab({ eventId, config, onSave, saving }: { eventId: string; config: EventData["thankYouConfig"]; onSave: (data: Record<string, unknown>) => Promise<void>; saving: boolean }) {
  const [heading, setHeading] = useState(config?.heading || "Terima kasih telah mendaftar!");
  const [message, setMessage] = useState(config?.message || "Anda telah terdaftar. Simpan No WhatsApp Anda untuk check-in nanti di lokasi.");

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Heading</label>
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Pesan</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        onClick={() => onSave({ thankYouConfig: { heading, message } })}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}

function ReportTab({ registrations, event }: { registrations: Registrasi[]; event: EventData }) {
  const total = registrations.length;
  const hadir = registrations.filter((r) => r.status === "HADIR").length;

  const groupBy = (key: "domisili" | "statusKeanggotaan" | "sumberInformasi") => {
    const map: Record<string, number> = {};
    registrations.forEach((r) => {
      const val = r.peserta[key] || "(kosong)";
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-gray-400">Total Pendaftar</p>
        </div>
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{hadir}</p>
          <p className="text-sm text-gray-400">Hadir</p>
        </div>
        <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{total > 0 ? Math.round((hadir / total) * 100) : 0}%</p>
          <p className="text-sm text-gray-400">Kehadiran</p>
        </div>
      </div>

      {[
        { title: "Per Domisili", data: groupBy("domisili") },
        { title: "Per Status Keanggotaan", data: groupBy("statusKeanggotaan") },
        { title: "Per Sumber Informasi", data: groupBy("sumberInformasi") },
      ].map(({ title, data }) => (
        <div key={title} className="bg-[#111638] border border-[#1e2450] rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">{title}</h3>
          <div className="space-y-2">
            {data.map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 bg-[#0a0e27] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, backgroundColor: event.warnaAksen }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckinQRTab({ slug, eventNama, eventId }: { slug: string; eventNama: string; eventId: string }) {
  const checkinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/event/${slug}/checkin`
    : `/event/${slug}/checkin`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>QR Check-in - ${eventNama}</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        p { color: #666; font-size: 14px; margin-bottom: 24px; }
        .url { font-family: monospace; font-size: 12px; color: #999; word-break: break-all; }
        .instructions { margin-top: 32px; padding: 16px; border: 1px solid #ddd; border-radius: 8px; text-align: left; }
        .instructions h3 { font-size: 14px; margin-bottom: 8px; }
        .instructions ol { font-size: 13px; padding-left: 20px; }
        .instructions li { margin-bottom: 4px; }
      </style>
      </head>
      <body>
        <h1>${eventNama}</h1>
        <p>Scan QR code untuk check-in kehadiran</p>
        <div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinUrl)}" width="300" height="300" />
        </div>
        <p class="url">${checkinUrl}</p>
        <div class="instructions">
          <h3>Cara Check-in:</h3>
          <ol>
            <li>Scan QR code di atas pakai kamera HP</li>
            <li>Masukkan No WhatsApp yang didaftarkan</li>
            <li>Klik "Konfirmasi Hadir"</li>
          </ol>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/events/${eventId}/checkin`}
        className="block w-full text-center bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer mb-6"
      >
        Buka Mode Check-in Panitia
      </Link>
      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">QR Code Check-in</h3>
        <p className="text-sm text-gray-400 mb-6">
          Cetak dan pasang QR ini di meja registrasi. Peserta scan pakai HP untuk check-in.
        </p>

        <div className="bg-white rounded-xl p-6 inline-block mb-4">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkinUrl)}`}
            alt="QR Code Check-in"
            width={250}
            height={250}
          />
        </div>

        <p className="text-xs text-gray-500 font-mono mb-6 break-all">{checkinUrl}</p>

       <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cetak QR Code
          </button>
          <a
            href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(checkinUrl)}&format=png`}
            download={`qr-checkin-${slug}.png`}
            className="bg-[#1e2450] hover:bg-[#2a3060] px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Download PNG
          </a>
        </div>
      </div>

      <div className="mt-6 bg-[#111638] border border-[#1e2450] rounded-xl p-4">
        <h4 className="text-sm font-medium mb-3">Alur Check-in di Lokasi:</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Panitia pasang QR statis di meja registrasi</li>
          <li>Peserta datang, scan QR pakai HP sendiri (disupervisi panitia)</li>
          <li>Peserta input No WhatsApp yang didaftarkan</li>
          <li>Sistem tampilkan nama peserta untuk konfirmasi</li>
          <li>Peserta klik &quot;Konfirmasi Hadir&quot;</li>
          <li>Kalau nomor tidak ketemu, panitia bisa manual check-in dari tab Peserta</li>
        </ol>
      </div>
    </div>
  );
}

function NotifTab({ eventId }: { eventId: string }) {
  const [konfirmasiAktif, setKonfirmasiAktif] = useState(false);
  const [reminderAktif, setReminderAktif] = useState(false);
  const [templateKonfirmasi, setTemplateKonfirmasi] = useState("");
  const [templateReminder, setTemplateReminder] = useState("");
  const [wahaConfigured, setWahaConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/notif`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Gagal memuat notifikasi");
        setKonfirmasiAktif(data.konfirmasiAktif);
        setReminderAktif(data.reminderAktif);
        setTemplateKonfirmasi(data.templateKonfirmasi);
        setTemplateReminder(data.templateReminder);
        setWahaConfigured(data.wahaConfigured);
      })
      .catch((e) => setMsg(e instanceof Error ? e.message : "Gagal memuat notifikasi"))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/events/${eventId}/notif`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konfirmasiAktif, reminderAktif, templateKonfirmasi, templateReminder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setMsg("Pengaturan notifikasi disimpan");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminder = async () => {
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/events/${eventId}/reminder`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim reminder");
      setMsg(`Reminder terkirim: ${data.sent} berhasil, ${data.failed} gagal dari ${data.total} peserta`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal mengirim reminder");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <span className={`text-xs px-3 py-1 rounded-full ${wahaConfigured ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {wahaConfigured ? "WAHA Terhubung" : "WAHA belum dikonfigurasi"}
        </span>
        {msg && (
          <span className={`text-sm ${msg.includes("berhasil") || msg.includes("terkirim") ? "text-green-400" : "text-red-400"}`}>
            {msg}
          </span>
        )}
      </div>

      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={konfirmasiAktif} onChange={(e) => setKonfirmasiAktif(e.target.checked)} className="cursor-pointer" />
          <div>
            <span className="font-medium">Pesan Konfirmasi Otomatis</span>
            <p className="text-xs text-gray-500">Dikirim saat peserta selesai mendaftar</p>
          </div>
        </label>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Template Konfirmasi</label>
          <textarea
            value={templateKonfirmasi}
            onChange={(e) => setTemplateKonfirmasi(e.target.value)}
            rows={4}
            className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Variabel: {`{nama}`}, {`{event}`}, {`{tanggal}`}, {`{lokasi}`}</p>
        </div>
      </div>

      <div className="bg-[#111638] border border-[#1e2450] rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={reminderAktif} onChange={(e) => setReminderAktif(e.target.checked)} className="cursor-pointer" />
          <div>
            <span className="font-medium">Pesan Reminder Otomatis</span>
            <p className="text-xs text-gray-500">Dijadwalkan sebelum event dimulai</p>
          </div>
        </label>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Template Reminder</label>
          <textarea
            value={templateReminder}
            onChange={(e) => setTemplateReminder(e.target.value)}
            rows={4}
            className="w-full bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Variabel: {`{nama}`}, {`{event}`}, {`{tanggal}`}, {`{lokasi}`}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button onClick={handleSendReminder} disabled={sending || !wahaConfigured} className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          {sending ? "Mengirim..." : "Kirim Reminder Sekarang"}
        </button>
      </div>
    </div>
  );
}
