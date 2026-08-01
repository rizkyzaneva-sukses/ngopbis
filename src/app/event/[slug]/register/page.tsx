"use client";

import { useEffect, useState, use, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventQuestion {
  id: string;
  label: string;
  tipe: string;
  opsiJawaban: string[] | null;
  wajib: boolean;
}

interface EventData {
  id: string;
  nama: string;
  slug: string;
  warnaAksen: string;
  kuota: number | null;
  status: string;
  totalRegistrasi: number;
  questions: EventQuestion[];
}

export default function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [noWa, setNoWa] = useState("");
  const [nama, setNama] = useState("");
  const [domisili, setDomisili] = useState("");
  const [namaBisnis, setNamaBisnis] = useState("");
  const [statusKeanggotaan, setStatusKeanggotaan] = useState("");
  const [sumberInformasi, setSumberInformasi] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [showAutoFilledFields, setShowAutoFilledFields] = useState(false);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/events/public/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleNoWaBlur = async () => {
    if (noWa.length < 10) return;
    const res = await fetch("/api/peserta/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noWa }),
    });
    const data = await res.json();
    if (data.found) {
      setNama(data.nama || "");
      setDomisili(data.domisili || "");
      setNamaBisnis(data.namaBisnis || "");
      setStatusKeanggotaan(data.statusKeanggotaan || "");
      setSumberInformasi(data.sumberInformasi || "");
      setAutoFilled(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const jawabanKustom = event?.questions.map((q) => ({
      eventQuestionId: q.id,
      nilai: customAnswers[q.id] || "",
    })).filter((j) => j.nilai) || [];

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventSlug: slug,
        noWa,
        nama,
        domisili,
        namaBisnis,
        statusKeanggotaan,
        sumberInformasi,
        jawabanKustom,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Pendaftaran gagal");
      return;
    }

    router.push(`/event/${slug}/thankyou`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!event || event.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Pendaftaran Tidak Tersedia</h1>
          <p className="text-gray-500 mt-2">Event belum dibuka atau sudah ditutup.</p>
        </div>
      </div>
    );
  }

  const isQuotaFull = event.kuota !== null && event.totalRegistrasi >= event.kuota;
  if (isQuotaFull) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-yellow-800">Kuota Penuh</h1>
          <p className="text-gray-500 mt-2">Maaf, kuota pendaftaran sudah penuh.</p>
          <Link href={`/event/${slug}`} className="text-sm mt-4 inline-block hover:underline" style={{ color: event.warnaAksen }}>
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          href={`/event/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke info event
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Form Pendaftaran</h1>
          <p className="text-sm text-gray-500 mb-6">{event.nama}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">No WhatsApp <span className="text-red-500">*</span></label>
              <input
                value={noWa}
                onChange={(e) => setNoWa(e.target.value)}
                onBlur={handleNoWaBlur}
                placeholder="08xxxxxxxxxx"
                required
                className={inputClass}
              />
              {autoFilled && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Data ditemukan dari pendaftaran sebelumnya
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} required className={inputClass} />
            </div>

            {autoFilled && !showAutoFilledFields ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-700">Data profil terisi otomatis</p>
                  <button
                    type="button"
                    onClick={() => setShowAutoFilledFields(true)}
                    className="text-xs font-medium hover:underline"
                    style={{ color: event.warnaAksen }}
                  >
                    Edit data
                  </button>
                </div>
                <div className="mt-1.5 text-xs text-green-600 space-y-0.5">
                  {domisili && <p>Domisili: {domisili}</p>}
                  {namaBisnis && <p>Bisnis: {namaBisnis}</p>}
                  {statusKeanggotaan && <p>Status: {statusKeanggotaan}</p>}
                  {sumberInformasi && <p>Sumber info: {sumberInformasi}</p>}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Domisili</label>
                  <input value={domisili} onChange={(e) => setDomisili(e.target.value)} placeholder="Kota / Kabupaten" className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Bisnis</label>
                  <input value={namaBisnis} onChange={(e) => setNamaBisnis(e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Keanggotaan</label>
                  <select value={statusKeanggotaan} onChange={(e) => setStatusKeanggotaan(e.target.value)} className={inputClass}>
                    <option value="">Pilih</option>
                    <option value="Umum">Umum</option>
                    <option value="Muda Juara">Muda Juara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sumber Informasi</label>
                  <input value={sumberInformasi} onChange={(e) => setSumberInformasi(e.target.value)} placeholder="Dari mana Anda tahu event ini?" className={inputClass} />
                </div>
              </>
            )}

            {event.questions.length > 0 && (
              <div className="border-t border-gray-200 pt-5 space-y-5">
                {event.questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {q.label} {q.wajib && <span className="text-red-500">*</span>}
                    </label>
                    {q.tipe === "TEXT" && (
                      <input
                        value={customAnswers[q.id] || ""}
                        onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                        required={q.wajib}
                        className={inputClass}
                      />
                    )}
                    {q.tipe === "NUMBER" && (
                      <input
                        type="number"
                        value={customAnswers[q.id] || ""}
                        onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                        required={q.wajib}
                        className={inputClass}
                      />
                    )}
                    {(q.tipe === "SINGLE_CHOICE" || q.tipe === "DROPDOWN") && q.opsiJawaban && (
                      <select
                        value={customAnswers[q.id] || ""}
                        onChange={(e) => setCustomAnswers({ ...customAnswers, [q.id]: e.target.value })}
                        required={q.wajib}
                        className={inputClass}
                      >
                        <option value="">Pilih</option>
                        {(q.opsiJawaban as unknown as string[]).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {q.tipe === "MULTIPLE_CHOICE" && q.opsiJawaban && (
                      <div className="space-y-2 mt-1">
                        {(q.opsiJawaban as unknown as string[]).map((opt) => {
                          const current = customAnswers[q.id] ? customAnswers[q.id].split(",") : [];
                          return (
                            <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={current.includes(opt)}
                                onChange={(e) => {
                                  const updated = e.target.checked ? [...current, opt] : current.filter((v) => v !== opt);
                                  setCustomAnswers({ ...customAnswers, [q.id]: updated.join(",") });
                                }}
                                className="cursor-pointer rounded"
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {q.tipe === "FILE_UPLOAD" && (
                      <div>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              setError("Ukuran file maksimal 5MB");
                              return;
                            }
                            setUploading((prev) => ({ ...prev, [q.id]: true }));
                            const fd = new FormData();
                            fd.append("file", file);
                            try {
                              const res = await fetch("/api/upload", { method: "POST", body: fd });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error);
                              setCustomAnswers((prev) => ({ ...prev, [q.id]: data.url }));
                            } catch (err: unknown) {
                              setError(err instanceof Error ? err.message : "Upload gagal");
                            } finally {
                              setUploading((prev) => ({ ...prev, [q.id]: false }));
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                        />
                        {uploading[q.id] && <p className="text-xs text-gray-500 mt-1">Mengupload...</p>}
                        {customAnswers[q.id] && !uploading[q.id] && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            File berhasil diupload
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 mt-2"
              style={{ backgroundColor: event.warnaAksen }}
            >
              {submitting ? "Mendaftarkan..." : "Kirim Pendaftaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
