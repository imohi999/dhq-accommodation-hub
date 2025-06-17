-- Rename housing_types table to accommodation_types
ALTER TABLE "housing_types" RENAME TO "accommodation_types";

-- Rename housing_type_id column to accommodation_type_id in dhq_living_units table
ALTER TABLE "dhq_living_units" RENAME COLUMN "housing_type_id" TO "accommodation_type_id";

-- Drop the old foreign key constraint
ALTER TABLE "dhq_living_units" 
  DROP CONSTRAINT IF EXISTS "dhq_living_units_housing_type_id_fkey";

-- Add the new foreign key constraint
ALTER TABLE "dhq_living_units" 
  ADD CONSTRAINT "dhq_living_units_accommodation_type_id_fkey" 
  FOREIGN KEY ("accommodation_type_id") 
  REFERENCES "accommodation_types"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old index and create a new one
DROP INDEX IF EXISTS "dhq_living_units_housing_type_id_idx";
CREATE INDEX "dhq_living_units_accommodation_type_id_idx" ON "dhq_living_units"("accommodation_type_id");