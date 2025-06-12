
-- Drop existing policies and recreate them to ensure consistency
DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can insert units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can update units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can delete units" ON public.units;

DROP POLICY IF EXISTS "Authenticated users can view queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can insert queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can update queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can delete queue" ON public.queue;

-- Recreate all RLS policies for the units table
CREATE POLICY "Authenticated users can view units" 
  ON public.units 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert units" 
  ON public.units 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update units" 
  ON public.units 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete units" 
  ON public.units 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Recreate all RLS policies for the queue table
CREATE POLICY "Authenticated users can view queue" 
  ON public.queue 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert queue" 
  ON public.queue 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update queue" 
  ON public.queue 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete queue" 
  ON public.queue 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
