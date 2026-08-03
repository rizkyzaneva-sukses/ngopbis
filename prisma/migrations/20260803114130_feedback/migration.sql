-- DropForeignKey
ALTER TABLE "JawabanKustom" DROP CONSTRAINT "JawabanKustom_eventQuestionId_fkey";

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "registrasiId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT,
    "waktuIsi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_registrasiId_key" ON "Feedback"("registrasiId");

-- CreateIndex
CREATE INDEX "Feedback_eventId_idx" ON "Feedback"("eventId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_registrasiId_fkey" FOREIGN KEY ("registrasiId") REFERENCES "Registrasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanKustom" ADD CONSTRAINT "JawabanKustom_eventQuestionId_fkey" FOREIGN KEY ("eventQuestionId") REFERENCES "EventQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
