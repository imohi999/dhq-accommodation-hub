-- AlterTable
ALTER TABLE "allocation_requests" ADD COLUMN "queue_id" TEXT;

-- AlterTable
ALTER TABLE "past_allocations" ADD COLUMN "queue_id" TEXT;

-- AlterTable
ALTER TABLE "unit_occupants" ADD COLUMN "queue_id" TEXT;

-- CreateIndex
CREATE INDEX "allocation_requests_queue_id_idx" ON "allocation_requests"("queue_id");

-- CreateIndex
CREATE INDEX "past_allocations_queue_id_idx" ON "past_allocations"("queue_id");

-- CreateIndex
CREATE INDEX "unit_occupants_queue_id_idx" ON "unit_occupants"("queue_id");

-- AddForeignKey
ALTER TABLE "unit_occupants" ADD CONSTRAINT "unit_occupants_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_requests" ADD CONSTRAINT "allocation_requests_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_allocations" ADD CONSTRAINT "past_allocations_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;