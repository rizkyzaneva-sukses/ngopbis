import Link from "next/link";

export default function Home() {
  return (
    <main className="public-shell flex flex-col">
      <header className="public-container flex items-center justify-between py-5 sm:py-7">
        <Link href="/" className="flex items-center gap-3" aria-label="Event Pendidikan - Beranda">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a3d] text-sm font-bold text-white shadow-sm">EP</span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-[#152238]">Event Pendidikan</span>
            <span className="block text-xs text-[#718096]">Registrasi & kehadiran</span>
          </span>
        </Link>
        <Link href="/admin/login" className="text-sm font-semibold text-[#526176] transition hover:text-[#176b87]">
          Masuk sebagai admin
        </Link>
      </header>

      <section className="public-container grid flex-1 items-center gap-10 py-12 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="eyebrow mb-5">Ruang belajar dan bertumbuh</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#152238] sm:text-6xl">
            Hadir di acara yang membuat langkah Anda lebih berarti.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#526176] sm:text-lg">
            Temukan informasi event, daftar tanpa ribet, dan lakukan check-in dengan cepat. Satu pengalaman yang nyaman untuk peserta, panitia, dan komunitas pendidikan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/login" className="primary-button">Buka ruang admin</Link>
            <span className="flex items-center justify-center px-2 text-sm text-[#718096] sm:justify-start">Link event dibagikan oleh panitia</span>
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-[#dce6ed] pt-6">
            <div><p className="text-xl font-bold text-[#152238]">01</p><p className="mt-1 text-xs leading-5 text-[#718096]">Pilih event</p></div>
            <div><p className="text-xl font-bold text-[#152238]">02</p><p className="mt-1 text-xs leading-5 text-[#718096]">Isi data</p></div>
            <div><p className="text-xl font-bold text-[#152238]">03</p><p className="mt-1 text-xs leading-5 text-[#718096]">Datang & hadir</p></div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#d9eef0] opacity-70 blur-2xl" />
          <div className="surface-card relative overflow-hidden p-5 sm:p-7">
            <div className="flex items-start justify-between border-b border-[#edf0f4] pb-5">
              <div>
                <p className="eyebrow">Preview pengalaman</p>
                <p className="mt-2 text-lg font-bold text-[#152238]">Seminar Pendidikan</p>
              </div>
              <span className="rounded-full bg-[#e8f4f7] px-3 py-1 text-xs font-semibold text-[#176b87]">Terbuka</span>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-[#f6fafb] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718096]">Waktu</p>
                <p className="mt-2 font-semibold text-[#152238]">Sabtu, 24 Agustus 2026</p>
                <p className="mt-1 text-sm text-[#718096]">09.00 - 12.00 WIB</p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#edf0f4] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f8ead6] text-xs font-bold text-[#a96d19]">LOC</span>
                <div><p className="text-xs text-[#718096]">Lokasi</p><p className="mt-1 text-sm font-semibold text-[#152238]">Aula Pendidikan Nasional</p></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-[#718096]">Pendaftaran sederhana</span>
                <span className="rounded-lg bg-[#176b87] px-4 py-2 text-sm font-bold text-white">Daftar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="public-container border-t border-[#dce6ed] py-5 text-xs text-[#718096]">
        Dibuat untuk pengalaman event pendidikan yang lebih tertata.
      </footer>
    </main>
  );
}
