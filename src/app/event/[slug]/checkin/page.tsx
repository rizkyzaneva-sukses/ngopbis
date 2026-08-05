"use client";

import { useState, use, useEffect, FormEvent } from "react";

type CheckinStatus = "idle" | "loading" | "checked_in" | "already" | "not_found" | "locked";

export default function CheckinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [noWa, setNoWa] = useState("");
  const [status, setStatus] = useState<CheckinStatus>("idle");
  const [nama, setNama] = useState("");
  const [message, setMessage] = useState("");
  const [eventName, setEventName] = useState("");
  const [warnaAksen, setWarnaAksen] = useState("#2563eb");

  // Storage key: satu per event, per device
  const lockKey = `checkin_done_${slug}`;

  useEffect(() => {
    fetch(`/api/events/public/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEventName(data.nama);
        setWarnaAksen(data.warnaAksen);
      });

    // Cek apakah device ini sudah pernah check-in di event ini
    const done = localStorage.getItem(lockKey);
    if (done) {
      const { nama: n, message: m } = JSON.parse(done);
      setNama(n || "");
      setMessage(m || "Kamu sudah check-in di perangkat ini.");
      setStatus("locked");
    }
  }, [slug, lockKey]);

  // Langsung confirm=true saat submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!noWa) return;
    setStatus("loading");

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug, noWa, confirm: true }),
    });
    const data = await res.json();

    switch (data.status) {
      case "CHECKED_IN":
        setNama(data.nama);
        setMessage(data.message);
        setStatus("checked_in");
        // Kunci device ini
        localStorage.setItem(lockKey, JSON.stringify({ nama: data.nama, message: data.message }));
        break;
      case "ALREADY_CHECKED_IN":
        setNama(data.nama);
        setMessage(data.message);
        setStatus("already");
        // Kunci juga — sudah pernah absen
        localStorage.setItem(lockKey, JSON.stringify({ nama: data.nama, message: data.message }));
        break;
      case "NOT_FOUND":
        setMessage(data.message);
        setStatus("not_found");
        break;
      default:
        setStatus("idle");
    }
  };

  const reset = () => {
    setNoWa("");
    setStatus("idle");
    setNama("");
    setMessage("");
  };

  return (
    <main className="public-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center sm:mb-9">
          <p className="eyebrow mb-3">Kehadiran peserta</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#152238]">Check-in</h1>
          <p className="mt-2 text-sm text-[#718096]">{eventName}</p>
        </div>

        {/* Device sudah check-in sebelumnya */}
        {status === "locked" ? (
          <div className="rounded-2xl border border-[#c5e5d9] bg-[#f3fbf7] p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f0e5]">
              <svg className="h-7 w-7 text-[#147d64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#147d64]">Kehadiran tercatat</p>
            {nama && <p className="mt-1 font-semibold text-[#152238]">{nama}</p>}
            <p className="mt-2 text-sm text-[#397b68]">{message}</p>
            <p className="mt-4 text-xs text-[#718096]">Perangkat ini sudah digunakan untuk check-in. Satu perangkat hanya untuk satu peserta.</p>
          </div>

        ) : status === "idle" || status === "loading" || status === "not_found" ? (
          <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-7">
            <label className="field-label">No WhatsApp</label>
            <input
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="field-input text-center text-lg tracking-wider"
              autoFocus
              type="tel"
            />
            <p className="mt-2 text-xs text-[#718096]">
              Masukkan No WA yang dipakai saat pendaftaran.
            </p>

            {status === "not_found" && (
              <div className="mt-3 rounded-xl border border-[#f0caca] bg-[#fff6f6] px-4 py-3 text-sm text-[#a94242]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || !noWa}
              className="mt-5 w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: warnaAksen }}
            >
              {status === "loading" ? "Memproses..." : "Konfirmasi Hadir"}
            </button>
          </form>

        ) : status === "checked_in" ? (
          <div className="rounded-2xl border border-[#c5e5d9] bg-[#f3fbf7] p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f0e5]">
              <svg className="h-7 w-7 text-[#147d64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#147d64]">{message}</p>
            <p className="mt-1 font-semibold text-[#152238]">{nama}</p>
            <p className="mt-4 text-xs text-[#718096]">Satu perangkat hanya untuk satu peserta.</p>
          </div>

        ) : status === "already" ? (
          <div className="rounded-2xl border border-[#ead9b7] bg-[#fff9ef] p-6 text-center">
            <p className="font-semibold text-[#8a5a16]">{message}</p>
            <p className="mt-1 text-sm text-[#a96d19]">{nama}</p>
            <p className="mt-4 text-xs text-[#718096]">Satu perangkat hanya untuk satu peserta.</p>
          </div>

        ) : null}

        {/* Tombol reset hanya tampil di not_found — bukan setelah berhasil */}
        {(status === "not_found") && (
          <button onClick={reset} className="mt-3 w-full py-2 text-sm font-semibold text-[#718096] hover:text-[#152238] cursor-pointer">
            Coba Lagi
          </button>
        )}
      </div>
    </main>
  );
}
