"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "panduan" | "versi";

export default function GuidePage() {
  const [tab, setTab] = useState<Tab>("panduan");

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Panduan & Versi</h1>

      <div className="flex gap-1 mb-6 border-b border-[#1e2450]">
        {[
          { key: "panduan" as Tab, label: "Panduan" },
          { key: "versi" as Tab, label: "Versi" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm transition-colors cursor-pointer ${tab === t.key ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "panduan" ? <PanduanTab /> : <VersiTab />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#111638] border border-[#1e2450] rounded-xl p-5 mb-4">
      <h2 className="text-sm font-semibold mb-3 text-blue-400">{title}</h2>
      <div className="text-sm text-gray-300 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">{n}</span>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

function PanduanTab() {
  return (
    <div className="max-w-3xl">
      <Section title="1. Login Admin">
        <p>Buka <Link href="/admin/login" className="text-blue-400 hover:underline">/admin/login</Link> lalu masukkan email dan password admin.</p>
        <p>Email & password default (seed):</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li>Email: <code className="text-gray-200">admin@pendidikan.id</code></li>
          <li>Password: <code className="text-gray-200">admin123</code></li>
        </ul>
      </Section>

      <Section title="2. Dashboard">
        <p>Halaman <Link href="/admin" className="text-blue-400 hover:underline">/admin</Link> menampilkan ringkasan seluruh aktivitas:</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li>Statistik: total event, event aktif, total peserta, total pendaftar, total hadir, persentase kehadiran.</li>
          <li>Grafik pendaftar 14 hari terakhir.</li>
          <li>Daftar event terdekat lengkap dengan progress kuota.</li>
          <li>Aktivitas pendaftaran terbaru.</li>
          <li>Breakdown peserta berdasarkan domisili, status keanggotaan, dan sumber informasi.</li>
        </ul>
      </Section>

      <Section title="3. Membuat Event">
        <Step n={1}><Link href="/admin/events" className="text-blue-400 hover:underline">Buka halaman Events</Link> lalu klik <strong>+ Buat Event</strong>.</Step>
        <Step n={2}>Isi nama event, slug (otomatis, bisa di-custom), tanggal mulai/selesai, lokasi, link Google Maps, flyer/banner, deskripsi, warna aksen, dan kuota (opsional).</Step>
        <Step n={3}>Klik <strong>Buat Event</strong>. Event baru berstatus <code>DRAFT</code> dan landing page publik ter-generate otomatis di <code>/event/[slug]</code>.</Step>
        <Step n={4}>Ubah status ke <strong>PUBLISHED</strong> agar pendaftaran terbuka untuk publik.</Step>
      </Section>

      <Section title="4. Mengelola Event">
        <p>Di halaman detail event (<code>/admin/events/[id]</code>) terdapat beberapa tab:</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li><strong>Detail</strong> — edit data event. Setelah simpan, popup konfirmasi muncul lalu otomatis kembali ke daftar event.</li>
          <li><strong>Pertanyaan Kustom</strong> — tambah, edit, duplikat, dan atur urutan pertanyaan kondisional. 6 pertanyaan wajib default selalu ada dan tidak bisa dihapus.</li>
          <li><strong>Thank You</strong> — atur heading dan pesan di halaman terima kasih setelah pendaftaran.</li>
          <li><strong>Notifikasi WA</strong> — aktifkan konfirmasi pendaftaran & reminder, edit template pesan, kirim reminder manual ke semua peserta.</li>
          <li><strong>QR Check-in</strong> — cetak/download QR statis untuk ditaruh di meja registrasi, dan tombol <strong>Mode Check-in Panitia</strong>.</li>
          <li><strong>Peserta</strong> — daftar pendaftar, manual check-in, dan export Excel.</li>
          <li><strong>Laporan</strong> — statistik kehadiran + breakdown per domisili/status/sumber.</li>
        </ul>
      </Section>

      <Section title="5. Duplikat, Hapus, & Copy Link">
        <p>Di daftar event, setiap kartu punya 3 tombol aksi:</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li><strong>Copy Link</strong> — salin link publik event ke clipboard.</li>
          <li><strong>Duplikat</strong> — buat salinan event (status DRAFT) beserta pertanyaan kustomnya.</li>
          <li><strong>Hapus</strong> — hapus event permanen (dengan konfirmasi).</li>
        </ul>
      </Section>

      <Section title="6. Alur Pendaftaran Peserta (Publik)">
        <Step n={1}>Peserta buka link publik <code>/event/[slug]</code> dari link yang dibagikan panitia.</Step>
        <Step n={2}>Isi No WhatsApp. Jika nomor sudah pernah daftar di event manapun, 5 field wajib lainnya otomatis terisi.</Step>
        <Step n={3}>Lengkapi data wajib + jawab pertanyaan kustom event tersebut.</Step>
        <Step n={4}>Submit → redirect ke Thank You Page. Jika notifikasi WA aktif, pesan konfirmasi terkirim otomatis via WAHA.</Step>
      </Section>

      <Section title="7. Check-in di Lokasi">
        <Step n={1}>Panitia pasang QR statis event (dari tab QR Check-in) di meja registrasi.</Step>
        <Step n={2}>Peserta scan QR → landing di <code>/event/[slug]/checkin</code> → input No WhatsApp.</Step>
        <Step n={3}>Sistem menampilkan nama peserta → klik <strong>Konfirmasi Hadir</strong>.</Step>
        <Step n={4}>Jika nomor tidak ditemukan, panitia bisa manual check-in dari tab Peserta atau <Link href="/admin/events" className="text-blue-400 hover:underline">Mode Check-in Panitia</Link>.</Step>
        <p className="text-gray-400 mt-2">Mode Check-in Panitia (<code>/admin/events/[id]/checkin</code>) punya counter real-time, auto-refresh, dan pencarian nama/No WA — cocok dibuka di HP/tablet panitia.</p>
      </Section>

      <Section title="8. Manajemen Peserta">
        <p>Halaman <Link href="/admin/participants" className="text-blue-400 hover:underline">/admin/participants</Link> menampilkan database peserta terpusat (lintas event):</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li>Cari berdasarkan nama atau No WA, filter domisili & status keanggotaan.</li>
          <li>Lihat total event diikuti & total kehadiran tiap peserta.</li>
          <li>Klik peserta untuk detail, edit data, dan lihat riwayat event.</li>
          <li>Export seluruh database peserta ke Excel.</li>
        </ul>
      </Section>

      <Section title="9. Manajemen Admin (SUPER_ADMIN)">
        <p>Halaman <Link href="/admin/admins" className="text-blue-400 hover:underline">/admin/admins</Link> (khusus SUPER_ADMIN):</p>
        <ul className="list-disc list-inside ml-2 text-gray-400">
          <li>Tambah admin baru (nama, email, password, role).</li>
          <li>Reset password admin lain.</li>
          <li>Hapus admin (tidak bisa hapus akun sendiri).</li>
        </ul>
        <p className="text-yellow-400">Catatan: admin seed saat ini ber-role ADMIN. Untuk mengelola admin, ubah role admin seed menjadi SUPER_ADMIN langsung di database, atau buat admin SUPER_ADMIN baru.</p>
      </Section>

      <Section title="10. Audit Log">
        <p>Halaman <Link href="/admin/audit-log" className="text-blue-400 hover:underline">/admin/audit-log</Link> mencatat semua aktivitas admin: login, create/update/delete event, duplikat, perubahan notifikasi, blast reminder, update peserta, dan manajemen admin. Bisa difilter berdasarkan entitas.</p>
      </Section>

      <Section title="11. Konfigurasi WAHA (WhatsApp)">
        <p>Set environment variable berikut saat deploy untuk mengaktifkan notifikasi WhatsApp:</p>
        <pre className="bg-[#0a0e27] border border-[#1e2450] rounded-lg p-3 text-xs text-gray-200 overflow-x-auto"><code>{`WAHA_API_URL="http://localhost:3000"
WAHA_SESSION="default"
WAHA_API_KEY=""`}</code></pre>
        <p>Tanpa konfigurasi ini, fitur WA tetap berjalan tapi pesan tidak terkirim (status &ldquo;WAHA belum dikonfigurasi&rdquo; di tab Notifikasi).</p>
      </Section>
    </div>
  );
}

function VersiTab() {
  const versions = [
    {
      tag: "v1.0.0",
      date: "1 Agustus 2026",
      status: "Rilis awal",
      items: [
        { cat: "Dashboard", points: [
          "Dashboard global dengan 6 kartu statistik (total event, event aktif, total peserta, total pendaftar, total hadir, persentase kehadiran)",
          "Grafik bar pendaftar 14 hari terakhir",
          "Daftar event terdekat dengan progress kuota",
          "Feed aktivitas pendaftaran terbaru",
          "Breakdown peserta per domisili, status keanggotaan, dan sumber informasi",
          "Quick action: Buat Event & Manajemen Peserta",
        ]},
        { cat: "Manajemen Event", points: [
          "CRUD event dengan slug otomatis (bisa custom)",
          "Status event: DRAFT / PUBLISHED / CLOSED / SELESAI",
          "Pencarian, filter status, dan sort (terbaru / tanggal / peserta terbanyak)",
          "Progress bar kuota dengan peringatan penuh",
          "Copy link publik ke clipboard",
          "Duplikat event (termasuk pertanyaan kustom)",
          "Hapus event dengan konfirmasi",
          "Popup toast sukses/gagal yang konsisten",
          "Redirect otomatis ke daftar event setelah edit",
        ]},
        { cat: "Form Builder", points: [
          "6 pertanyaan wajib default (tidak bisa dihapus)",
          "Pertanyaan kustom per event: Text, Single Choice, Multiple Choice, Dropdown, Angka, Upload File",
          "Reorder urutan pertanyaan (naik/turun)",
          "Duplikat pertanyaan",
          "Edit inline pertanyaan",
          "Tandai wajib/opsional",
        ]},
        { cat: "Landing Page Publik", points: [
          "Auto-generated dari data event (banner, deskripsi, tanggal, lokasi, form)",
          "Auto-fill 5 field wajib berdasarkan No WA (lintas event)",
          "Validasi format No WA Indonesia",
          "Form otomatis nonaktif saat kuota penuh",
          "Cache no-store agar perubahan langsung terlihat",
        ]},
        { cat: "Thank You Page", points: [
          "Custom heading & pesan per event",
          "Reminder simpan No WA untuk check-in",
        ]},
        { cat: "Registrasi Publik", points: [
          "Upsert peserta (No WA sebagai key unik)",
          "Update data peserta jika sudah pernah daftar",
          "Validasi pertanyaan wajib & tipe angka",
          "Rate limiting (20 request/menit per IP)",
          "Kirim WhatsApp konfirmasi otomatis (via WAHA, opsional)",
        ]},
        { cat: "Check-in", points: [
          "QR statis per event (cetak & download PNG)",
          "Halaman check-in publik: input No WA → konfirmasi hadir",
          "Pencegahan check-in ganda (sudah absen → tampilkan jam)",
          "Mode Check-in Panitia: counter real-time, auto-refresh 5s, search nama/No WA, filter status",
          "Manual check-in dari admin panel (fallback)",
        ]},
        { cat: "Database Peserta Terpusat", points: [
          "Satu tabel Peserta (key: No WA) lintas semua event",
          "Halaman /admin/participants: list, search, filter",
          "Detail peserta + riwayat event + edit data",
          "Total event diikuti & total kehadiran per peserta",
          "Export database peserta ke Excel",
        ]},
        { cat: "Reporting & Export", points: [
          "Laporan per event: pendaftar vs hadir, persentase kehadiran",
          "Breakdown per domisili / status keanggotaan / sumber informasi",
          "Export Excel peserta + status kehadiran + jawaban kustom",
        ]},
        { cat: "Notifikasi WhatsApp (WAHA)", points: [
          "Integrasi WAHA via environment variable (WAHA_API_URL, WAHA_SESSION, WAHA_API_KEY)",
          "Toggle konfirmasi pendaftaran & reminder per event",
          "Template pesan custom dengan variabel {nama}, {event}, {tanggal}, {lokasi}",
          "Kirim reminder blast manual ke semua peserta terdaftar",
          "Status koneksi WAHA terlihat di UI",
          "Fire-and-forget (tidak memblokir pendaftaran)",
        ]},
        { cat: "Keamanan & Hardening", points: [
          "Multi-admin dengan role SUPER_ADMIN & ADMIN",
          "Manajemen admin (khusus SUPER_ADMIN): tambah, reset password, hapus",
          "Audit log: login, event CRUD, duplikat, notifikasi, reminder, peserta, admin",
          "Halaman viewer audit log dengan filter entitas",
          "Rate limiting di endpoint publik (register & check-in)",
          "iron-session untuk auth admin",
        ]},
        { cat: "Infrastruktur", points: [
          "Next.js 16 App Router + Turbopack",
          "Prisma 7 + SQLite (better-sqlite3 adapter)",
          "TypeScript strict (tsc lulus)",
          "ESLint 0 error",
          "Production build sukses (24 route)",
        ]},
      ],
    },
  ];

  return (
    <div className="max-w-3xl">
      {versions.map((v) => (
        <div key={v.tag} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold font-mono">{v.tag}</span>
            <span className="text-sm text-gray-400">{v.date}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">{v.status}</span>
          </div>

          {v.items.map((group) => (
            <Section key={group.cat} title={group.cat}>
              <ul className="space-y-1.5">
                {group.points.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-500 flex-shrink-0">▸</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>
      ))}
    </div>
  );
}
