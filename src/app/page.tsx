import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">Event Pendidikan</h1>
        <p className="text-gray-400 mb-8">Sistem Registrasi & Absensi Event</p>
        <Link
          href="/admin/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  );
}
