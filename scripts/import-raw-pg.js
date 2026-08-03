/**
 * Wipe all events/participants (keep admins), then import
 * "Database all Ngopbis.xlsx" into event "EVENT SEBELUM MIGRASI".
 * Uses raw pg driver (no Prisma needed).
 */
const path = require("path");
const { randomUUID } = require("crypto");
const { Client } = require("pg");
const XLSX = require("xlsx");

const connStr = process.env.DATABASE_URL;
if (!connStr) { console.error("Set DATABASE_URL"); process.exit(1); }

const client = new Client({ connectionString: connStr, ssl: false });

const EVENT_NAME = "EVENT SEBELUM MIGRASI";
const EVENT_SLUG = "event-sebelum-migrasi";
const XLSX_PATH = path.join(__dirname, "..", "Database all Ngopbis.xlsx");
const SUMBER_OPTIONS = ["Whatsapp Grup", "Rekomendasi Teman", "Instagram", "Lainnya"];

function uid() { return randomUUID(); }

function formatNoWa(noWa) {
  let c = String(noWa || "").replace(/\D/g, "");
  if (!c) return "";
  if (c.startsWith("0")) c = "62" + c.slice(1);
  if (!c.startsWith("62")) c = "62" + c;
  return c;
}

function validateNoWa(raw) {
  const c = String(raw || "").replace(/\D/g, "");
  if (c.startsWith("0")) return c.length >= 10 && c.length <= 14;
  if (c.startsWith("62")) return c.length >= 11 && c.length <= 15;
  return false;
}

function mapStatus(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const l = s.toLowerCase();
  if (l.includes("muda") && l.includes("juara")) return "Muda Juara";
  if (l === "umum") return "Umum";
  return s;
}

function mapSumber(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  if (SUMBER_OPTIONS.includes(s)) return s;
  const l = s.toLowerCase();
  if (l.includes("whatsapp") || l.includes("wa ")) return "Whatsapp Grup";
  if (l.includes("rekomendasi") || l.includes("teman")) return "Rekomendasi Teman";
  if (l.includes("instagram") || l === "ig") return "Instagram";
  return "Lainnya";
}

function cell(row, ...keys) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  const entries = Object.entries(row);
  for (const key of keys) {
    const found = entries.find(([h]) => String(h).toLowerCase().includes(String(key).toLowerCase()));
    if (found && found[1] != null && String(found[1]).trim() !== "") return String(found[1]).trim();
  }
  return "";
}

async function main() {
  await client.connect();
  console.log("Connected to DB");

  // 1. WIPE
  console.log("\n1. Wiping data...");
  await client.query(`DELETE FROM "JawabanKustom"`);
  await client.query(`DELETE FROM "Registrasi"`);
  await client.query(`DELETE FROM "EventQuestion"`);
  await client.query(`DELETE FROM "Event"`);
  await client.query(`DELETE FROM "Peserta"`);
  console.log("   Wipe done (Admin + AuditLog kept)");

  // 2. CREATE EVENT
  console.log("\n2. Creating event...");
  const eventId = uid();
  await client.query(`
    INSERT INTO "Event" (id, nama, slug, deskripsi, lokasi, "tanggalMulai", "tanggalSelesai", "warnaAksen", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
  `, [eventId, EVENT_NAME, EVENT_SLUG, "Data peserta historis sebelum migrasi ke sistem baru.", "Bandung",
      "2026-04-17T02:00:00.000Z", "2026-07-23T10:00:00.000Z", "#2563eb", "PUBLISHED"]);
  console.log("   Event: " + EVENT_NAME + " (id: " + eventId + ")");

  // 3. PARSE EXCEL
  console.log("\n3. Parsing Excel...");
  const wb = XLSX.readFile(XLSX_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  console.log("   Excel rows: " + rows.length);

  // 4. DEDUPE
  const byWa = new Map();
  const skipped = [];
  for (const row of rows) {
    const nama = cell(row, "Nama Lengkap", "nama", "Nama");
    const noWaRaw = cell(row, "Nomer Hp / Whatsapp", "No WhatsApp", "noWa", "Nomer Hp");
    const noWa = formatNoWa(noWaRaw);
    const namaBisnis = cell(row, "Nama Usaha", "namaBisnis", "Nama Bisnis") || null;
    const domisili = cell(row, "Domisili / Alamat", "Domisili", "domisili") || null;
    const statusKeanggotaan = mapStatus(cell(row, "Status keanggotaan", "statusKeanggotaan", "Status"));
    const sumberInformasi = mapSumber(cell(row, "Mendapatkan informasi acara dari?", "sumberInformasi", "Sumber"));

    if (!noWa || !validateNoWa(noWaRaw || noWa)) {
      skipped.push({ reason: "invalid/missing WA", nama, noWaRaw });
      continue;
    }

    const entry = { nama: nama || null, noWa, namaBisnis, domisili, statusKeanggotaan, sumberInformasi };
    const prev = byWa.get(noWa);
    if (!prev) {
      byWa.set(noWa, entry);
    } else {
      byWa.set(noWa, {
        ...prev,
        nama: entry.nama || prev.nama,
        namaBisnis: entry.namaBisnis || prev.namaBisnis,
        domisili: entry.domisili || prev.domisili,
        statusKeanggotaan: entry.statusKeanggotaan || prev.statusKeanggotaan,
        sumberInformasi: entry.sumberInformasi || prev.sumberInformasi,
      });
    }
  }

  // 5. UPSERT
  console.log("\n4. Importing peserta + registrasi...");
  let imported = 0, incomplete = 0;
  for (const p of byWa.values()) {
    if (!p.nama) { p.nama = "(Belum diisi)"; incomplete++; }
    if (!p.namaBisnis || !p.domisili || !p.statusKeanggotaan || !p.sumberInformasi) incomplete++;

    // Upsert peserta by noWa
    const res = await client.query(`
      INSERT INTO "Peserta" (id, "noWa", nama, "namaBisnis", domisili, "statusKeanggotaan", "sumberInformasi", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT ("noWa") DO UPDATE SET
        nama = COALESCE(EXCLUDED.nama, "Peserta".nama),
        "namaBisnis" = COALESCE(EXCLUDED."namaBisnis", "Peserta"."namaBisnis"),
        domisili = COALESCE(EXCLUDED.domisili, "Peserta".domisili),
        "statusKeanggotaan" = COALESCE(EXCLUDED."statusKeanggotaan", "Peserta"."statusKeanggotaan"),
        "sumberInformasi" = COALESCE(EXCLUDED."sumberInformasi", "Peserta"."sumberInformasi"),
        "updatedAt" = NOW()
      RETURNING id
    `, [uid(), p.noWa, p.nama, p.namaBisnis, p.domisili, p.statusKeanggotaan, p.sumberInformasi]);

    const pesertaId = res.rows[0].id;

    // Upsert registrasi
    await client.query(`
      INSERT INTO "Registrasi" (id, "eventId", "pesertaId", status, "waktuDaftar")
      VALUES ($1, $2, $3, 'TERDAFTAR', NOW())
      ON CONFLICT ("eventId", "pesertaId") DO NOTHING
    `, [uid(), eventId, pesertaId]);

    imported++;
    if (imported % 100 === 0) process.stdout.write("   " + imported + "... ");
  }

  console.log("\n\n=== RESULT ===");
  console.log("Unique WA processed: " + byWa.size);
  console.log("Peserta upserted: " + imported);
  console.log("Rows incomplete: " + incomplete);
  console.log("Skipped (bad WA): " + skipped.length);
  if (skipped.length > 0) {
    console.log("First 10 skipped:");
    skipped.slice(0, 10).forEach(s => console.log("  -", s.nama, s.noWaRaw, s.reason));
  }
  console.log("\nPublic register: /event/" + EVENT_SLUG + "/register");

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
