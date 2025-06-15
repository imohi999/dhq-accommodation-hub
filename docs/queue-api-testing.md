# Queue API Testing Guide

## Sample Data Structure

Based on the Prisma schema, the Queue API returns data in camelCase format:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "sequence": 1,
    "fullName": "John Doe",
    "svcNo": "NAF/12345",
    "gender": "Male",
    "armOfService": "Air Force",
    "category": "Officer",
    "rank": "Captain",
    "maritalStatus": "Married",
    "noOfAdultDependents": 1,
    "noOfChildDependents": 2,
    "currentUnit": "DHQ Garrison",
    "appointment": "Staff Officer",
    "dateTos": "2023-01-15T00:00:00.000Z",
    "dateSos": "2023-01-15T00:00:00.000Z",
    "phone": "+234-801-234-5678",
    "entryDateTime": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

## CURL Commands for Testing

### 1. Get All Queue Entries (Requires Authentication)

```bash
# First, you need to authenticate and save the session cookie
curl -X POST http://localhost:5001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}' \
  -c cookies.txt

# Then fetch queue data
curl -X GET http://localhost:5001/api/queue \
  -b cookies.txt \
  -H "Accept: application/json"
```

### 2. Get Queue with Filters

```bash
# Filter by gender and category
curl -X GET "http://localhost:5001/api/queue?gender=Male&category=Officer" \
  -b cookies.txt \
  -H "Accept: application/json"

# Search by name or service number
curl -X GET "http://localhost:5001/api/queue?search=John" \
  -b cookies.txt \
  -H "Accept: application/json"
```

### 3. Add New Queue Entry

```bash
curl -X POST http://localhost:5001/api/queue \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "svcNo": "NAF/67890",
    "gender": "Female",
    "armOfService": "Navy",
    "category": "Officer",
    "rank": "Lieutenant",
    "maritalStatus": "Single",
    "noOfAdultDependents": 0,
    "noOfChildDependents": 0,
    "currentUnit": "Naval Base",
    "appointment": "Operations Officer",
    "phone": "+234-802-345-6789"
  }'
```

### 4. Update Queue Entry

```bash
curl -X PUT http://localhost:5001/api/queue/{id} \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "maritalStatus": "Married",
    "noOfAdultDependents": 1
  }'
```

### 5. Delete Queue Entry (Admin Only)

```bash
curl -X DELETE http://localhost:5001/api/queue/{id} \
  -b cookies.txt
```

## Type Fixes Applied

The hook has been updated to:

1. **Remove pagination structure**: The API returns an array directly, not an object with `data` and `meta` properties.

2. **Add proper TypeScript interface**: Created `ApiQueueItem` interface matching the camelCase API response.

3. **Default empty array**: Added default value `[]` to prevent undefined errors in the component.

## Usage in Component

```typescript
const { data: queue = [], isLoading } = useQueueData(filters, {
  refetchInterval: 30000, // Auto-refresh every 30 seconds
});

// queue is now properly typed as ApiQueueItem[]
```

## Common Issues and Solutions

1. **401 Unauthorized**: Make sure you're authenticated before making requests.

2. **Type Mismatch**: The API returns camelCase properties (e.g., `fullName`), not snake_case.

3. **Missing Data**: Use default values in destructuring to prevent undefined errors.

4. **CORS Issues**: If testing from a different port, ensure CORS is configured in Next.js.