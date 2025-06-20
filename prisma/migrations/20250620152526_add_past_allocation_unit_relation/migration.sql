-- AddForeignKey
ALTER TABLE "past_allocations" ADD CONSTRAINT "past_allocations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "dhq_living_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
