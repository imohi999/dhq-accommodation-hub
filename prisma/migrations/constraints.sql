-- Add CHECK constraints for enum-like fields

-- Role constraints
ALTER TABLE [dbo].[Profile] ADD CONSTRAINT CK_Profile_Role CHECK (role IN ('superadmin', 'admin', 'moderator', 'user'));
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT CK_UserRole_Role CHECK (role IN ('superadmin', 'admin', 'moderator', 'user'));

-- Queue constraints
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_Gender CHECK (gender IN ('Male', 'Female'));
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_ArmOfService CHECK (armOfService IN ('Nigerian Army', 'Nigerian Navy', 'Nigerian Air Force'));
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_Category CHECK (category IN ('NCOs', 'Officer'));
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_MaritalStatus CHECK (maritalStatus IN ('Single', 'Married', 'Divorced', 'Widowed'));
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_AdultDependents CHECK (noOfAdultDependents >= 0 AND noOfAdultDependents <= 99);
ALTER TABLE [dbo].[Queue] ADD CONSTRAINT CK_Queue_ChildDependents CHECK (noOfChildDependents >= 0 AND noOfChildDependents <= 99);

-- DhqLivingUnit constraints
ALTER TABLE [dbo].[DhqLivingUnit] ADD CONSTRAINT CK_DhqLivingUnit_Status CHECK (status IN ('Vacant', 'Occupied', 'Not In Use'));
ALTER TABLE [dbo].[DhqLivingUnit] ADD CONSTRAINT CK_DhqLivingUnit_OccupancyType CHECK (typeOfOccupancy IN ('Single', 'Shared'));

-- AllocationRequest constraints
ALTER TABLE [dbo].[AllocationRequest] ADD CONSTRAINT CK_AllocationRequest_Status CHECK (status IN ('pending', 'approved', 'refused'));

-- JSON constraints for NVARCHAR(MAX) columns
ALTER TABLE [dbo].[AllocationRequest] ADD CONSTRAINT CK_AllocationRequest_PersonnelData CHECK (ISJSON(personnelData) = 1);
ALTER TABLE [dbo].[AllocationRequest] ADD CONSTRAINT CK_AllocationRequest_UnitData CHECK (ISJSON(unitData) = 1);
ALTER TABLE [dbo].[PastAllocation] ADD CONSTRAINT CK_PastAllocation_PersonnelData CHECK (ISJSON(personnelData) = 1);
ALTER TABLE [dbo].[PastAllocation] ADD CONSTRAINT CK_PastAllocation_UnitData CHECK (ISJSON(unitData) = 1);