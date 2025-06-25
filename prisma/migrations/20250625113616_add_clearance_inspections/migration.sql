-- CreateTable
CREATE TABLE "clearance_inspections" (
    "id" TEXT NOT NULL,
    "past_allocation_id" TEXT NOT NULL,
    "inspector_svc_no" TEXT NOT NULL,
    "inspector_name" TEXT NOT NULL,
    "inspector_rank" TEXT NOT NULL,
    "inspector_category" TEXT NOT NULL,
    "inspector_appointment" TEXT NOT NULL,
    "inspection_date" DATE NOT NULL,
    "remarks" TEXT,
    "inventory_status" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clearance_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clearance_inspections_past_allocation_id_idx" ON "clearance_inspections"("past_allocation_id");

-- CreateIndex
CREATE INDEX "clearance_inspections_inspection_date_idx" ON "clearance_inspections"("inspection_date");

-- AddForeignKey
ALTER TABLE "clearance_inspections" ADD CONSTRAINT "clearance_inspections_past_allocation_id_fkey" FOREIGN KEY ("past_allocation_id") REFERENCES "past_allocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;