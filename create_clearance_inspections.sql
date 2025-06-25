-- Create clearance_inspections table
CREATE TABLE IF NOT EXISTS clearance_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  past_allocation_id UUID NOT NULL,
  inspector_svc_no VARCHAR NOT NULL,
  inspector_name VARCHAR NOT NULL,
  inspector_rank VARCHAR NOT NULL,
  inspector_category VARCHAR NOT NULL,
  inspector_appointment VARCHAR NOT NULL,
  inspection_date DATE NOT NULL,
  remarks TEXT,
  inventory_status JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_past_allocation
    FOREIGN KEY(past_allocation_id) 
    REFERENCES past_allocations(id)
    ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_clearance_inspections_past_allocation_id ON clearance_inspections(past_allocation_id);
CREATE INDEX idx_clearance_inspections_inspection_date ON clearance_inspections(inspection_date);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clearance_inspections_updated_at 
BEFORE UPDATE ON clearance_inspections 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();