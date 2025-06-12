
-- Create a function to manage queue sequence reordering when someone is removed
CREATE OR REPLACE FUNCTION reorder_queue_sequences()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all sequences greater than the deleted one to move up by 1
  UPDATE public.queue 
  SET sequence = sequence - 1 
  WHERE sequence > OLD.sequence;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically reorder queue when someone is removed
CREATE TRIGGER reorder_queue_on_delete
  AFTER DELETE ON public.queue
  FOR EACH ROW
  EXECUTE FUNCTION reorder_queue_sequences();

-- Create a function to insert personnel at position #1 and move others down
CREATE OR REPLACE FUNCTION insert_at_queue_position_one(
  p_personnel_id uuid,
  p_full_name text,
  p_svc_no text,
  p_gender text,
  p_arm_of_service text,
  p_category text,
  p_rank text,
  p_marital_status text,
  p_no_of_adult_dependents integer,
  p_no_of_child_dependents integer,
  p_current_unit text,
  p_appointment text,
  p_date_tos date,
  p_date_sos date,
  p_phone text
) RETURNS void AS $$
BEGIN
  -- Move all existing queue items down by 1
  UPDATE public.queue SET sequence = sequence + 1;
  
  -- Insert the new personnel at position 1
  INSERT INTO public.queue (
    id, sequence, full_name, svc_no, gender, arm_of_service, category,
    rank, marital_status, no_of_adult_dependents, no_of_child_dependents,
    current_unit, appointment, date_tos, date_sos, phone
  ) VALUES (
    p_personnel_id, 1, p_full_name, p_svc_no, p_gender, p_arm_of_service, p_category,
    p_rank, p_marital_status, p_no_of_adult_dependents, p_no_of_child_dependents,
    p_current_unit, p_appointment, p_date_tos, p_date_sos, p_phone
  );
END;
$$ LANGUAGE plpgsql;

-- Create a table for past allocations to track allocation history
CREATE TABLE IF NOT EXISTS public.past_allocations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_id uuid NOT NULL,
  unit_id uuid NOT NULL,
  letter_id text NOT NULL,
  personnel_data jsonb NOT NULL,
  unit_data jsonb NOT NULL,
  allocation_start_date date NOT NULL,
  allocation_end_date date,
  duration_days integer,
  reason_for_leaving text,
  deallocation_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
