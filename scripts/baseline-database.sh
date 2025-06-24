#!/bin/bash

echo "Setting up Prisma baseline for existing database..."

# Mark all existing migrations as already applied
echo "Marking all migrations as applied..."
npx prisma migrate resolve --applied "20250615062945_init"
npx prisma migrate resolve --applied "20250615095806_remove_queue_allocation_relation"
npx prisma migrate resolve --applied "20250615150924_add_allocation_sequence"
npx prisma migrate resolve --applied "20250617_add_copy_to_stamp_settings"
npx prisma migrate resolve --applied "20250620_add_record_type_to_maintenance"
npx prisma migrate resolve --applied "20250620132322_add_queue_dependencies_and_enforce_queue_id"
npx prisma migrate resolve --applied "20250620135454_add_current_occupant_queue_relation"
npx prisma migrate resolve --applied "20250620152526_add_past_allocation_unit_relation"
npx prisma migrate resolve --applied "20250622_add_allowed_actions_to_page_permissions"
npx prisma migrate resolve --applied "20250622_add_page_permissions"
npx prisma migrate resolve --applied "20250622_remove_nextauth_add_audit"
npx prisma migrate resolve --applied "20250623_add_has_allocation_request"
npx prisma migrate resolve --applied "20250624000736_sync_database"

echo "Baseline complete! You can now run 'yarn build' successfully."