# Clearance Management Feature Requirements

## Overview
A new Clearance page under the Allocations section that allows users to view inventory for each occupied past allocation and log inspection information.

## Key Features

### 1. Clearance Page Location
- New page route: `/allocations/clearance`
- Positioned under Allocations menu, near Past Allocations

### 2. Inventory Inspection Tracking
- Display inventory list for each past allocation unit
- Track inspection status for each inventory item
- Compare original status vs inspection status
- Add new "inspection status" field with options:
  - Functional
  - Non Functional
  - Missing

### 3. Inspector Information
Required fields for logging inspections:
- Service Number (Svc No)
- Name
- Rank
- Category
- Appointment
- Date of Inspection
- Remarks (optional)

### 4. Clearance Letter Generation
- Button: "Clearance Letter"
- Generate official clearance certificate
- Include:
  - Personnel details
  - Unit information
  - Allocation period
  - Inspection details
  - Inspector information
  - Official stamp and signature

### 5. Data Persistence
- Store inspection records in `clearance_inspections` table
- Link to past allocations
- Track inventory status changes
- Maintain audit trail

## Technical Implementation

### Database Schema
```sql
CREATE TABLE clearance_inspections (
  id UUID PRIMARY KEY,
  past_allocation_id UUID REFERENCES past_allocations(id),
  inspector_svc_no VARCHAR,
  inspector_name VARCHAR,
  inspector_rank VARCHAR,
  inspector_category VARCHAR,
  inspector_appointment VARCHAR,
  inspection_date DATE,
  remarks TEXT,
  inventory_status JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### API Endpoints
- `GET /api/allocations/clearance` - Fetch past allocations with inventory and inspections
- `POST /api/allocations/clearance` - Create new inspection record

### UI Components
1. **ClearanceView** - Main page component with searchable table
2. **InspectionModal** - Form for logging/viewing inspections
3. **ClearanceLetter** - Letter generation and preview

### User Flow
1. Navigate to Clearance page
2. Search/filter past allocations
3. Click "Inspect" to open inspection modal
4. Review inventory and mark inspection status
5. Fill inspector details
6. Save inspection
7. Generate clearance letter

## Future Enhancements (Post-MVP)
- Export inspection reports to Excel/PDF
- Bulk inspection capabilities
- Email clearance letters
- Integration with inventory management system
- Dashboard for inspection statistics
- Mobile app support for field inspections