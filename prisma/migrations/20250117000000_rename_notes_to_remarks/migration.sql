-- Rename remarks to remarks in unit_inventory table
ALTER TABLE "unit_inventory" RENAME COLUMN "note" TO "remarks";

-- Rename notes to remarks in unit_maintenance table  
ALTER TABLE "unit_maintenance" RENAME COLUMN "notes" TO "remarks";