
// Re-export all functions for backward compatibility
export { generateLetterId } from "./letterIdApi";
export { 
  fetchAllocationRequestsFromDb, 
  createAllocationRequestInDb, 
  updateAllocationStatus 
} from "./allocationRequestsApi";
export { removeFromQueue, returnPersonnelToQueueAtPositionOne } from "./queueManagementApi";
export { updateUnitOccupancy } from "./unitManagementApi";
export { fetchPastAllocationsFromDb } from "./pastAllocationsApi";
export { transferPersonnelToNewUnit, deallocatePersonnelFromUnit } from "./allocationTransferApi";
