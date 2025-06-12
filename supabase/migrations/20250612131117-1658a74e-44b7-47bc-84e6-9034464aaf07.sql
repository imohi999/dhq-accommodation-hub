
-- First, clear any existing units and add the required ones
DELETE FROM public.units;

-- Insert the required units (DSA, DRDB, DIA, MPB, DHQ)
INSERT INTO public.units (name, description) VALUES
  ('DSA', 'Defence Space Administration'),
  ('DRDB', 'Defence Research and Development Bureau'),
  ('DIA', 'Defence Intelligence Agency'),
  ('MPB', 'Military Police Battalion'),
  ('DHQ', 'Defence Headquarters');

-- Update existing queue items to use only the valid units
UPDATE public.queue SET current_unit = 'DSA' WHERE id IN (
  SELECT id FROM public.queue ORDER BY sequence LIMIT 3
);

UPDATE public.queue SET current_unit = 'DRDB' WHERE id IN (
  SELECT id FROM public.queue ORDER BY sequence OFFSET 3 LIMIT 3
);

UPDATE public.queue SET current_unit = 'DIA' WHERE id IN (
  SELECT id FROM public.queue ORDER BY sequence OFFSET 6 LIMIT 3
);

UPDATE public.queue SET current_unit = 'MPB' WHERE id IN (
  SELECT id FROM public.queue ORDER BY sequence OFFSET 9 LIMIT 2
);

UPDATE public.queue SET current_unit = 'DHQ' WHERE id IN (
  SELECT id FROM public.queue ORDER BY sequence OFFSET 11
);
