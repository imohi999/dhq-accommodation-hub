-- CreateTable
CREATE TABLE "page_permissions" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "page_key" TEXT NOT NULL,
    "page_title" TEXT NOT NULL,
    "parent_key" TEXT,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_permissions_profile_id_idx" ON "page_permissions"("profile_id");

-- CreateIndex
CREATE INDEX "page_permissions_page_key_idx" ON "page_permissions"("page_key");

-- CreateIndex
CREATE UNIQUE INDEX "page_permissions_profile_id_page_key_key" ON "page_permissions"("profile_id", "page_key");

-- AddForeignKey
ALTER TABLE "page_permissions" ADD CONSTRAINT "page_permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;