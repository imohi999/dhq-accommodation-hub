-- Create page_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "page_permissions" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "page_key" TEXT NOT NULL,
    "page_title" TEXT NOT NULL,
    "parent_key" TEXT,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "allowed_actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "page_permissions_profile_id_idx" ON "page_permissions"("profile_id");
CREATE INDEX IF NOT EXISTS "page_permissions_page_key_idx" ON "page_permissions"("page_key");
CREATE INDEX IF NOT EXISTS "page_permissions_allowed_actions_idx" ON "page_permissions"("allowed_actions");
CREATE UNIQUE INDEX IF NOT EXISTS "page_permissions_profile_id_page_key_key" ON "page_permissions"("profile_id", "page_key");

-- Add hasAllocationRequest column to queue table
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

-- Create index for hasAllocationRequest
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