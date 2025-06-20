/*
  Warnings:

  - Added the required column `queue_id` to the `allocation_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queue_id` to the `past_allocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queue_id` to the `unit_occupants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accommodation_types" RENAME CONSTRAINT "housing_types_pkey" TO "accommodation_types_pkey";

-- AlterTable
ALTER TABLE "allocation_requests" ADD COLUMN     "queue_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "past_allocations" ADD COLUMN     "queue_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "queue" ADD COLUMN     "dependents" JSONB;

-- AlterTable
ALTER TABLE "unit_occupants" ADD COLUMN     "queue_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "allocation_requests_queue_id_idx" ON "allocation_requests"("queue_id");

-- CreateIndex
CREATE INDEX "past_allocations_queue_id_idx" ON "past_allocations"("queue_id");

-- CreateIndex
CREATE INDEX "unit_occupants_queue_id_idx" ON "unit_occupants"("queue_id");

-- RenameForeignKey
ALTER TABLE "dhq_living_units" RENAME CONSTRAINT "dhq_living_units_housing_type_id_fkey" TO "dhq_living_units_accommodation_type_id_fkey";

-- AddForeignKey
ALTER TABLE "unit_occupants" ADD CONSTRAINT "unit_occupants_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_requests" ADD CONSTRAINT "allocation_requests_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_allocations" ADD CONSTRAINT "past_allocations_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "housing_types_name_key" RENAME TO "accommodation_types_name_key";

-- RenameIndex
ALTER INDEX "dhq_living_units_housing_type_id_idx" RENAME TO "dhq_living_units_accommodation_type_id_idx";
