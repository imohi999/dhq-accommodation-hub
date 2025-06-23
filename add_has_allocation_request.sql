-- Add has_allocation_request column to queue table
-- This migration adds a flag to track queue entries that have pending allocation requests

-- Check if column already exists before adding
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'queue' 
        AND column_name = 'has_allocation_request'
    ) THEN
        ALTER TABLE "queue" ADD COLUMN "has_allocation_request" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create index for performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'queue'
        AND indexname = 'queue_has_allocation_request_idx'
    ) THEN
        CREATE INDEX "queue_has_allocation_request_idx" ON "queue"("has_allocation_request");
    END IF;
END $$;

-- Update existing allocation requests to set the flag
UPDATE queue q
SET has_allocation_request = true
WHERE EXISTS (
    SELECT 1 
    FROM allocation_requests ar 
    WHERE ar.queue_id = q.id 
    AND ar.status = 'pending'
);