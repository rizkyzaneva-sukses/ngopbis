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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">Check-in</h1>
          <p className="text-gray-500 text-sm mt-1">{eventName}</p>
        </div>

        {status === "idle" || status === "loading" ? (
          <form onSubmit={handleLookup} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">No WhatsApp</label>
            <input
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
              autoFocus
            />
            <button
              type="submit"
              disabled={status === "loading" || !noWa}
              className="w-full mt-4 py-3 rounded-lg text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: warnaAksen }}
            >
              {status === "loading" ? "Mencari..." : "Cari"}
            </button>
          </form>
        ) : status === "found" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Peserta ditemukan</p>
            <p className="text-2xl font-bold text-gray-900 mb-6">{nama}</p>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full py-3 rounded-lg text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "#16a34a" }}
            >
              {confirming ? "Mengkonfirmasi..." : "Konfirmasi Hadir"}
            </button>
            <button onClick={reset} className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-gray-700 cursor-pointer">
              Batal
            </button>
          </div>
        ) : status === "checked_in" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-800 font-bold text-lg">{message}</p>
            <p className="text-green-700 mt-1">{nama}</p>
            <button onClick={reset} className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg text-sm cursor-pointer hover:bg-green-700">
              Check-in Peserta Lain
            </button>
          </div>
        ) : status === "already" ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-800 font-medium">{message}</p>
            <p className="text-yellow-700 text-sm mt-1">{nama}</p>
            <button onClick={reset} className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg text-sm cursor-pointer hover:bg-yellow-700">
              Coba Nomor Lain
            </button>
          </div>
        ) : status === "not_found" ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">{message}</p>
            <button onClick={reset} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm cursor-pointer hover:bg-red-700">
              Coba Lagi
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
