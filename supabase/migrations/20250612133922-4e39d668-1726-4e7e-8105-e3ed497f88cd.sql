
-- Drop existing RLS policies
DROP POLICY IF EXISTS "Authenticated users can view units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can insert units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can update units" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can delete units" ON public.units;

DROP POLICY IF EXISTS "Authenticated users can view queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can insert queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can update queue" ON public.queue;
DROP POLICY IF EXISTS "Authenticated users can delete queue" ON public.queue;

-- Create more permissive policies that work with both real auth and mock auth
-- These policies allow access when either authenticated OR when there's any session
CREATE POLICY "Allow authenticated access to units" 
  ON public.units 
  FOR ALL 
  USING (
    auth.role() = 'authenticated' OR 
    auth.uid() IS NOT NULL OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );

CREATE POLICY "Allow authenticated access to queue" 
  ON public.queue 
  FOR ALL 
  USING (
    auth.role() = 'authenticated' OR 
    auth.uid() IS NOT NULL OR
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );

-- Enable RLS on both tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
