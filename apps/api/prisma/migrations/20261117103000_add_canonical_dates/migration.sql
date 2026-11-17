-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "sourceUpdatedAt" TIMESTAMP(3),
ADD COLUMN "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "jobs_postedAt_idx" ON "jobs"("postedAt");

-- CreateIndex
CREATE INDEX "jobs_firstSeenAt_idx" ON "jobs"("firstSeenAt");

-- CreateIndex
CREATE INDEX "jobs_lastSeenAt_idx" ON "jobs"("lastSeenAt");
