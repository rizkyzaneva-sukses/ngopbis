"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ adminNama?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="admin-shell">
      <nav className="admin-nav sticky top-0 z-40 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#d8eef0] text-xs font-bold text-[#176b87]">EP</span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold tracking-tight">Event Pendidikan</span><span className="hidden text-[11px] text-[#a8c1ca] sm:block">Workspace admin</span></span>
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white sm:hidden" aria-expanded={menuOpen}>
            Menu
          </button>
          <div className="hidden items-center gap-1 sm:flex">
            {[
              ["/admin", "Dashboard"],
              ["/admin/events", "Events"],
              ["/admin/participants", "Peserta"],
              ["/admin/admins", "Admin"],
              ["/admin/audit-log", "Audit Log"],
              ["/admin/guide", "Panduan"],
            ].map(([href, label]) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-white/12 text-white" : "text-[#b7cbd2] hover:bg-white/8 hover:text-white"}`}>{label}</Link>;
            })}
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="max-w-32 truncate text-sm text-[#b7cbd2]">{admin?.adminNama}</span>
            <button onClick={handleLogout} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-[#f0b4b4] transition hover:bg-white/10 hover:text-white cursor-pointer">Logout</button>
          </div>
        </div>
        {menuOpen && (
          <div className="mx-auto mt-3 max-w-7xl border-t border-white/10 pt-3 sm:hidden">
            <div className="grid gap-1">
              {[
                ["/admin", "Dashboard"], ["/admin/events", "Events"], ["/admin/participants", "Peserta"], ["/admin/admins", "Admin"], ["/admin/audit-log", "Audit Log"], ["/admin/guide", "Panduan"],
              ].map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-[#d5e2e6] hover:bg-white/10">{label}</Link>)}
              <div className="mt-2 flex items-center justify-between border-t border-white/10 px-3 pt-3"><span className="text-sm text-[#b7cbd2]">{admin?.adminNama}</span><button onClick={handleLogout} className="text-sm font-semibold text-[#f0b4b4] cursor-pointer">Logout</button></div>
            </div>
          </div>
        )}
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
