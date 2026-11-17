-- CreateEnum
CREATE TYPE "IndiaEligibility" AS ENUM ('VERIFIED_INDIAN', 'INTERNATIONAL', 'AMBIGUOUS');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "indiaEligibility" "IndiaEligibility" NOT NULL DEFAULT 'AMBIGUOUS',
ADD COLUMN     "remoteEligibilityScope" TEXT,
ADD COLUMN     "workMode" "WorkMode" NOT NULL DEFAULT 'UNKNOWN';

-- CreateIndex
CREATE INDEX "jobs_indiaEligibility_idx" ON "jobs"("indiaEligibility");

-- CreateIndex
CREATE INDEX "jobs_workMode_idx" ON "jobs"("workMode");

-- CreateIndex
CREATE INDEX "jobs_countryCode_idx" ON "jobs"("countryCode");
