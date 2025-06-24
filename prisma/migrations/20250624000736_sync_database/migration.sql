-- AlterTable: Add missing default values for UUID fields
ALTER TABLE "dhq_living_units" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "accommodation_types" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "allocation_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "stamp_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "past_allocations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "unit_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "unit_inventory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "unit_maintenance" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "unit_occupants" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "queue" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "page_permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "user_roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "auth_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "units" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable: Add @updatedAt columns that are missing
ALTER TABLE "dhq_living_units" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "unit_inventory" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "unit_maintenance" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "unit_occupants" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "queue" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "page_permissions" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "allocation_requests" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "stamp_settings" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "past_allocations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Fix foreign key relations to match Prisma schema names
-- First, drop the existing foreign keys with wrong relation names
ALTER TABLE "dhq_living_units" DROP CONSTRAINT IF EXISTS "dhq_living_units_current_occupant_id_fkey";
ALTER TABLE "dhq_living_units" ADD CONSTRAINT "dhq_living_units_current_occupant_id_fkey" 
    FOREIGN KEY ("current_occupant_id") REFERENCES "queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Fix user_roles relations
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_assigned_by_fkey";
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_user_id_fkey";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" 
    FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_dhq_living_units_updated_at BEFORE UPDATE ON "dhq_living_units" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_inventory_updated_at BEFORE UPDATE ON "unit_inventory" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_maintenance_updated_at BEFORE UPDATE ON "unit_maintenance" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_occupants_updated_at BEFORE UPDATE ON "unit_occupants" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON "queue" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_permissions_updated_at BEFORE UPDATE ON "page_permissions" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON "profiles" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allocation_requests_updated_at BEFORE UPDATE ON "allocation_requests" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stamp_settings_updated_at BEFORE UPDATE ON "stamp_settings" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_past_allocations_updated_at BEFORE UPDATE ON "past_allocations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();