
export interface AccommodationType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface DHQLivingUnit {
  id: string;
  queueId: string;
  quarterName: string;
  location: string;
  category: string;
  accommodationTypeId: string;
  noOfRooms: number;
  status: string;
  typeOfOccupancy: string;
  bq: boolean;
  noOfRoomsInBq: number;
  blockName: string;
  flatHouseRoomName: string;
  unitName: string | null;
  blockImageUrl: string | null;
  currentOccupantId: string | null;
  currentOccupantName: string | null;
  currentOccupantRank: string | null;
  currentOccupantServiceNumber: string | null;
  occupancyStartDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Snake case versions for backward compatibility
  accommodation_type_id?: string;
  no_of_rooms?: number;
  type_of_occupancy?: string;
  no_of_rooms_in_bq?: number;
  flat_house_room_name?: string;
  unit_name?: string | null;
  block_image_url?: string | null;
  current_occupant_id?: string | null;
  current_occupant_name?: string | null;
  current_occupant_rank?: string | null;
  current_occupant_service_number?: string | null;
  occupancy_start_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DHQLivingUnitWithHousingType extends DHQLivingUnit {
  accommodationType?: AccommodationType;
  housing_type?: AccommodationType;
}

export interface UnitOccupant {
  id: string;
  unit_id: string | null;
  full_name: string;
  rank: string;
  service_number: string;
  phone?: string | null;
  email?: string | null;
  emergency_contact?: string | null;
  occupancy_start_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitHistory {
  id: string;
  unit_id: string | null;
  occupant_name: string;
  rank: string;
  service_number: string;
  start_date: string;
  end_date?: string | null;
  duration_days?: number | null;
  reason_for_leaving?: string | null;
  created_at: string;
}

export interface UnitInventory {
  id: string;
  unit_id: string | null;
  quantity: number;
  item_description: string;
  item_location: string;
  item_status: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitMaintenance {
  id: string;
  unit_id: string | null;
  record_type?: string;
  maintenance_type: string;
  description: string;
  maintenance_date: string;
  performed_by: string;
  cost?: number | null;
  status: string;
  priority: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}
