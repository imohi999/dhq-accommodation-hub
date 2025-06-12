
-- Create the queue table
CREATE TABLE public.queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  svc_no TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  arm_of_service TEXT NOT NULL CHECK (arm_of_service IN ('Army', 'Navy', 'Air Force')),
  category TEXT NOT NULL CHECK (category IN ('Men', 'Officer')),
  rank TEXT NOT NULL,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  no_of_adult_dependents INTEGER NOT NULL DEFAULT 0 CHECK (no_of_adult_dependents >= 0 AND no_of_adult_dependents <= 99),
  no_of_child_dependents INTEGER NOT NULL DEFAULT 0 CHECK (no_of_child_dependents >= 0 AND no_of_child_dependents <= 99),
  current_unit TEXT,
  appointment TEXT,
  date_tos DATE,
  date_sos DATE,
  phone TEXT,
  entry_date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the units table for the dropdown
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some sample units
INSERT INTO public.units (name, description) VALUES
  ('1st Infantry Battalion', 'First Infantry Battalion'),
  ('2nd Armoured Regiment', 'Second Armoured Regiment'),
  ('3rd Artillery Battery', 'Third Artillery Battery'),
  ('Naval Base Lagos', 'Lagos Naval Base'),
  ('Air Force Base Kaduna', 'Kaduna Air Force Base'),
  ('Military Hospital', 'Central Military Hospital'),
  ('Defence Headquarters', 'Defence Headquarters Unit');

-- Create function to auto-generate sequence number
CREATE OR REPLACE FUNCTION generate_queue_sequence()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(sequence), 0) + 1 INTO NEW.sequence FROM public.queue;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate sequence on insert
CREATE TRIGGER trigger_generate_queue_sequence
  BEFORE INSERT ON public.queue
  FOR EACH ROW
  EXECUTE FUNCTION generate_queue_sequence();

-- Enable Row Level Security
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Create policies for queue table (allow all operations for authenticated users)
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

-- Create policies for units table (allow all operations for authenticated users)
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
