-- AlterTable
ALTER TABLE "queue" ADD COLUMN "has_allocation_request" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "queue_has_allocation_request_idx" ON "queue"("has_allocation_request");