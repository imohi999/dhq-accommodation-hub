
export interface HousingType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface DHQLivingUnit {
  id: string;
  quarter_name: string;
  location: string;
  category: string;
  housing_type_id: string;
  no_of_rooms: number;
  status: string;
  type_of_occupancy: string;
  bq: boolean;
  no_of_rooms_in_bq: number;
  block_name: string;
  flat_house_room_name: string;
  unit_name: string | null;
  block_image_url: string | null;
  current_occupant_id: string | null;
  current_occupant_name: string | null;
  current_occupant_rank: string | null;
  current_occupant_service_number: string | null;
  occupancy_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DHQLivingUnitWithHousingType extends DHQLivingUnit {
  housing_type?: HousingType;
}

export interface UnitOccupant {
  id: string;
  unit_id: string;
  full_name: string;
  rank: string;
  service_number: string;
  phone?: string;
  email?: string;
  emergency_contact?: string;
  occupancy_start_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitHistory {
  id: string;
  unit_id: string;
  occupant_name: string;
  rank: string;
  service_number: string;
  start_date: string;
  end_date?: string;
  duration_days?: number;
  reason_for_leaving?: string;
  created_at: string;
}

export interface UnitInventory {
  id: string;
  unit_id: string;
  quantity: number;
  item_description: string;
  item_location: string;
  item_status: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface UnitMaintenance {
  id: string;
  unit_id: string;
  maintenance_type: string;
  description: string;
  maintenance_date: string;
  performed_by: string;
  cost?: number;
  status: string;
  priority: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
