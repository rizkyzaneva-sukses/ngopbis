/**
 * Wipe all events/participants (keep admins), then import
 * "Database all Ngopbis.xlsx" into event "EVENT SEBELUM MIGRASI".
 *
 * Usage:
 *   $env:DATABASE_URL="postgresql://..."; node scripts/import-ngopbis-xlsx.js
 */
const path = require("path");
const { randomUUID } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const XLSX = require("xlsx");

const connectionString = process.env.DATABASE_URL;
if (!connectionString?.startsWith("postgres")) {
  console.error("Set DATABASE_URL first (postgresql://...)");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const EVENT_NAME = "EVENT SEBELUM MIGRASI";
const EVENT_SLUG = "event-sebelum-migrasi";
const XLSX_PATH = path.join(__dirname, "..", "Database all Ngopbis.xlsx");

const SUMBER_OPTIONS = new Set([
  "Whatsapp Grup",
  "Rekomendasi Teman",
  "Instagram",
  "Lainnya",
]);

function uid() {
  return randomUUID();
}

function formatNoWa(noWa) {
  let cleaned = String(noWa || "").replace(/\D/g, "");
  if (!cleaned) return "";
  // scientific notation from Excel e.g. 6.28987E+11 already broken as digits
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;
  return cleaned;
}

function validateNoWa(noWa) {
  const cleaned = String(noWa || "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) return cleaned.length >= 10 && cleaned.length <= 14;
  if (cleaned.startsWith("62")) return cleaned.length >= 11 && cleaned.length <= 15;
  return false;
}

function mapStatus(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  if (lower.includes("muda") && lower.includes("juara")) return "Muda Juara";
  if (lower === "umum") return "Umum";
  return s; // keep unknown as-is
}

function mapSumber(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (SUMBER_OPTIONS.has(s)) return s;
  const lower = s.toLowerCase();
  if (lower.includes("whatsapp") || lower.includes("wa ")) return "Whatsapp Grup";
  if (lower.includes("rekomendasi") || lower.includes("teman")) return "Rekomendasi Teman";
  if (lower.includes("instagram") || lower === "ig") return "Instagram";
  return "Lainnya";
}

function cell(row, ...keys) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  // fuzzy header match
  const entries = Object.entries(row);
  for (const key of keys) {
    const found = entries.find(([h]) =>
      String(h).toLowerCase().includes(String(key).toLowerCase())
    );
    if (found && found[1] != null && String(found[1]).trim() !== "") {
      return String(found[1]).trim();
    }
  }
  return "";
}

function parseExcel() {
  const wb = XLSX.readFile(XLSX_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  return rows;
}

function normalizeRow(row) {
  const nama = cell(row, "Nama Lengkap", "nama", "Nama");
  const noWaRaw = cell(row, "Nomer Hp / Whatsapp", "No WhatsApp", "noWa", "Nomer Hp");
  const namaBisnis = cell(row, "Nama Usaha", "namaBisnis", "Nama Bisnis") || null;
  const domisili = cell(row, "Domisili / Alamat", "Domisili", "domisili") || null;
  const statusRaw = cell(row, "Status keanggotaan", "statusKeanggotaan", "Status");
  const sumberRaw = cell(row, "Mendapatkan informasi acara dari?", "sumberInformasi", "Sumber");

  const noWa = formatNoWa(noWaRaw);
  return {
    nama: nama || null,
    noWa,
    noWaRaw,
    namaBisnis,
    domisili,
    statusKeanggotaan: mapStatus(statusRaw),
    sumberInformasi: mapSumber(sumberRaw),
    valid: Boolean(noWa && validateNoWa(noWaRaw || noWa)),
  };
}

async function wipeAll() {
  console.log("Wiping JawabanKustom, Registrasi, EventQuestion, Event, Peserta...");
  await prisma.jawabanKustom.deleteMany({});
  await prisma.registrasi.deleteMany({});
  await prisma.eventQuestion.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.peserta.deleteMany({});
  // keep Admin + AuditLog
  console.log("  done (admins kept)");
}

async function createEvent() {
  const event = await prisma.event.create({
    data: {
      id: uid(),
      nama: EVENT_NAME,
      slug: EVENT_SLUG,
      deskripsi: "Data peserta historis sebelum migrasi ke sistem baru.",
      lokasi: "Bandung",
      tanggalMulai: new Date("2026-04-17T09:00:00+07:00"),
      tanggalSelesai: new Date("2026-07-23T17:00:00+07:00"),
      warnaAksen: "#2563eb",
      status: "PUBLISHED",
    },
  });
  console.log(`Event created: ${event.nama} (slug: ${event.slug})`);
  return event;
}

async function importParticipants(eventId) {
  const rows = parseExcel();
  console.log(`Excel rows: ${rows.length}`);

  const byWa = new Map();
  const skipped = [];

  for (const row of rows) {
    const p = normalizeRow(row);
    if (!p.valid) {
      skipped.push({ reason: "invalid/missing WA", nama: p.nama, noWaRaw: p.noWaRaw });
      continue;
    }
    // merge duplicates by WA — keep latest non-empty fields
    const prev = byWa.get(p.noWa);
    if (!prev) {
      byWa.set(p.noWa, p);
    } else {
      byWa.set(p.noWa, {
        ...prev,
        nama: p.nama || prev.nama,
        namaBisnis: p.namaBisnis || prev.namaBisnis,
        domisili: p.domisili || prev.domisili,
        statusKeanggotaan: p.statusKeanggotaan || prev.statusKeanggotaan,
        sumberInformasi: p.sumberInformasi || prev.sumberInformasi,
      });
    }
  }

  let createdPeserta = 0;
  let createdReg = 0;
  let incomplete = 0;

  for (const p of byWa.values()) {
    if (!p.nama) {
      // still insert with placeholder so WA is known; they must re-register
      p.nama = "(Belum diisi)";
      incomplete++;
    }
    if (!p.namaBisnis || !p.domisili || !p.statusKeanggotaan || !p.sumberInformasi) {
      incomplete++;
    }

    const peserta = await prisma.peserta.upsert({
      where: { noWa: p.noWa },
      update: {
        nama: p.nama,
        domisili: p.domisili,
        namaBisnis: p.namaBisnis,
        statusKeanggotaan: p.statusKeanggotaan,
        sumberInformasi: p.sumberInformasi,
      },
      create: {
        id: uid(),
        noWa: p.noWa,
        nama: p.nama,
        domisili: p.domisili,
        namaBisnis: p.namaBisnis,
        statusKeanggotaan: p.statusKeanggotaan,
        sumberInformasi: p.sumberInformasi,
      },
    });
    createdPeserta++;

    await prisma.registrasi.upsert({
      where: {
        eventId_pesertaId: { eventId, pesertaId: peserta.id },
      },
      update: {},
      create: {
        id: uid(),
        eventId,
        pesertaId: peserta.id,
        status: "TERDAFTAR",
      },
    });
    createdReg++;
  }

  return {
    uniqueWa: byWa.size,
    createdPeserta,
    createdReg,
    incomplete,
    skipped,
  };
}

async function main() {
  console.log("=== Import Ngopbis Excel ===");
  console.log("File:", XLSX_PATH);

  await wipeAll();
  const event = await createEvent();
  const stats = await importParticipants(event.id);

  console.log("\n=== Result ===");
  console.log("Unique WA imported:", stats.uniqueWa);
  console.log("Peserta upserted:", stats.createdPeserta);
  console.log("Registrasi created:", stats.createdReg);
  console.log("Rows with incomplete profile fields:", stats.incomplete);
  console.log("Skipped (bad WA):", stats.skipped.length);
  if (stats.skipped.length) {
    console.log(stats.skipped.slice(0, 20));
  }
  console.log(`\nPublic register: /event/${EVENT_SLUG}/register`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
