"use client";

import { useEffect, useState, useCallback } from "react";

interface Admin {
  id: string;
  nama: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
}

interface Me {
  adminId?: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  msg: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [me, setMe] = useState<Me>({});
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [form, setForm] = useState({ nama: "", email: "", password: "", role: "ADMIN" });
  const [creating, setCreating] = useState(false);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [resetting, setResetting] = useState<string | null>(null);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const fetchAdmins = useCallback(async () => {
    const res = await fetch("/api/admins", { cache: "no-store" });
    if (res.ok) setAdmins(await res.json());
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/admins", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([data, meData]) => {
        setAdmins(data);
        setMe(meData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.email || !form.password) {
      showToast("error", "Nama, email, dan password wajib diisi");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal membuat admin");
      } else {
        showToast("success", "Admin berhasil dibuat");
        setForm({ nama: "", email: "", password: "", role: "ADMIN" });
        await fetchAdmins();
      }
    } catch {
      showToast("error", "Gagal membuat admin");
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (id: string) => {
    const password = resetPasswords[id];
    if (!password) {
      showToast("error", "Password baru wajib diisi");
      return;
    }
    setResetting(id);
    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal reset password");
      } else {
        showToast("success", "Password berhasil direset");
        setResetPasswords((p) => ({ ...p, [id]: "" }));
      }
    } catch {
      showToast("error", "Gagal reset password");
    } finally {
      setResetting(null);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Hapus admin "${admin.nama}"?`)) return;
    try {
      const res = await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Gagal menghapus admin");
      } else {
        showToast("success", "Admin berhasil dihapus");
        await fetchAdmins();
      }
    } catch {
      showToast("error", "Gagal menghapus admin");
    }
  };

  return (
    <div>
      <div className="mb-6"><p className="eyebrow mb-2">Akses & keamanan</p><h1 className="text-2xl font-bold tracking-tight">Manajemen admin</h1><p className="mt-1 text-sm text-[#718096]">Atur akun dan akses pengelola workspace.</p></div>

      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg text-sm text-white shadow-lg ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card h-fit p-5">
          <h2 className="mb-4 font-semibold">Tambah admin</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <input
              className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="bg-[#111638] border border-[#1e2450] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {creating ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : admins.length === 0 ? (
            <p className="text-gray-500">Belum ada admin.</p>
          ) : (
            <div className="admin-card hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0e27] text-gray-400">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nama</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Dibuat</th>
                    <th className="text-left px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-t border-[#1e2450]">
                      <td className="px-4 py-3">{admin.nama}</td>
                      <td className="px-4 py-3 text-gray-400">{admin.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            admin.role === "SUPER_ADMIN"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="Password baru"
                              value={resetPasswords[admin.id] || ""}
                              onChange={(e) =>
                                setResetPasswords((p) => ({ ...p, [admin.id]: e.target.value }))
                              }
                              className="bg-[#111638] border border-[#1e2450] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500 w-32"
                            />
                            <button
                              onClick={() => handleResetPassword(admin.id)}
                              disabled={resetting === admin.id}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {resetting === admin.id ? "..." : "Reset"}
                            </button>
                          </div>
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={admin.id === me.adminId}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              admin.id === me.adminId ? "Tidak bisa menghapus akun sendiri" : undefined
                            }
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && admins.length > 0 && (
            <div className="grid gap-3 md:hidden">
              {admins.map((admin) => (
                <div key={admin.id} className="admin-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate font-bold">{admin.nama}</p><p className="mt-1 truncate text-sm text-[#718096]">{admin.email}</p></div>
                    <span className="rounded-full bg-[#e8f4f7] px-2 py-1 text-[11px] font-bold text-[#176b87]">{admin.role}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#8a98a8]">Dibuat {new Date(admin.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <div className="mt-4 flex flex-col gap-2 border-t border-[#edf0f4] pt-3">
                    <div className="flex gap-2"><input type="password" placeholder="Password baru" value={resetPasswords[admin.id] || ""} onChange={(e) => setResetPasswords((p) => ({ ...p, [admin.id]: e.target.value }))} className="admin-input min-w-0 flex-1" /><button onClick={() => handleResetPassword(admin.id)} disabled={resetting === admin.id} className="primary-button cursor-pointer px-3 text-xs disabled:opacity-50">{resetting === admin.id ? "..." : "Reset"}</button></div>
                    <button onClick={() => handleDelete(admin)} disabled={admin.id === me.adminId} className="w-full rounded-xl bg-[#b24b4b] px-3 py-2 text-xs font-bold text-white cursor-pointer hover:bg-[#963d3d] disabled:cursor-not-allowed disabled:opacity-40">Hapus admin</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
