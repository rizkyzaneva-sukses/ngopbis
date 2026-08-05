"use client";

import { useEffect, useState, FormEvent } from "react";

type Status = "idle" | "loading" | "submitting" | "success" | "error";

export default function FeedbackForm({ slug }: { slug: string }) {
  const [eventName, setEventName] = useState("");
  const [warnaAksen, setWarnaAksen] = useState("#2563eb");
  const [noWa, setNoWa] = useState("");
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/events/public/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEventName(data.nama || "");
        setWarnaAksen(data.warnaAksen || "#2563eb");
      })
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!noWa || rating < 1) return;
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug: slug, noWa, rating, komentar }),
      });
      const data = await res.json();

      if (data.status === "SUBMITTED") {
        setStatus("success");
        setMessage(data.message);
        return;
      }

      setStatus("error");
      setMessage(data.message || data.error || "Gagal mengirim feedback");
    } catch {
      setStatus("error");
      setMessage("Gagal mengirim feedback");
    }
  };

  return (
    <main className="public-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center sm:mb-9">
          <p className="eyebrow mb-3">Masukan peserta</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#152238]">Feedback</h1>
          <p className="mt-2 text-sm text-[#718096]">{eventName}</p>
        </div>

        {status === "success" ? (
          <div className="rounded-2xl border border-[#c5e5d9] bg-[#f3fbf7] p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f0e5]">
              <svg className="h-7 w-7 text-[#147d64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#147d64]">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card space-y-5 p-5 sm:p-7">
            {status === "error" && (
              <div className="rounded-xl border border-[#f0caca] bg-[#fff6f6] px-4 py-3 text-sm text-[#a94242]">
                {message}
              </div>
            )}

            <div>
              <label className="field-label">No WhatsApp</label>
              <input
                type="tel"
                value={noWa}
                onChange={(e) => setNoWa(e.target.value)}
                placeholder="08xxxxxxxxxx"
                required
                className="field-input text-center text-lg tracking-wider"
              />
              <p className="mt-2 text-xs text-[#718096]">Masukkan No WA yang dipakai saat pendaftaran.</p>
            </div>

            <div>
              <label className="field-label">Rating keseluruhan</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition ${
                      rating >= n
                        ? "border-[#176b87] bg-[#176b87] text-white"
                        : "border-[#d5dee8] bg-white text-[#526176] hover:border-[#a6d2d9]"
                    }`}
                    aria-label={`Rating ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Komentar / saran</label>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                rows={4}
                placeholder="Apa yang paling bermanfaat? Apa yang bisa diperbaiki?"
                className="field-input min-h-28 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting" || !noWa || rating < 1}
              className="w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold text-white transition disabled:opacity-50"
              style={{ backgroundColor: warnaAksen }}
            >
              {status === "submitting" ? "Mengirim..." : "Kirim Feedback"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
