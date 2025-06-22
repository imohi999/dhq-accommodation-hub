-- Add allowedActions column to page_permissions table
ALTER TABLE "page_permissions" ADD COLUMN "allowed_actions" TEXT[] DEFAULT '{}';

-- Update existing permissions to use allowedActions format
-- Convert canView=true to include 'access' action
UPDATE "page_permissions" 
SET "allowed_actions" = ARRAY['access'] 
WHERE "can_view" = true AND "allowed_actions" = '{}';

-- Add 'edit' action for records with canEdit=true
UPDATE "page_permissions" 
SET "allowed_actions" = array_append("allowed_actions", 'edit') 
WHERE "can_edit" = true AND NOT ('edit' = ANY("allowed_actions"));

-- Add 'delete' action for records with canDelete=true
UPDATE "page_permissions" 
SET "allowed_actions" = array_append("allowed_actions", 'delete') 
WHERE "can_delete" = true AND NOT ('delete' = ANY("allowed_actions"));

-- Create index on allowed_actions for better query performance
CREATE INDEX "page_permissions_allowed_actions_idx" ON "page_permissions" USING GIN ("allowed_actions");