"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login gagal");
      return;
    }

    router.push("/admin/events");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#102a3d] p-4 sm:p-6">
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 15% 10%, #3b8c9b, transparent 30%), radial-gradient(circle at 85% 90%, #176b87, transparent 34%)" }} />
      <div className="relative w-full max-w-md">
        <div className="mb-7 text-center text-white">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8eef0] text-sm font-bold text-[#176b87] shadow-lg">EP</div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a8cbd1]">Workspace admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Event Pendidikan</h1>
          <p className="mt-2 text-sm text-[#b7cbd2]">Kelola event, peserta, dan kehadiran dalam satu ruang.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-[#f0caca] bg-[#fff6f6] px-4 py-3 text-sm text-[#a94242]">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <div className="mb-6">
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full cursor-pointer disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
