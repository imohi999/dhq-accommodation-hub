
export interface Dependent {
  name: string;
  gender: string;
  age: number;
}

export interface QueueItem {
  id: string;
  sequence: number;
  full_name: string;
  fullName?: string;
  svc_no: string;
  svcNo?: string;
  gender: string;
  arm_of_service: string;
  armOfService?: string;
  category: string;
  rank: string;
  marital_status: string;
  maritalStatus?: string;
  no_of_adult_dependents: number;
  noOfAdultDependents?: number;
  no_of_child_dependents: number;
  noOfChildDependents?: number;
  dependents?: Dependent[];
  current_unit: string | null;
  currentUnit?: string | null;
  appointment: string | null;
  date_tos: string | null;
  dateTos?: string | null;
  date_sos: string | null;
  dateSos?: string | null;
  phone: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  entry_date_time: string;
  entryDateTime?: string;
}

export interface Unit {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface QueueFormProps {
  item: QueueItem | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface QueueFormData {
  full_name: string;
  svc_no: string;
  gender: string;
  arm_of_service: string;
  category: string;
  rank: string;
  marital_status: string;
  no_of_adult_dependents: number;
  no_of_child_dependents: number;
  dependents?: Dependent[];
  current_unit: string;
  appointment: string;
  date_tos: string;
  date_sos: string;
  phone: string;
  image_url?: string;
}
