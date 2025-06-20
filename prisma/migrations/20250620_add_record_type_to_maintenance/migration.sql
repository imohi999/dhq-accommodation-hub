-- Add recordType to differentiate between maintenance requests and tasks
ALTER TABLE "unit_maintenance" ADD COLUMN "record_type" TEXT NOT NULL DEFAULT 'request';

-- Update existing records based on current logic
-- Records with cost = 0 are requests, others are tasks
UPDATE "unit_maintenance" 
SET "record_type" = 'request' 
WHERE "cost" = 0 OR "cost" IS NULL;

UPDATE "unit_maintenance" 
SET "record_type" = 'task' 
WHERE "cost" > 0;

-- Add check constraint to ensure valid record types
ALTER TABLE "unit_maintenance" 
ADD CONSTRAINT "record_type_check" 
CHECK ("record_type" IN ('request', 'task'));

-- Create indexes for better query performance
CREATE INDEX "unit_maintenance_record_type_idx" ON "unit_maintenance"("record_type");
CREATE INDEX "unit_maintenance_record_type_status_idx" ON "unit_maintenance"("record_type", "status");