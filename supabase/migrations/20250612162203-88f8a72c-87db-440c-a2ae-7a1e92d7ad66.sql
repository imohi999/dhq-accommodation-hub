
-- Add "Not In Use" status option and update existing table
ALTER TABLE dhq_living_units ADD COLUMN IF NOT EXISTS current_occupant_id UUID;
ALTER TABLE dhq_living_units ADD COLUMN IF NOT EXISTS current_occupant_name TEXT;
ALTER TABLE dhq_living_units ADD COLUMN IF NOT EXISTS current_occupant_rank TEXT;
ALTER TABLE dhq_living_units ADD COLUMN IF NOT EXISTS current_occupant_service_number TEXT;
ALTER TABLE dhq_living_units ADD COLUMN IF NOT EXISTS occupancy_start_date DATE;

-- Create unit_occupants table for current occupants
CREATE TABLE IF NOT EXISTS public.unit_occupants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  service_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  emergency_contact TEXT,
  occupancy_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unit_history table for occupancy history
CREATE TABLE IF NOT EXISTS public.unit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE,
  occupant_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  service_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  duration_days INTEGER,
  reason_for_leaving TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unit_inventory table
CREATE TABLE IF NOT EXISTS public.unit_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  item_description TEXT NOT NULL,
  item_location TEXT NOT NULL,
  item_status TEXT NOT NULL DEFAULT 'Functional',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unit_maintenance table
CREATE TABLE IF NOT EXISTS public.unit_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL,
  description TEXT NOT NULL,
  maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  performed_by TEXT NOT NULL,
  cost DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'Completed',
  priority TEXT NOT NULL DEFAULT 'Medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some dummy data for testing
-- Update some units to be occupied with occupant info
UPDATE dhq_living_units 
SET 
  status = 'Occupied',
  current_occupant_name = 'Major John Smith',
  current_occupant_rank = 'Major',
  current_occupant_service_number = 'A123456',
  occupancy_start_date = '2024-01-15'
WHERE quarter_name = 'Alpha Quarters' AND block_name = 'Block A';

UPDATE dhq_living_units 
SET 
  status = 'Occupied',
  current_occupant_name = 'Captain Sarah Wilson',
  current_occupant_rank = 'Captain',
  current_occupant_service_number = 'N789012',
  occupancy_start_date = '2024-03-01'
WHERE quarter_name = 'Navy Housing' AND block_name = 'Block N1';

UPDATE dhq_living_units 
SET 
  status = 'Not In Use'
WHERE quarter_name = 'Delta Complex' AND block_name = 'Block D';

-- Insert dummy history data
INSERT INTO unit_history (unit_id, occupant_name, rank, service_number, start_date, end_date, duration_days, reason_for_leaving)
SELECT 
  id,
  'Colonel James Brown',
  'Colonel',
  'A987654',
  '2023-06-01',
  '2023-12-31',
  213,
  'Transfer to new posting'
FROM dhq_living_units 
WHERE quarter_name = 'Alpha Quarters' AND block_name = 'Block A'
LIMIT 1;

INSERT INTO unit_history (unit_id, occupant_name, rank, service_number, start_date, end_date, duration_days, reason_for_leaving)
SELECT 
  id,
  'Lieutenant Commander Mike Davis',
  'Lt. Commander',
  'N456789',
  '2023-01-15',
  '2023-12-15',
  334,
  'Promotion and reassignment'
FROM dhq_living_units 
WHERE quarter_name = 'Navy Housing' AND block_name = 'Block N1'
LIMIT 1;

-- Insert dummy inventory data
INSERT INTO unit_inventory (unit_id, quantity, item_description, item_location, item_status, note)
SELECT 
  id,
  1,
  'Refrigerator',
  'Kitchen',
  'Functional',
  'Samsung model, recently serviced'
FROM dhq_living_units 
WHERE quarter_name = 'Alpha Quarters' AND block_name = 'Block A'
LIMIT 1;

INSERT INTO unit_inventory (unit_id, quantity, item_description, item_location, item_status, note)
SELECT 
  id,
  2,
  'Air Conditioner',
  'Bedroom',
  'Functional',
  'Split AC units, maintenance due next month'
FROM dhq_living_units 
WHERE quarter_name = 'Alpha Quarters' AND block_name = 'Block A'
LIMIT 1;

INSERT INTO unit_inventory (unit_id, quantity, item_description, item_location, item_status, note)
SELECT 
  id,
  1,
  'Water Heater',
  'Bathroom',
  'Non Functional',
  'Needs replacement - reported by current occupant'
FROM dhq_living_units 
WHERE quarter_name = 'Navy Housing' AND block_name = 'Block N1'
LIMIT 1;

-- Insert dummy maintenance data
INSERT INTO unit_maintenance (unit_id, maintenance_type, description, maintenance_date, performed_by, cost, status, priority, notes)
SELECT 
  id,
  'Plumbing',
  'Fixed leaking faucet in kitchen',
  '2024-05-15',
  'Maintenance Team Alpha',
  150.00,
  'Completed',
  'Medium',
  'Replaced worn washers and tightened connections'
FROM dhq_living_units 
WHERE quarter_name = 'Alpha Quarters' AND block_name = 'Block A'
LIMIT 1;

INSERT INTO unit_maintenance (unit_id, maintenance_type, description, maintenance_date, performed_by, cost, status, priority, notes)
SELECT 
  id,
  'Electrical',
  'AC unit maintenance and cleaning',
  '2024-04-20',
  'HVAC Specialists',
  200.00,
  'Completed',
  'High',
  'Annual maintenance completed, filters replaced'
FROM dhq_living_units 
WHERE quarter_name = 'Navy Housing' AND block_name = 'Block N1'
LIMIT 1;

INSERT INTO unit_maintenance (unit_id, maintenance_type, description, maintenance_date, performed_by, cost, status, priority, notes)
SELECT 
  id,
  'General',
  'Paint touch-up and minor repairs',
  '2024-06-01',
  'Maintenance Team Beta',
  75.00,
  'In Progress',
  'Low',
  'Scheduled for completion next week'
FROM dhq_living_units 
WHERE quarter_name = 'Delta Complex' AND block_name = 'Block D'
LIMIT 1;
