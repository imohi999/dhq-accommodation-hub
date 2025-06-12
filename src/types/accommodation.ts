
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
  status: 'Vacant' | 'Occupied';
  type_of_occupancy: 'Single' | 'Shared';
  bq: boolean;
  no_of_rooms_in_bq: number;
  block_name: string;
  flat_house_room_name: string;
  unit_name: string | null;
  block_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DHQLivingUnitWithHousingType extends DHQLivingUnit {
  housing_type?: HousingType;
}
