CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'SELESAI');
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'NUMBER', 'FILE_UPLOAD');
CREATE TYPE "RegistrationStatus" AS ENUM ('TERDAFTAR', 'HADIR');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "deskripsi" TEXT,
  "lokasi" TEXT,
  "googleMapsUrl" TEXT,
  "tanggalMulai" TIMESTAMP(3) NOT NULL,
  "tanggalSelesai" TIMESTAMP(3),
  "bannerUrl" TEXT,
  "warnaAksen" TEXT NOT NULL DEFAULT '#2563eb',
  "kuota" INTEGER,
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "thankYouConfig" JSONB,
  "notifConfig" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

CREATE TABLE "EventQuestion" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "tipe" "QuestionType" NOT NULL,
  "opsiJawaban" JSONB,
  "wajib" BOOLEAN NOT NULL DEFAULT false,
  "urutan" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EventQuestion_eventId_idx" ON "EventQuestion"("eventId");

CREATE TABLE "Peserta" (
  "id" TEXT NOT NULL,
  "noWa" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "domisili" TEXT,
  "namaBisnis" TEXT,
  "statusKeanggotaan" TEXT,
  "sumberInformasi" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Peserta_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Peserta_noWa_key" ON "Peserta"("noWa");

CREATE TABLE "Registrasi" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "pesertaId" TEXT NOT NULL,
  "status" "RegistrationStatus" NOT NULL DEFAULT 'TERDAFTAR',
  "waktuDaftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "waktuHadir" TIMESTAMP(3),
  CONSTRAINT "Registrasi_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Registrasi_eventId_pesertaId_key" ON "Registrasi"("eventId", "pesertaId");
CREATE INDEX "Registrasi_eventId_idx" ON "Registrasi"("eventId");
CREATE INDEX "Registrasi_pesertaId_idx" ON "Registrasi"("pesertaId");

CREATE TABLE "JawabanKustom" (
  "id" TEXT NOT NULL,
  "registrasiId" TEXT NOT NULL,
  "eventQuestionId" TEXT NOT NULL,
  "nilai" TEXT NOT NULL,
  CONSTRAINT "JawabanKustom_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "JawabanKustom_registrasiId_idx" ON "JawabanKustom"("registrasiId");
CREATE INDEX "JawabanKustom_eventQuestionId_idx" ON "JawabanKustom"("eventQuestionId");

CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "nama" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "adminId" TEXT,
  "adminNama" TEXT,
  "aksi" TEXT NOT NULL,
  "entitas" TEXT NOT NULL,
  "entitasId" TEXT,
  "detail" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entitas_entitasId_idx" ON "AuditLog"("entitas", "entitasId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "EventQuestion" ADD CONSTRAINT "EventQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Registrasi" ADD CONSTRAINT "Registrasi_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Registrasi" ADD CONSTRAINT "Registrasi_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JawabanKustom" ADD CONSTRAINT "JawabanKustom_registrasiId_fkey" FOREIGN KEY ("registrasiId") REFERENCES "Registrasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JawabanKustom" ADD CONSTRAINT "JawabanKustom_eventQuestionId_fkey" FOREIGN KEY ("eventQuestionId") REFERENCES "EventQuestion"("id") ON UPDATE CASCADE;
