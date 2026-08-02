"use client";

import { useState, use, useEffect, FormEvent } from "react";

type CheckinStatus = "idle" | "loading" | "found" | "checked_in" | "already" | "not_found";

export default function CheckinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [noWa, setNoWa] = useState("");
  const [status, setStatus] = useState<CheckinStatus>("idle");
  const [nama, setNama] = useState("");
  const [message, setMessage] = useState("");
  const [registrasiId, setRegistrasiId] = useState("");
  const [eventName, setEventName] = useState("");
  const [warnaAksen, setWarnaAksen] = useState("#2563eb");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch(`/api/events/public/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEventName(data.nama);
        setWarnaAksen(data.warnaAksen);
      });
  }, [slug]);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!noWa) return;
    setStatus("loading");

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug, noWa, confirm: false }),
    });
    const data = await res.json();

    switch (data.status) {
      case "FOUND":
        setStatus("found");
        setNama(data.nama);
        setRegistrasiId(data.registrasiId);
        break;
      case "ALREADY_CHECKED_IN":
        setStatus("already");
        setNama(data.nama);
        setMessage(data.message);
        break;
      case "NOT_FOUND":
        setStatus("not_found");
        setMessage(data.message);
        break;
      default:
        setStatus("idle");
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug: slug, noWa, confirm: true }),
    });
    const data = await res.json();
    setConfirming(false);

    if (data.status === "CHECKED_IN") {
      setStatus("checked_in");
      setMessage(data.message);
    }
  };

  const reset = () => {
    setNoWa("");
    setStatus("idle");
    setNama("");
    setMessage("");
    setRegistrasiId("");
  };

  return (
    <main className="public-shell flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center sm:mb-9">
          <p className="eyebrow mb-3">Kehadiran peserta</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#152238]">Check-in</h1>
          <p className="mt-2 text-sm text-[#718096]">{eventName}</p>
        </div>

        {status === "idle" || status === "loading" ? (
          <form onSubmit={handleLookup} className="surface-card p-5 sm:p-7">
            <label className="field-label">No WhatsApp</label>
            <input
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="field-input text-center text-lg tracking-wider"
              autoFocus
            />
            <button
              type="submit"
              disabled={status === "loading" || !noWa}
              className="mt-4 w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: warnaAksen }}
            >
              {status === "loading" ? "Mencari..." : "Cari"}
            </button>
          </form>
        ) : status === "found" ? (
          <div className="surface-card p-6 text-center sm:p-8">
            <p className="eyebrow mb-2">Peserta ditemukan</p>
            <p className="text-2xl font-bold tracking-tight text-[#152238]">{nama}</p>
            <button
              onClick={handleConfirm}
              disabled={confirming}
               className="mt-6 w-full cursor-pointer rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#16a34a" }}
            >
              {confirming ? "Mengkonfirmasi..." : "Konfirmasi Hadir"}
            </button>
             <button onClick={reset} className="mt-3 w-full py-2 text-sm font-semibold text-[#718096] hover:text-[#152238] cursor-pointer">
              Batal
            </button>
          </div>
        ) : status === "checked_in" ? (
          <div className="rounded-2xl border border-[#c5e5d9] bg-[#f3fbf7] p-6 text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f0e5]">
              <svg className="h-7 w-7 text-[#147d64]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#147d64]">{message}</p>
            <p className="mt-1 text-[#397b68]">{nama}</p>
            <button onClick={reset} className="mt-6 rounded-xl bg-[#147d64] px-6 py-3 text-sm font-bold text-white cursor-pointer hover:bg-[#0f654f]">
              Check-in Peserta Lain
            </button>
          </div>
        ) : status === "already" ? (
          <div className="rounded-2xl border border-[#ead9b7] bg-[#fff9ef] p-6 text-center">
            <p className="font-semibold text-[#8a5a16]">{message}</p>
            <p className="mt-1 text-sm text-[#a96d19]">{nama}</p>
            <button onClick={reset} className="mt-4 rounded-xl bg-[#a96d19] px-6 py-3 text-sm font-bold text-white cursor-pointer hover:bg-[#8a5a16]">
              Coba Nomor Lain
            </button>
          </div>
        ) : status === "not_found" ? (
          <div className="rounded-2xl border border-[#f0caca] bg-[#fff6f6] p-6 text-center">
            <p className="font-semibold text-[#a94242]">{message}</p>
            <button onClick={reset} className="mt-4 rounded-xl bg-[#b24b4b] px-6 py-3 text-sm font-bold text-white cursor-pointer hover:bg-[#963d3d]">
              Coba Lagi
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
