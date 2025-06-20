-- AddForeignKey
ALTER TABLE "dhq_living_units" ADD CONSTRAINT "dhq_living_units_current_occupant_id_fkey" FOREIGN KEY ("current_occupant_id") REFERENCES "queue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
