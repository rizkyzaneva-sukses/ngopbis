const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcryptjs = require("bcryptjs");
const { randomUUID } = require("crypto");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function uid() { return randomUUID(); }
function ago(days) { const d = new Date(); d.setDate(d.getDate() - days); return d; }
function future(days) { const d = new Date(); d.setDate(d.getDate() + days); return d; }

async function main() {
  console.log("Starting seed...");

  // ============ ADMINS ============
  const hash = bcryptjs.hashSync("admin123", 10);
  const admin1 = await prisma.admin.upsert({
    where: { email: "admin@pendidikan.id" },
    update: {},
    create: { id: uid(), nama: "Admin Pendidikan", email: "admin@pendidikan.id", passwordHash: hash, role: "SUPER_ADMIN" },
  });
  const admin2 = await prisma.admin.upsert({
    where: { email: "budi@pendidikan.id" },
    update: {},
    create: { id: uid(), nama: "Budi Santoso", email: "budi@pendidikan.id", passwordHash: hash, role: "ADMIN" },
  });
  const admin3 = await prisma.admin.upsert({
    where: { email: "sari@pendidikan.id" },
    update: {},
    create: { id: uid(), nama: "Sari Dewi", email: "sari@pendidikan.id", passwordHash: hash, role: "ADMIN" },
  });
  console.log("  3 admins created");

  // ============ EVENTS ============
  const ev1 = await prisma.event.upsert({
    where: { slug: "seminar-digital-marketing-2025" },
    update: {},
    create: {
      id: uid(), nama: "Seminar Digital Marketing 2025", slug: "seminar-digital-marketing-2025",
      deskripsi: "Pelajari strategi digital marketing terbaru dari praktisi berpengalaman. Materi mencakup SEO, Social Media Marketing, Content Strategy, dan Paid Advertising.",
      lokasi: "Gedung Serba Guna Universitas Nusantara, Jakarta Selatan",
      googleMapsUrl: "https://maps.google.com/?q=-6.2615,106.8100",
      tanggalMulai: future(14), tanggalSelesai: future(14),
      warnaAksen: "#2563eb", kuota: 150, status: "PUBLISHED",
      thankYouConfig: { showWA: true, waNumber: "6281234567890", message: "Terima kasih sudah mendaftar!" },
      notifConfig: { remindDaysBefore: 3, remindHoursBefore: 2 },
    },
  });

  const ev2 = await prisma.event.upsert({
    where: { slug: "workshop-ui-ux-design" },
    update: {},
    create: {
      id: uid(), nama: "Workshop UI/UX Design", slug: "workshop-ui-ux-design",
      deskripsi: "Workshop intensif 3 hari belajar UI/UX Design dari nol hingga mahir. Peserta akan membuat proyek portfolio real-case.",
      lokasi: "CoWorking Space Kreatif, Bandung",
      tanggalMulai: future(30), tanggalSelesai: future(32),
      warnaAksen: "#7c3aed", kuota: 40, status: "PUBLISHED",
    },
  });

  const ev3 = await prisma.event.upsert({
    where: { slug: "pelatihan-python-pemula" },
    update: {},
    create: {
      id: uid(), nama: "Pelatihan Python untuk Pemula", slug: "pelatihan-python-pemula",
      deskripsi: "Belajar Python dari dasar. Cocok untuk mahasiswa dan profesional yang ingin mulai coding.",
      lokasi: "Lab Komputer Universitas Terbuka, Surabaya",
      tanggalMulai: ago(20), tanggalSelesai: ago(18),
      warnaAksen: "#059669", kuota: 60, status: "SELESAI",
    },
  });

  const ev4 = await prisma.event.upsert({
    where: { slug: "talkshow-karir-tech" },
    update: {},
    create: {
      id: uid(), nama: "Talkshow Karir di Bidang Tech", slug: "talkshow-karir-tech",
      deskripsi: "Diskusi panel bersama engineer senior dari Google, Gojek, dan Tokopedia tentang tips masuk industri tech.",
      lokasi: "Auditorium BINUS, Jakarta Pusat",
      tanggalMulai: future(7), tanggalSelesai: future(7),
      warnaAksen: "#dc2626", kuota: 200, status: "CLOSED",
    },
  });
  console.log("  4 events created (PUBLISHED x2, SELESAI, CLOSED)");

  // ============ EVENT QUESTIONS ============
  const q1 = await prisma.eventQuestion.create({
    data: { eventId: ev1.id, label: "Asal Universitas/Institusi", tipe: "TEXT", wajib: true, urutan: 1 },
  });
  const q2 = await prisma.eventQuestion.create({
    data: { eventId: ev1.id, label: "Tingkat Kemahiran Digital Marketing", tipe: "SINGLE_CHOICE", opsiJawaban: ["Pemula", "Menengah", "Lanjutan"], wajib: true, urutan: 2 },
  });
  const q3 = await prisma.eventQuestion.create({
    data: { eventId: ev1.id, label: "Topik yang paling ingin dipelajari", tipe: "MULTIPLE_CHOICE", opsiJawaban: ["SEO", "Social Media Ads", "Content Marketing", "Email Marketing", "Analytics"], wajib: false, urutan: 3 },
  });
  const q4 = await prisma.eventQuestion.create({
    data: { eventId: ev2.id, label: "Portofolio Design (link Figma/Behance)", tipe: "TEXT", wajib: true, urutan: 1 },
  });
  const q5 = await prisma.eventQuestion.create({
    data: { eventId: ev2.id, label: "Software design yang biasa digunakan", tipe: "DROPDOWN", opsiJawaban: ["Figma", "Adobe XD", "Sketch", "Canva", "Lainnya"], wajib: true, urutan: 2 },
  });
  const q6 = await prisma.eventQuestion.create({
    data: { eventId: ev2.id, label: "Upload CV/Resume", tipe: "FILE_UPLOAD", wajib: false, urutan: 3 },
  });
  const q7 = await prisma.eventQuestion.create({
    data: { eventId: ev3.id, label: "Pengalaman coding sebelumnya", tipe: "SINGLE_CHOICE", opsiJawaban: ["Tidak ada", "< 6 bulan", "6 bulan - 1 tahun", "> 1 tahun"], wajib: true, urutan: 1 },
  });
  const q8 = await prisma.eventQuestion.create({
    data: { eventId: ev4.id, label: "Posisi yang diminati", tipe: "SINGLE_CHOICE", opsiJawaban: ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "DevOps"], wajib: true, urutan: 1 },
  });
  console.log("  8 event questions created");

  // ============ PESERTA ============
  const pesertaData = [
    { noWa: "081234560001", nama: "Ahmad Fauzi", domisili: "Jakarta", namaBisnis: "Fauzi Digital", statusKeanggotaan: "AKTIF", sumberInformasi: "Instagram" },
    { noWa: "081234560002", nama: "Rina Marlina", domisili: "Bandung", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Teman" },
    { noWa: "081234560003", nama: "Dwi Kurniawan", domisili: "Surabaya", namaBisnis: "Kurniawan Tech", statusKeanggotaan: "AKTIF", sumberInformasi: "LinkedIn" },
    { noWa: "081234560004", nama: "Siti Nurhaliza", domisili: "Yogyakarta", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Website" },
    { noWa: "081234560005", nama: "Bambang Pamungkas", domisili: "Semarang", namaBisnis: "BP Creative", statusKeanggotaan: "AKTIF", sumberInformasi: "Instagram" },
    { noWa: "081234560006", nama: "Maya Putri", domisili: "Medan", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "YouTube" },
    { noWa: "081234560007", nama: "Fajar Nugroho", domisili: "Makassar", namaBisnis: "Nugroho Studio", statusKeanggotaan: "AKTIF", sumberInformasi: "TikTok" },
    { noWa: "081234560008", nama: "Diana Puspita", domisili: "Malang", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Instagram" },
    { noWa: "081234560009", nama: "Rizky Pratama", domisili: "Palembang", namaBisnis: "Rizky Coding", statusKeanggotaan: "AKTIF", sumberInformasi: "Teman" },
    { noWa: "081234560010", nama: "Lestari Wulan", domisili: "Bali", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Eventbrite" },
    { noWa: "081234560011", nama: "Hendra Wijaya", domisili: "Jakarta", namaBisnis: "Wijaya Corp", statusKeanggotaan: "AKTIF", sumberInformasi: "Google" },
    { noWa: "081234560012", nama: "Anisa Rahma", domisili: "Bandung", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Instagram" },
    { noWa: "081234560013", nama: "Tono Sugiarto", domisili: "Solo", namaBisnis: "Tono Workshop", statusKeanggotaan: "AKTIF", sumberInformasi: "WhatsApp Group" },
    { noWa: "081234560014", nama: "Putri Ayu", domisili: "Manado", namaBisnis: null, statusKeanggotaan: "AKTIF", sumberInformasi: "Facebook" },
    { noWa: "081234560015", nama: "Dimas Aditya", domisili: "Yogyakarta", namaBisnis: "Aditya Dev", statusKeanggotaan: "AKTIF", sumberInformasi: "LinkedIn" },
  ];

  const pesertas = [];
  for (const p of pesertaData) {
    const peserta = await prisma.peserta.upsert({
      where: { noWa: p.noWa },
      update: {},
      create: { id: uid(), ...p },
    });
    pesertas.push(peserta);
  }
  console.log("  15 peserta created");

  // ============ REGISTRASI ============
  let regCount = 0;

  // Event 1 (Seminar Digital Marketing) - 10 registrations
  const ev1Statuses = ["HADIR", "HADIR", "HADIR", "TERDAFTAR", "TERDAFTAR", "TERDAFTAR", "TERDAFTAR", "TERDAFTAR", "TERDAFTAR", "TERDAFTAR"];
  for (let i = 0; i < 10; i++) {
    const p = pesertas[i];
    const status = ev1Statuses[i];
    await prisma.registrasi.upsert({
      where: { eventId_pesertaId: { eventId: ev1.id, pesertaId: p.id } },
      update: {},
      create: {
        id: uid(), eventId: ev1.id, pesertaId: p.id, status,
        waktuDaftar: ago(Math.floor(Math.random() * 10) + 1),
        waktuHadir: status === "HADIR" ? ago(Math.floor(Math.random() * 5)) : null,
      },
    });
    regCount++;
  }

  // Event 2 (Workshop UI/UX) - 6 registrations
  for (let i = 0; i < 6; i++) {
    const p = pesertas[i + 4];
    await prisma.registrasi.upsert({
      where: { eventId_pesertaId: { eventId: ev2.id, pesertaId: p.id } },
      update: {},
      create: {
        id: uid(), eventId: ev2.id, pesertaId: p.id, status: "TERDAFTAR",
        waktuDaftar: ago(Math.floor(Math.random() * 15) + 1),
      },
    });
    regCount++;
  }

  // Event 3 (Pelatihan Python - SELESAI) - 8 registrations (all HADIR)
  for (let i = 0; i < 8; i++) {
    const p = pesertas[i + 2];
    await prisma.registrasi.upsert({
      where: { eventId_pesertaId: { eventId: ev3.id, pesertaId: p.id } },
      update: {},
      create: {
        id: uid(), eventId: ev3.id, pesertaId: p.id, status: "HADIR",
        waktuDaftar: ago(30 + Math.floor(Math.random() * 10)),
        waktuHadir: ago(20),
      },
    });
    regCount++;
  }

  // Event 4 (Talkshow - CLOSED) - 12 registrations (mixed)
  for (let i = 0; i < 12; i++) {
    const p = pesertas[i % pesertas.length];
    const status = i < 5 ? "HADIR" : "TERDAFTAR";
    await prisma.registrasi.upsert({
      where: { eventId_pesertaId: { eventId: ev4.id, pesertaId: p.id } },
      update: {},
      create: {
        id: uid(), eventId: ev4.id, pesertaId: p.id, status,
        waktuDaftar: ago(Math.floor(Math.random() * 20) + 1),
        waktuHadir: status === "HADIR" ? ago(Math.floor(Math.random() * 7)) : null,
      },
    });
    regCount++;
  }
  console.log("  " + regCount + " registrations created");

  // ============ JAWABAN KUSTOM ============
  const regs1 = await prisma.registrasi.findMany({ where: { eventId: ev1.id } });
  let jawabanCount = 0;
  const univs = ["Universitas Nusantara", "Institut Teknologi Bandung", "Universitas Gadjah Mada", "Universitas Padjadjaran", "Binus University"];
  const levels = ["Pemula", "Menengah", "Lanjutan", "Pemula", "Menengah"];
  for (const reg of regs1.slice(0, 5)) {
    await prisma.jawabanKustom.create({
      data: { id: uid(), registrasiId: reg.id, eventQuestionId: q1.id, nilai: univs[jawabanCount % 5] },
    });
    await prisma.jawabanKustom.create({
      data: { id: uid(), registrasiId: reg.id, eventQuestionId: q2.id, nilai: levels[jawabanCount % 5] },
    });
    await prisma.jawabanKustom.create({
      data: { id: uid(), registrasiId: reg.id, eventQuestionId: q3.id, nilai: JSON.stringify(["SEO", "Social Media Ads"]) },
    });
    jawabanCount += 3;
  }
  console.log("  " + jawabanCount + " jawaban kustom created");

  // ============ AUDIT LOG ============
  const auditData = [
    { adminId: admin1.id, adminNama: admin1.nama, aksi: "LOGIN", entitas: "Admin", entitasId: admin1.id },
    { adminId: admin1.id, adminNama: admin1.nama, aksi: "CREATE", entitas: "Event", entitasId: ev1.id, detail: { nama: ev1.nama } },
    { adminId: admin1.id, adminNama: admin1.nama, aksi: "UPDATE", entitas: "Event", entitasId: ev1.id, detail: { field: "status", from: "DRAFT", to: "PUBLISHED" } },
    { adminId: admin2.id, adminNama: admin2.nama, aksi: "LOGIN", entitas: "Admin", entitasId: admin2.id },
    { adminId: admin2.id, adminNama: admin2.nama, aksi: "CREATE", entitas: "Event", entitasId: ev2.id, detail: { nama: ev2.nama } },
    { adminId: admin1.id, adminNama: admin1.nama, aksi: "EXPORT", entitas: "Registrasi", entitasId: ev3.id, detail: { format: "xlsx", count: 8 } },
    { adminId: admin1.id, adminNama: admin1.nama, aksi: "CHECKIN", entitas: "Peserta", entitasId: pesertas[0].id, detail: { nama: pesertas[0].nama, event: ev1.nama } },
  ];
  for (const a of auditData) {
    await prisma.auditLog.create({ data: { id: uid(), ...a, createdAt: ago(Math.floor(Math.random() * 10)) } });
  }
  console.log("  " + auditData.length + " audit logs created");

  console.log("\nSeed complete!");
  console.log("\nSummary:");
  console.log("  3 Admins (admin@pendidikan.id / admin123)");
  console.log("  4 Events (PUBLISHED x2, SELESAI, CLOSED)");
  console.log("  8 Event Questions");
  console.log("  15 Peserta");
  console.log("  " + regCount + " Registrasi");
  console.log("  " + jawabanCount + " Jawaban Kustom");
  console.log("  " + auditData.length + " Audit Logs");
}

main()
  .catch(function(e) { console.error("Seed failed:", e); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });
