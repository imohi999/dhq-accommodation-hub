# DHQ Accommodation Hub Database Schema Analysis

## 1. Tables with Columns and Types

### profiles
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `user_id` - UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, UNIQUE
- `username` - TEXT UNIQUE NOT NULL
- `full_name` - TEXT
- `role` - app_role NOT NULL DEFAULT 'user'
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### user_roles
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `user_id` - UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
- `role` - app_role NOT NULL
- `assigned_at` - TIMESTAMP WITH TIME ZONE DEFAULT now()
- `assigned_by` - UUID REFERENCES auth.users(id)
- **Unique constraint**: (user_id, role)

### queue
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `sequence` - INTEGER NOT NULL (auto-generated via trigger)
- `full_name` - TEXT NOT NULL
- `svc_no` - TEXT NOT NULL UNIQUE
- `gender` - TEXT NOT NULL CHECK IN ('Male', 'Female')
- `arm_of_service` - TEXT NOT NULL CHECK IN ('Army', 'Navy', 'Air Force')
- `category` - TEXT NOT NULL CHECK IN ('Men', 'Officer')
- `rank` - TEXT NOT NULL
- `marital_status` - TEXT NOT NULL CHECK IN ('Single', 'Married', 'Divorced', 'Widowed')
- `no_of_adult_dependents` - INTEGER NOT NULL DEFAULT 0 CHECK (>= 0 AND <= 99)
- `no_of_child_dependents` - INTEGER NOT NULL DEFAULT 0 CHECK (>= 0 AND <= 99)
- `current_unit` - TEXT
- `appointment` - TEXT
- `date_tos` - DATE
- `date_sos` - DATE
- `phone` - TEXT
- `entry_date_time` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### units
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `name` - TEXT NOT NULL UNIQUE
- `description` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### housing_types
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `name` - TEXT NOT NULL UNIQUE
- `description` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### dhq_living_units
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `quarter_name` - TEXT NOT NULL
- `location` - TEXT NOT NULL
- `category` - TEXT NOT NULL
- `housing_type_id` - UUID REFERENCES housing_types(id) NOT NULL
- `no_of_rooms` - INTEGER NOT NULL DEFAULT 0
- `status` - TEXT NOT NULL DEFAULT 'Vacant' CHECK IN ('Vacant', 'Occupied', 'Not In Use')
- `type_of_occupancy` - TEXT NOT NULL DEFAULT 'Single' CHECK IN ('Single', 'Shared')
- `bq` - BOOLEAN NOT NULL DEFAULT false
- `no_of_rooms_in_bq` - INTEGER NOT NULL DEFAULT 0
- `block_name` - TEXT NOT NULL
- `flat_house_room_name` - TEXT NOT NULL
- `unit_name` - TEXT (auto-generated via trigger if not provided)
- `block_image_url` - TEXT
- `current_occupant_id` - UUID
- `current_occupant_name` - TEXT
- `current_occupant_rank` - TEXT
- `current_occupant_service_number` - TEXT
- `occupancy_start_date` - DATE
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### unit_occupants
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `unit_id` - UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE
- `full_name` - TEXT NOT NULL
- `rank` - TEXT NOT NULL
- `service_number` - TEXT NOT NULL
- `phone` - TEXT
- `email` - TEXT
- `emergency_contact` - TEXT
- `occupancy_start_date` - DATE NOT NULL DEFAULT CURRENT_DATE
- `is_current` - BOOLEAN NOT NULL DEFAULT true
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### unit_history
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `unit_id` - UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE
- `occupant_name` - TEXT NOT NULL
- `rank` - TEXT NOT NULL
- `service_number` - TEXT NOT NULL
- `start_date` - DATE NOT NULL
- `end_date` - DATE
- `duration_days` - INTEGER
- `reason_for_leaving` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### unit_inventory
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `unit_id` - UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE
- `quantity` - INTEGER NOT NULL DEFAULT 1
- `item_description` - TEXT NOT NULL
- `item_location` - TEXT NOT NULL
- `item_status` - TEXT NOT NULL DEFAULT 'Functional'
- `note` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### unit_maintenance
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `unit_id` - UUID REFERENCES dhq_living_units(id) ON DELETE CASCADE
- `maintenance_type` - TEXT NOT NULL
- `description` - TEXT NOT NULL
- `maintenance_date` - DATE NOT NULL DEFAULT CURRENT_DATE
- `performed_by` - TEXT NOT NULL
- `cost` - DECIMAL(10,2)
- `status` - TEXT NOT NULL DEFAULT 'Completed'
- `priority` - TEXT NOT NULL DEFAULT 'Medium'
- `notes` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### allocation_requests
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `personnel_id` - UUID NOT NULL REFERENCES queue(id) ON DELETE CASCADE
- `unit_id` - UUID NOT NULL REFERENCES dhq_living_units(id) ON DELETE CASCADE
- `letter_id` - TEXT NOT NULL UNIQUE
- `personnel_data` - JSONB NOT NULL
- `unit_data` - JSONB NOT NULL
- `allocation_date` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `status` - TEXT NOT NULL DEFAULT 'pending' CHECK IN ('pending', 'approved', 'refused')
- `approved_by` - UUID
- `approved_at` - TIMESTAMP WITH TIME ZONE
- `refusal_reason` - TEXT
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### stamp_settings
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `stamp_name` - TEXT NOT NULL
- `stamp_rank` - TEXT NOT NULL
- `stamp_appointment` - TEXT NOT NULL
- `stamp_note` - TEXT
- `is_active` - BOOLEAN NOT NULL DEFAULT true
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

### past_allocations
- `id` - UUID PRIMARY KEY (default: gen_random_uuid())
- `personnel_id` - UUID NOT NULL
- `unit_id` - UUID NOT NULL
- `letter_id` - TEXT NOT NULL
- `personnel_data` - JSONB NOT NULL
- `unit_data` - JSONB NOT NULL
- `allocation_start_date` - DATE NOT NULL
- `allocation_end_date` - DATE
- `duration_days` - INTEGER
- `reason_for_leaving` - TEXT
- `deallocation_date` - TIMESTAMP WITH TIME ZONE
- `created_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- `updated_at` - TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

## 2. Foreign Key Relationships

1. **profiles.user_id** → auth.users(id) ON DELETE CASCADE
2. **user_roles.user_id** → auth.users(id) ON DELETE CASCADE
3. **user_roles.assigned_by** → auth.users(id)
4. **dhq_living_units.housing_type_id** → housing_types(id)
5. **unit_occupants.unit_id** → dhq_living_units(id) ON DELETE CASCADE
6. **unit_history.unit_id** → dhq_living_units(id) ON DELETE CASCADE
7. **unit_inventory.unit_id** → dhq_living_units(id) ON DELETE CASCADE
8. **unit_maintenance.unit_id** → dhq_living_units(id) ON DELETE CASCADE
9. **allocation_requests.personnel_id** → queue(id) ON DELETE CASCADE
10. **allocation_requests.unit_id** → dhq_living_units(id) ON DELETE CASCADE

## 3. Indexes and Constraints

### Unique Constraints
- profiles: username, user_id
- user_roles: (user_id, role)
- queue: svc_no
- units: name
- housing_types: name
- allocation_requests: letter_id

### Check Constraints
- queue.gender IN ('Male', 'Female')
- queue.arm_of_service IN ('Army', 'Navy', 'Air Force')
- queue.category IN ('Men', 'Officer')
- queue.marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')
- queue.no_of_adult_dependents >= 0 AND <= 99
- queue.no_of_child_dependents >= 0 AND <= 99
- dhq_living_units.status IN ('Vacant', 'Occupied', 'Not In Use')
- dhq_living_units.type_of_occupancy IN ('Single', 'Shared')
- allocation_requests.status IN ('pending', 'approved', 'refused')

### Indexes
- idx_allocation_requests_status ON allocation_requests(status)
- idx_allocation_requests_personnel_id ON allocation_requests(personnel_id)
- idx_allocation_requests_unit_id ON allocation_requests(unit_id)

## 4. Special Features

### Custom Types (Enums)
- **app_role**: ENUM ('superadmin', 'admin', 'moderator', 'user')

### Triggers
1. **on_auth_user_created** - Creates profile and assigns role when new user signs up
2. **trigger_generate_queue_sequence** - Auto-generates sequence number for queue entries
3. **generate_unit_name_trigger** - Auto-generates unit_name from block_name + flat_house_room_name
4. **reorder_queue_on_delete** - Reorders queue sequences when an entry is deleted

### Functions
1. **has_role(_user_id UUID, _role app_role)** - Security definer function to check user roles
2. **get_user_profile(_user_id UUID)** - Returns user profile with roles array
3. **handle_new_user()** - Creates profile on user signup
4. **generate_queue_sequence()** - Generates next sequence number
5. **generate_unit_name()** - Generates unit name from block and flat names
6. **generate_letter_id()** - Generates unique letter IDs for allocations
7. **reorder_queue_sequences()** - Reorders queue after deletion
8. **insert_at_queue_position_one(...)** - Inserts personnel at position 1 and moves others down

### Row Level Security (RLS)
All tables have RLS enabled with various policies for authenticated users:
- profiles: Users can view/update own profile, superadmins can view/update all
- user_roles: Users can view own roles, superadmins can manage all
- queue, units: Authenticated users have full access
- dhq_living_units and related tables: Authenticated users have full access
- allocation_requests, stamp_settings: Authenticated users have full access

## 5. JSONB Columns (Need Special Handling for SQL Server)

1. **allocation_requests.personnel_data** - Stores personnel information for letters
2. **allocation_requests.unit_data** - Stores unit information for letters
3. **past_allocations.personnel_data** - Stores historical personnel data
4. **past_allocations.unit_data** - Stores historical unit data

### JSONB Structure Examples
These JSONB columns typically store structured data like:
```json
// personnel_data
{
  "full_name": "John Doe",
  "svc_no": "A12345",
  "rank": "Captain",
  "arm_of_service": "Army",
  "category": "Officer",
  "marital_status": "Married",
  "current_unit": "DHQ",
  "appointment": "Staff Officer",
  "phone": "+234-801-234-5678"
}

// unit_data
{
  "quarter_name": "Alpha Quarters",
  "location": "Main Base",
  "housing_type": "Three Bedroom Flat",
  "block_name": "Block A",
  "flat_house_room_name": "Flat 101",
  "unit_name": "Block A Flat 101"
}
```

## Migration Considerations for SQL Server

1. **UUID columns** → Use UNIQUEIDENTIFIER in SQL Server
2. **JSONB columns** → Use NVARCHAR(MAX) with JSON constraints
3. **ENUM types** → Use CHECK constraints or lookup tables
4. **gen_random_uuid()** → Use NEWID() or NEWSEQUENTIALID()
5. **TIMESTAMP WITH TIME ZONE** → Use DATETIMEOFFSET
6. **Row Level Security** → Implement via stored procedures or application logic
7. **Triggers and Functions** → Rewrite in T-SQL syntax