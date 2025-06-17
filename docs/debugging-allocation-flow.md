# Debugging Allocation Request Flow

## Summary of Changes

1. **Transaction-based Creation**: Allocation requests are now created and queue entries deleted in a single atomic transaction
2. **Data Transformation**: API endpoint transforms JSON data to camelCase for frontend compatibility
3. **Cache Invalidation**: Both queue and allocation request caches are invalidated after creation

## Data Flow

1. **Queue Page** → **AllocationModal** → **useAllocationRequestsData.createAllocationRequest()**

   - Generates letter ID
   - Calls `/api/allocations/requests` POST endpoint

2. **API Endpoint** (`/api/allocations/requests`)

   - Creates allocation request with pending status
   - Deletes queue entry
   - Reorders remaining queue entries
   - All in single transaction

3. **Data Storage**

   - `personnelData` stored as JSON with camelCase properties:
     - fullName, svcNo, rank, category, armOfService, etc.
   - `unitData` stored as JSON with camelCase properties:
     - quarterName, location, blockName, etc.

4. **Data Retrieval** (`/api/allocations/requests` GET)

   - Fetches allocation requests with personnel and unit relations
   - Transforms JSON data to ensure camelCase consistency
   - Returns transformed data

5. **Pending Allocations Page**

   - Fetches data via SWR with 30-second refresh
   - Passes data directly to PendingApprovalView (no transformation needed)

6. **PendingApprovalView Component**
   - Expects data structure:
     - `request.personnelData.fullName` (camelCase)
     - `request.personnelData.category` (for Officer/NCOs counts)
     - `request.personnel.armOfService` (for Army/Navy/Air Force counts)

## Debugging Steps

1. **Check Browser Console**

   ```javascript
   // In pending allocations page
   console.log("Raw allocation requests data:", data);
   ```

2. **Verify Database Data**

   ```sql
   SELECT * FROM allocation_requests WHERE status = 'pending';
   ```

3. **Check Personnel Data Structure**

   - Ensure `personnelData` JSON contains all required fields
   - Verify camelCase property names

4. **Test Cache Invalidation**
   - Create allocation request
   - Check if pending page updates immediately
   - Verify queue count decreases

## Common Issues

1. **No Data Showing**: Check if allocation requests are being created with 'pending' status
2. **Summary Cards Show 0**: Verify personnel.armOfService is populated in the database
3. **Data Not Updating**: Ensure SWR cache invalidation is working properly
