-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN "lastFeedbackAt" DATETIME;
ALTER TABLE "Attempt" ADD COLUMN "lastFeedbackGrade" INTEGER;
ALTER TABLE "Attempt" ADD COLUMN "lastFeedbackText" TEXT;
