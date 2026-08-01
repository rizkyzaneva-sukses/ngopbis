-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi" TEXT,
    "tanggalMulai" DATETIME NOT NULL,
    "tanggalSelesai" DATETIME,
    "bannerUrl" TEXT,
    "warnaAksen" TEXT NOT NULL DEFAULT '#2563eb',
    "kuota" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "thankYouConfig" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "opsiJawaban" JSONB,
    "wajib" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Peserta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noWa" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "domisili" TEXT,
    "namaBisnis" TEXT,
    "statusKeanggotaan" TEXT,
    "sumberInformasi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Registrasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "pesertaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TERDAFTAR',
    "waktuDaftar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuHadir" DATETIME,
    CONSTRAINT "Registrasi_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registrasi_pesertaId_fkey" FOREIGN KEY ("pesertaId") REFERENCES "Peserta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JawabanKustom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrasiId" TEXT NOT NULL,
    "eventQuestionId" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    CONSTRAINT "JawabanKustom_registrasiId_fkey" FOREIGN KEY ("registrasiId") REFERENCES "Registrasi" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JawabanKustom_eventQuestionId_fkey" FOREIGN KEY ("eventQuestionId") REFERENCES "EventQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "EventQuestion_eventId_idx" ON "EventQuestion"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Peserta_noWa_key" ON "Peserta"("noWa");

-- CreateIndex
CREATE INDEX "Registrasi_eventId_idx" ON "Registrasi"("eventId");

-- CreateIndex
CREATE INDEX "Registrasi_pesertaId_idx" ON "Registrasi"("pesertaId");

-- CreateIndex
CREATE UNIQUE INDEX "Registrasi_eventId_pesertaId_key" ON "Registrasi"("eventId", "pesertaId");

-- CreateIndex
CREATE INDEX "JawabanKustom_registrasiId_idx" ON "JawabanKustom"("registrasiId");

-- CreateIndex
CREATE INDEX "JawabanKustom_eventQuestionId_idx" ON "JawabanKustom"("eventQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
