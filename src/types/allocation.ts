
import { QueueItem } from "./queue";
import { DHQLivingUnitWithHousingType } from "./accommodation";

export interface AllocationRequest {
  id: string;
  personnel_id: string;
  unit_id: string;
  letter_id: string;
  personnel_data: QueueItem;
  unit_data: DHQLivingUnitWithHousingType;
  allocation_date: string;
  status: 'pending' | 'approved' | 'refused';
  approved_by?: string;
  approved_at?: string;
  refusal_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface StampSettings {
  id: string;
  stamp_name: string;
  stamp_rank: string;
  stamp_appointment: string;
  stamp_note?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AllocationLetterData {
  letterRef: string;
  date: string;
  personnel: {
    name: string;
    rank: string;
    serviceNumber: string;
    unit: string;
    maritalStatus: string;
    dependents: {
      adults: number;
      children: number;
    };
  };
  accommodation: {
    type: string;
    location: string;
    quarter: string;
    block: string;
    flatHouseRoom: string;
    rooms: number;
  };
  stamp: {
    name: string;
    rank: string;
    appointment: string;
    note?: string;
  };
}
