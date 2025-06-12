
-- Create allocation_requests table for pending approvals
CREATE TABLE public.allocation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  letter_id TEXT NOT NULL UNIQUE,
  personnel_data JSONB NOT NULL, -- Store personnel info for the letter
  unit_data JSONB NOT NULL, -- Store unit info for the letter
  allocation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'refused')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  refusal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stamp_settings table for allocation letter stamps
CREATE TABLE public.stamp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stamp_name TEXT NOT NULL,
  stamp_rank TEXT NOT NULL,
  stamp_appointment TEXT NOT NULL,
  stamp_note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default stamp settings
INSERT INTO public.stamp_settings (stamp_name, stamp_rank, stamp_appointment, stamp_note, is_active)
VALUES ('John Doe', 'Major General', 'Chief of Staff', 'For and on behalf of the Chief of Army Staff', true);

-- Add foreign key relationships
ALTER TABLE public.allocation_requests 
ADD CONSTRAINT fk_allocation_requests_personnel 
FOREIGN KEY (personnel_id) REFERENCES public.queue(id) ON DELETE CASCADE;

ALTER TABLE public.allocation_requests 
ADD CONSTRAINT fk_allocation_requests_unit 
FOREIGN KEY (unit_id) REFERENCES public.dhq_living_units(id) ON DELETE CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.allocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all authenticated users for now)
CREATE POLICY "Allow all operations for authenticated users" 
ON public.allocation_requests 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" 
ON public.stamp_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create function to generate unique letter IDs
CREATE OR REPLACE FUNCTION public.generate_letter_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  letter_id TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6 digits for the xx/xx part
    letter_id := 'DHQ/GAR/ABJ/' || 
                 LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0') || '/' ||
                 LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0') || '/LOG';
    
    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM public.allocation_requests WHERE letter_id = letter_id) INTO exists_check;
    
    -- Exit loop if ID is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN letter_id;
END;
$$;
