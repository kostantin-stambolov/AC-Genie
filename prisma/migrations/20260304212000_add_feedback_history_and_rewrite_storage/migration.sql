-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN "feedbackHistory" TEXT;
ALTER TABLE "Attempt" ADD COLUMN "lastRewriteAt" DATETIME;
ALTER TABLE "Attempt" ADD COLUMN "lastRewriteGrade" INTEGER;
ALTER TABLE "Attempt" ADD COLUMN "lastRewriteParts" TEXT;
ALTER TABLE "Attempt" ADD COLUMN "lastRewriteReason" TEXT;
