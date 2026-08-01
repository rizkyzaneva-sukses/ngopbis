"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ adminNama?: string } | null>(null);

  const isLoginPage = pathname === "/admin/login";

  const [loading, setLoading] = useState(() => !isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.isLoggedIn) {
          router.push("/admin/login");
        } else {
          setAdmin(data);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-gray-100">
      <nav className="bg-[#111638] border-b border-[#1e2450] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold font-mono tracking-tight">
            Event Pendidikan
          </Link>
          <Link href="/admin" className={`text-sm transition-colors ${pathname === "/admin" ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Dashboard
          </Link>
          <Link href="/admin/events" className={`text-sm transition-colors ${pathname.startsWith("/admin/events") ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Events
          </Link>
          <Link href="/admin/participants" className={`text-sm transition-colors ${pathname.startsWith("/admin/participants") ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Peserta
          </Link>
          <Link href="/admin/admins" className={`text-sm transition-colors ${pathname.startsWith("/admin/admins") ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Admin
          </Link>
          <Link href="/admin/audit-log" className={`text-sm transition-colors ${pathname.startsWith("/admin/audit-log") ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Audit Log
          </Link>
          <Link href="/admin/guide" className={`text-sm transition-colors ${pathname.startsWith("/admin/guide") ? "text-white" : "text-gray-400 hover:text-white"}`}>
            Panduan
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{admin?.adminNama}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
