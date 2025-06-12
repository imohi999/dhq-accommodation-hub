
-- Add RLS policies for allocation_requests table
CREATE POLICY "Allow authenticated users to view allocation requests" 
ON public.allocation_requests 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create allocation requests" 
ON public.allocation_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update allocation requests" 
ON public.allocation_requests 
FOR UPDATE 
TO authenticated 
USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_allocation_requests_status ON public.allocation_requests(status);
CREATE INDEX IF NOT EXISTS idx_allocation_requests_personnel_id ON public.allocation_requests(personnel_id);
CREATE INDEX IF NOT EXISTS idx_allocation_requests_unit_id ON public.allocation_requests(unit_id);
