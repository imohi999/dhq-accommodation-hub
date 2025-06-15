-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('superadmin', 'admin', 'moderator', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT,
    "role" "AppRole" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AppRole" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" TEXT,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue" (
    "id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "svc_no" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "arm_of_service" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "marital_status" TEXT NOT NULL,
    "no_of_adult_dependents" INTEGER NOT NULL DEFAULT 0,
    "no_of_child_dependents" INTEGER NOT NULL DEFAULT 0,
    "current_unit" TEXT,
    "appointment" TEXT,
    "date_tos" DATE,
    "date_sos" DATE,
    "phone" TEXT,
    "entry_date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housing_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housing_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dhq_living_units" (
    "id" TEXT NOT NULL,
    "quarter_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "housing_type_id" TEXT NOT NULL,
    "no_of_rooms" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Vacant',
    "type_of_occupancy" TEXT NOT NULL DEFAULT 'Single',
    "bq" BOOLEAN NOT NULL DEFAULT false,
    "no_of_rooms_in_bq" INTEGER NOT NULL DEFAULT 0,
    "block_name" TEXT NOT NULL,
    "flat_house_room_name" TEXT NOT NULL,
    "unit_name" TEXT,
    "block_image_url" TEXT,
    "current_occupant_id" TEXT,
    "current_occupant_name" TEXT,
    "current_occupant_rank" TEXT,
    "current_occupant_service_number" TEXT,
    "occupancy_start_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dhq_living_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_occupants" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "service_number" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "emergency_contact" TEXT,
    "occupancy_start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_occupants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_history" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "occupant_name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "service_number" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "duration_days" INTEGER,
    "reason_for_leaving" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_inventory" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "item_description" TEXT NOT NULL,
    "item_location" TEXT NOT NULL,
    "item_status" TEXT NOT NULL DEFAULT 'Functional',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_maintenance" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maintenance_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performed_by" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_requests" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "personnel_data" JSONB NOT NULL,
    "unit_data" JSONB NOT NULL,
    "allocation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "refusal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamp_settings" (
    "id" TEXT NOT NULL,
    "stamp_name" TEXT NOT NULL,
    "stamp_rank" TEXT NOT NULL,
    "stamp_appointment" TEXT NOT NULL,
    "stamp_note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stamp_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "past_allocations" (
    "id" TEXT NOT NULL,
    "personnel_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "personnel_data" JSONB NOT NULL,
    "unit_data" JSONB NOT NULL,
    "allocation_start_date" DATE NOT NULL,
    "allocation_end_date" DATE,
    "duration_days" INTEGER,
    "reason_for_leaving" TEXT,
    "deallocation_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "past_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "profiles_username_idx" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "queue_sequence_key" ON "queue"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "queue_svc_no_key" ON "queue"("svc_no");

-- CreateIndex
CREATE INDEX "queue_sequence_idx" ON "queue"("sequence");

-- CreateIndex
CREATE INDEX "queue_svc_no_idx" ON "queue"("svc_no");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "housing_types_name_key" ON "housing_types"("name");

-- CreateIndex
CREATE INDEX "dhq_living_units_housing_type_id_idx" ON "dhq_living_units"("housing_type_id");

-- CreateIndex
CREATE INDEX "dhq_living_units_status_idx" ON "dhq_living_units"("status");

-- CreateIndex
CREATE INDEX "dhq_living_units_unit_name_idx" ON "dhq_living_units"("unit_name");

-- CreateIndex
CREATE INDEX "unit_occupants_unit_id_idx" ON "unit_occupants"("unit_id");

-- CreateIndex
CREATE INDEX "unit_occupants_is_current_idx" ON "unit_occupants"("is_current");

-- CreateIndex
CREATE INDEX "unit_history_unit_id_idx" ON "unit_history"("unit_id");

-- CreateIndex
CREATE INDEX "unit_inventory_unit_id_idx" ON "unit_inventory"("unit_id");

-- CreateIndex
CREATE INDEX "unit_maintenance_unit_id_idx" ON "unit_maintenance"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_requests_letter_id_key" ON "allocation_requests"("letter_id");

-- CreateIndex
CREATE INDEX "allocation_requests_status_idx" ON "allocation_requests"("status");

-- CreateIndex
CREATE INDEX "allocation_requests_personnel_id_idx" ON "allocation_requests"("personnel_id");

-- CreateIndex
CREATE INDEX "allocation_requests_unit_id_idx" ON "allocation_requests"("unit_id");

-- CreateIndex
CREATE INDEX "stamp_settings_is_active_idx" ON "stamp_settings"("is_active");

-- CreateIndex
CREATE INDEX "past_allocations_personnel_id_idx" ON "past_allocations"("personnel_id");

-- CreateIndex
CREATE INDEX "past_allocations_unit_id_idx" ON "past_allocations"("unit_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dhq_living_units" ADD CONSTRAINT "dhq_living_units_housing_type_id_fkey" FOREIGN KEY ("housing_type_id") REFERENCES "housing_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_occupants" ADD CONSTRAINT "unit_occupants_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_history" ADD CONSTRAINT "unit_history_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_inventory" ADD CONSTRAINT "unit_inventory_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_maintenance" ADD CONSTRAINT "unit_maintenance_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_requests" ADD CONSTRAINT "allocation_requests_personnel_id_fkey" FOREIGN KEY ("personnel_id") REFERENCES "queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_requests" ADD CONSTRAINT "allocation_requests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
