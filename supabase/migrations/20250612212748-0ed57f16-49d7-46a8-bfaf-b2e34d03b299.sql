
-- Fix the generate_letter_id function to avoid variable name conflict
DROP FUNCTION IF EXISTS public.generate_letter_id();

CREATE OR REPLACE FUNCTION public.generate_letter_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_letter_id TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate random 6 digits for the xx/xx part
    new_letter_id := 'DHQ/GAR/ABJ/' || 
                     LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0') || '/' ||
                     LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0') || '/LOG';
    
    -- Check if this ID already exists
    SELECT EXISTS(SELECT 1 FROM public.allocation_requests WHERE letter_id = new_letter_id) INTO exists_check;
    
    -- Exit loop if ID is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_letter_id;
END;
$$;
