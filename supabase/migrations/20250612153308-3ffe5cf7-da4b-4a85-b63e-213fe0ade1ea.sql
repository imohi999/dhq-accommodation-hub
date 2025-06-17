
-- Create accomodation_types table
CREATE TABLE public.accomodation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 5 predefined accomodation types
INSERT INTO public.accomodation_types (name, description) VALUES
('One Bedroom Self Contained', 'Single bedroom with private facilities'),
('One Bedroom Flat', 'One bedroom apartment'),
('Two Bedroom Flat', 'Two bedroom apartment'),
('Three Bedroom Flat', 'Three bedroom apartment'),
('Duplex', 'Two-story residential unit');

-- Create dhq_living_units table
CREATE TABLE public.dhq_living_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter_name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  accomodation_type_id UUID REFERENCES public.accomodation_types(id) NOT NULL,
  no_of_rooms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied')),
  type_of_occupancy TEXT NOT NULL DEFAULT 'Single' CHECK (type_of_occupancy IN ('Single', 'Shared')),
  bq BOOLEAN NOT NULL DEFAULT false,
  no_of_rooms_in_bq INTEGER NOT NULL DEFAULT 0,
  block_name TEXT NOT NULL,
  flat_house_room_name TEXT NOT NULL,
  unit_name TEXT,
  block_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to auto-generate unit_name if not provided
CREATE OR REPLACE FUNCTION public.generate_unit_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unit_name IS NULL OR NEW.unit_name = '' THEN
    NEW.unit_name := NEW.block_name || ' ' || NEW.flat_house_room_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate unit_name
CREATE TRIGGER generate_unit_name_trigger
  BEFORE INSERT OR UPDATE ON public.dhq_living_units
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_unit_name();

-- Insert some dummy data
INSERT INTO public.dhq_living_units (
  quarter_name, location, category, accomodation_type_id, no_of_rooms, status, 
  type_of_occupancy, bq, no_of_rooms_in_bq, block_name, flat_house_room_name
) VALUES
('Officers Quarter A', 'Main Base', 'Officer', (SELECT id FROM accomodation_types WHERE name = 'Three Bedroom Flat'), 3, 'Occupied', 'Single', true, 2, 'Block A', 'Flat 101'),
('Soldiers Quarter B', 'East Wing', 'NCOs', (SELECT id FROM accomodation_types WHERE name = 'One Bedroom Flat'), 1, 'Vacant', 'Single', false, 0, 'Block B', 'Room 201'),
('Officers Quarter C', 'West Wing', 'Officer', (SELECT id FROM accomodation_types WHERE name = 'Duplex'), 4, 'Occupied', 'Single', true, 1, 'Block C', 'House 301'),
('Navy Quarter D', 'Naval Base', 'Officer', (SELECT id FROM accomodation_types WHERE name = 'Two Bedroom Flat'), 2, 'Vacant', 'Shared', false, 0, 'Block D', 'Flat 401'),
('Air Force Quarter E', 'Air Base', 'Officer', (SELECT id FROM accomodation_types WHERE name = 'One Bedroom Self Contained'), 1, 'Occupied', 'Single', false, 0, 'Block E', 'Unit 501');
