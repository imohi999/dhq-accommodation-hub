"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Home,
	Users,
	Shield,
	Anchor,
	Plane,
	Calendar,
	Phone,
	MapPin,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { LoadingState } from "@/components/ui/spinner";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface PersonnelData {
	fullName?: string;
	full_name?: string;
	rank?: string;
	serviceNumber?: string;
	svc_no?: string;
	svcNo?: string;
	maritalStatus?: string;
	phone?: string;
	arm_of_service?: string;
	category?: string;
	gender?: string;
	appointment?: string;
	current_unit?: string;
	currentUnit?: string;
	noOfChildDependents?: number;
	noOfAdultDependents?: number;
	dependents?: Array<{
		name: string;
		age: number;
		gender: string;
	}>;
}

interface UnitData {
	quarterName?: string;
	quarter_name?: string;
	unitName?: string;
	flat_house_room_name?: string;
	flatHouseRoomName?: string;
	blockName?: string;
	block_name?: string;
	accommodationType?: string;
	noOfRooms?: number;
}

interface UnitOccupant {
	fullName: string;
	rank: string;
	serviceNumber: string;
	phone?: string;
	email?: string;
	emergencyContact?: string;
	isCurrent: boolean;
	queue?: {
		maritalStatus?: string;
		category?: string;
		gender?: string;
		appointment?: string;
		currentUnit?: string;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		dependents?: Array<{
			name: string;
			relationship: string;
			age?: number;
		}>;
	};
}

interface BaseRecord {
	id: string;
	type: "queue" | "active" | "pending" | "past";
	createdAt?: string;
	updatedAt?: string;
}

interface QueueRecord extends BaseRecord {
	type: "queue";
	sequence: number;
	fullName: string;
	rank: string;
	svcNo: string;
	maritalStatus: string;
	phone?: string;
	entryDateTime: string;
	armOfService?: string;
	category?: string;
	gender?: string;
	appointment?: string;
	currentUnit?: string;
	noOfAdultDependents?: number;
	noOfChildDependents?: number;
	dependents?: Array<{
		name: string;
		age: number;
		gender: string;
	}>;
}

interface ActiveRecord extends BaseRecord {
	type: "active";
	currentOccupantName: string;
	currentOccupantRank: string;
	currentOccupantServiceNumber: string;
	quarterName?: string;
	quarter_name?: string;
	flatHouseRoomName?: string;
	flat_house_room_name?: string;
	blockName?: string;
	block_name?: string;
	location?: string;
	noOfRooms?: number;
	bq?: boolean;
	noOfRoomsInBq?: number;
	accommodationType?: {
		id: string;
		name: string;
	};
	allocation_date?: string;
	occupancyStartDate?: string;
	arm_of_service?: string;
	category?: string;
	gender?: string;
	appointment?: string;
	current_unit?: string;
	phone?: string;
	marital_status?: string;
	occupants?: UnitOccupant[];
}

interface PendingRecord extends BaseRecord {
	type: "pending";
	personnelData: PersonnelData;
	unitData: UnitData;
	letterId: string;
	createdAt: string;
	queue?: {
		dependents?: Array<{
			name: string;
			age: number;
			gender: string;
		}>;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		[key: string]: any;
	};
}

interface PastRecord extends BaseRecord {
	type: "past";
	personnelData: PersonnelData;
	unitData: UnitData;
	allocationStartDate: string;
	allocationEndDate?: string | null;
	letterId: string;
}

type Record = QueueRecord | ActiveRecord | PendingRecord | PastRecord;

// Helper function to extract arm of service from service number
const getArmOfService = (serviceNumber: string): string => {
	if (!serviceNumber) return "Unknown";
	const prefix = serviceNumber.substring(0, 3).toUpperCase();
	switch (prefix) {
		case "NA/":
			return "Army";
		case "NN/":
			return "Navy";
		case "AF/":
			return "Air Force";
		default:
			return "Unknown";
	}
};

// Helper functions to get personnel info
const getPersonnelName = (record: Record): string => {
	switch (record.type) {
		case "queue":
			return record.fullName;
		case "active":
			return record.currentOccupantName;
		case "pending":
			return (
				record.personnelData?.fullName || record.personnelData?.full_name || ""
			);
		case "past":
			return (
				record.personnelData?.fullName || record.personnelData?.full_name || ""
			);
		default:
			return "";
	}
};

const getPersonnelRank = (record: Record): string => {
	switch (record.type) {
		case "queue":
			return record.rank;
		case "active":
			return record.currentOccupantRank;
		case "pending":
			return record.personnelData?.rank || "";
		case "past":
			return record.personnelData?.rank || "";
		default:
			return "";
	}
};

const getPersonnelServiceNumber = (record: Record): string => {
	switch (record.type) {
		case "queue":
			return record.svcNo;
		case "active":
			return record.currentOccupantServiceNumber;
		case "pending":
			return (
				record.personnelData?.serviceNumber ||
				record.personnelData?.svc_no ||
				record.personnelData?.svcNo ||
				""
			);
		case "past":
			return (
				record.personnelData?.serviceNumber ||
				record.personnelData?.svc_no ||
				record.personnelData?.svcNo ||
				""
			);
		default:
			return "";
	}
};

const getUnitName = (record: Record): string => {
	switch (record.type) {
		case "active":
			return record.quarter_name || "";
		case "pending":
			return (
				record.unitData?.quarterName ||
				record.unitData?.quarter_name ||
				record.unitData?.unitName ||
				""
			);
		case "past":
			return (
				record.unitData?.quarterName ||
				record.unitData?.quarter_name ||
				record.unitData?.unitName ||
				""
			);
		default:
			return "N/A";
	}
};

const getStatusBadge = (type: string) => {
	const statusConfig = {
		queue: { label: "In Queue", variant: "secondary" as const },
		active: { label: "Active", variant: "default" as const },
		pending: { label: "Pending", variant: "outline" as const },
		past: { label: "Past", variant: "secondary" as const },
	};

	const config = statusConfig[type as keyof typeof statusConfig];
	return <Badge variant={config.variant}>{config.label}</Badge>;
};

const RecordCard = ({ record }: { record: Record }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const name = getPersonnelName(record) || "N/A";
	const rank = getPersonnelRank(record) || "N/A";
	const serviceNumber = getPersonnelServiceNumber(record) || "N/A";
	const armOfService = getArmOfService(serviceNumber);

	// Get additional details based on record type - now with consistent structure
	const getAdditionalInfo = () => {
		switch (record.type) {
			case "queue":
				return {
					maritalStatus: record.maritalStatus || "N/A",
					phone: record.phone || "N/A",
					category: record.category || "N/A",
					gender: record.gender || "N/A",
					appointment: record.appointment || "No Appointment",
					currentUnit: record.currentUnit || "No Unit",
					adultDependents: record.noOfAdultDependents || 0,
					childDependents: record.noOfChildDependents || 0,
					entryDate: record.entryDateTime,
					// Queue doesn't have unit details
					unitDetails: null,
				};
			case "active": {
				// Get phone from current occupant if available
				const currentOccupant = record.occupants?.find((o) => o.isCurrent);
				// Try to get queue data from any occupant (current or former) that has it
				const occupantWithQueue = record.occupants?.find((o) => o.isCurrent);
				const queueData = occupantWithQueue?.queue;
				return {
					maritalStatus: queueData?.maritalStatus || "N/A",
					phone: currentOccupant?.phone || record.phone || "N/A",
					category: queueData?.category || record.category || "N/A",
					gender: queueData?.gender || "N/A",
					appointment: queueData?.appointment || "No Appointment",
					currentUnit: queueData?.currentUnit || "No Unit",
					// Get dependent counts from queue data if available
					adultDependents: queueData?.noOfAdultDependents || 0,
					childDependents: queueData?.noOfChildDependents || 0,
					entryDate: record.allocation_date || record.occupancyStartDate,
					// Unit details for active allocations
					unitDetails: {
						location: record.location,
						quarterName: record.quarterName || record.quarter_name,
						blockName: record.blockName || record.block_name,
						flatHouseRoomName:
							record.flatHouseRoomName || record.flat_house_room_name,
						noOfRooms: record.noOfRooms,
						bq: record.bq,
						noOfRoomsInBq: record.noOfRoomsInBq,
						accommodationType: record.accommodationType,
					},
				};
			}
			case "pending":
				return {
					maritalStatus: record.personnelData?.maritalStatus || "N/A",
					phone: record.personnelData?.phone || "N/A",
					category: record.personnelData?.category || "N/A",
					gender: record.personnelData?.gender || "N/A",
					appointment: record.personnelData?.appointment || "No Appointment",
					currentUnit:
						record.personnelData?.current_unit ||
						record.personnelData?.currentUnit ||
						"No Unit",
					adultDependents:
						record.queue?.noOfAdultDependents ||
						record.personnelData?.noOfAdultDependents ||
						0,
					childDependents:
						record.queue?.noOfChildDependents ||
						record.personnelData?.noOfChildDependents ||
						0,
					entryDate: record.createdAt,
					// Unit details for pending allocations
					unitDetails: {
						quarterName:
							record.unitData?.quarterName ||
							record.unitData?.quarter_name ||
							record.unitData?.unitName,
						blockName: record.unitData?.unitName,
						noOfRooms: record?.unitData?.noOfRooms,
						accommodationType: record?.unitData?.accommodationType,
					},
				};
			case "past":
				return {
					maritalStatus: record.personnelData?.maritalStatus || "N/A",
					phone: record.personnelData?.phone || "N/A",
					category: record.personnelData?.category || "N/A",
					gender: record.personnelData?.gender || "N/A",
					appointment: record.personnelData?.appointment || "No Appointment",
					currentUnit:
						record.personnelData?.current_unit ||
						record.personnelData?.currentUnit ||
						"No Unit",
					adultDependents: 0,
					childDependents: 0,
					entryDate: record.allocationStartDate,
					// Unit details for past allocations
					unitDetails: {
						quarterName:
							record.unitData?.quarterName ||
							record.unitData?.quarter_name ||
							record.unitData?.unitName,
						blockName: record.unitData?.block_name,
						flatHouseRoomName:
							record.unitData?.flat_house_room_name ||
							record.unitData?.flatHouseRoomName,
					},
				};
			default:
				return {
					maritalStatus: "N/A",
					phone: "N/A",
					category: "N/A",
					gender: "N/A",
					appointment: "No Appointment",
					currentUnit: "No Unit",
					adultDependents: 0,
					childDependents: 0,
					entryDate: null,
					unitDetails: null,
				};
		}
	};

	const additionalInfo = getAdditionalInfo();

	// Format unit display name consistently
	const getUnitDisplayName = () => {
		if (!additionalInfo.unitDetails) return null;
		const { quarterName, blockName, flatHouseRoomName } =
			additionalInfo.unitDetails;
		return (
			[blockName, flatHouseRoomName, quarterName].filter(Boolean).join(" ") ||
			null
		);
	};

	const unitDisplayName = getUnitDisplayName();

	return (
		<Collapsible open={isExpanded}>
			<Card className='hover:shadow-md transition-shadow'>
				<CardContent className='p-6'>
					{/* Header section - consistent across all types */}
					<div className='flex items-start justify-between mb-4'>
						<div className='flex-1'>
							<div className='flex items-center justify-between'>
								<h3 className='text-lg font-semibold'>
									{rank} {name}
								</h3>
								{getStatusBadge(record.type)}
							</div>
							<p className='text-sm text-muted-foreground mt-1'>
								Svc No: {serviceNumber} • {additionalInfo.currentUnit} •{" "}
								{additionalInfo.appointment}
							</p>
						</div>
					</div>

					{/* Content section - uniform structure for all types */}
					<div className='grid grid-cols-1 gap-3'>
						{/* Service and category badges */}
						<div className='flex items-center gap-4 text-sm'>
							<Badge variant='outline' className='text-xs'>
								{armOfService} • {additionalInfo.category}
							</Badge>
							<span className='text-muted-foreground'>
								{additionalInfo.gender} • {additionalInfo.maritalStatus}
							</span>
						</div>

						{/* Dependents count - show for queue records and active records with queue data */}
						{
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<Users className='h-4 w-4' />
								<span>
									A:{additionalInfo.adultDependents} C:
									{additionalInfo.childDependents}
								</span>
							</div>
						}

						{/* Phone number */}
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<Phone className='h-4 w-4' />
							<span>{additionalInfo.phone}</span>
						</div>

						{/* Entry/Allocation date */}
						{additionalInfo.entryDate && (
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<Calendar className='h-4 w-4' />
								<span>
									{record.type === "queue" ? "Entry" : "Allocation"} Date:{" "}
									{new Date(additionalInfo.entryDate).toLocaleDateString()}
								</span>
							</div>
						)}

						{/* Unit details for active, pending, and past allocations */}
						{record.type !== "queue" && unitDisplayName && (
							<div className='flex items-center gap-2 text-sm'>
								<MapPin className='h-4 w-4 text-muted-foreground' />
								<span className='font-medium'>{unitDisplayName}</span>
							</div>
						)}

						{/* Room details for active allocations */}
						{additionalInfo.unitDetails && (
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<Home className='h-4 w-4' />
								<span>
									{additionalInfo.unitDetails.noOfRooms || 0} Room
									{additionalInfo.unitDetails.noOfRooms !== 1 ? "s" : ""}
								</span>
								{additionalInfo.unitDetails.bq &&
									additionalInfo.unitDetails.noOfRoomsInBq !== undefined &&
									additionalInfo.unitDetails.noOfRoomsInBq > 0 && (
										<Badge variant='secondary' className='text-xs ml-2'>
											BQ: {additionalInfo.unitDetails.noOfRoomsInBq} Room
											{additionalInfo.unitDetails.noOfRoomsInBq !== 1
												? "s"
												: ""}
										</Badge>
									)}
							</div>
						)}

						{/* Always show expand button for additional details */}
						<CollapsibleTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setIsExpanded(!isExpanded)}
								className='w-full justify-between mt-2'>
								<span className='text-xs'>View More Details</span>
								{isExpanded ? (
									<ChevronUp className='h-3 w-3' />
								) : (
									<ChevronDown className='h-3 w-3' />
								)}
							</Button>
						</CollapsibleTrigger>
					</div>

					{/* Expandable details section */}
					<CollapsibleContent>
						<div className='mt-4 pt-4 border-t space-y-2'>
							{/* Allocation period for past allocations */}
							{record.type === "past" && record.allocationStartDate && (
								<div className='text-sm'>
									<span className='text-muted-foreground'>
										Allocation Period:
									</span>{" "}
									{new Date(record.allocationStartDate).toLocaleDateString()} -{" "}
									{record.allocationEndDate
										? new Date(record.allocationEndDate).toLocaleDateString()
										: "Present"}
								</div>
							)}

							{/* Dependents details for queue records, active records, and pending records */}
							{((record.type === "queue" &&
								record.dependents &&
								record.dependents.length > 0) ||
								(record.type === "active" &&
									record.occupants?.find((o) => o.isCurrent)?.queue?.dependents &&
									record.occupants.find((o) => o.isCurrent)?.queue?.dependents.length > 0) ||
								(record.type === "pending" &&
									record.queue?.dependents &&
									record.queue.dependents.length > 0)) && (
								<div>
									<h4 className='text-sm font-semibold mb-2'>
										Dependents Details
									</h4>
									<div className='space-y-2'>
										{(record?.type === "queue"
											? record?.dependents
											: record?.type === "active"
											? record?.occupants?.find((o) => o.isCurrent)?.queue?.dependents || []
											: record?.type === "pending"
											? record?.queue?.dependents || []
											: []
										)?.map((dependent: any, idx: number) => (
											<div
												key={idx}
												className='flex items-center justify-between p-2 bg-muted rounded-lg'>
												<div className='flex items-center gap-4'>
													<span className='text-sm font-medium'>
														{dependent.name}
													</span>
													<Badge variant='outline' className='text-xs'>
														{dependent.gender}
													</Badge>
													<span className='text-sm text-muted-foreground'>
														{dependent.age} years
													</span>
												</div>
												<Badge variant='secondary' className='text-xs'>
													{dependent.age >= 18 ? "Adult" : "Child"}
												</Badge>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</CollapsibleContent>
				</CardContent>
			</Card>
		</Collapsible>
	);
};

// Helper function to get category from record
const getCategory = (record: Record): string => {
	switch (record.type) {
		case "queue":
			return record.category || "";
		case "active":
			return record.category || "";
		case "pending":
			return record.personnelData?.category || "";
		case "past":
			return record.personnelData?.category || "";
		default:
			return "";
	}
};

// Summary Cards Component
const ServiceSummaryCards = ({ records }: { records: Record[] }) => {
	const totalCount = records.length;

	// Filter records by service
	const armyRecords = records.filter(
		(r) => getArmOfService(getPersonnelServiceNumber(r)) === "Army"
	);
	const navyRecords = records.filter(
		(r) => getArmOfService(getPersonnelServiceNumber(r)) === "Navy"
	);
	const airForceRecords = records.filter(
		(r) => getArmOfService(getPersonnelServiceNumber(r)) === "Air Force"
	);

	// Count officers and NCOs for each service
	const armyOfficers = armyRecords.filter(
		(r) => getCategory(r) === "Officer"
	).length;
	const armyNCOs = armyRecords.filter((r) => getCategory(r) === "NCOs").length;

	const navyOfficers = navyRecords.filter(
		(r) => getCategory(r) === "Officer"
	).length;
	const navyNCOs = navyRecords.filter((r) => getCategory(r) === "NCOs").length;

	const airForceOfficers = airForceRecords.filter(
		(r) => getCategory(r) === "Officer"
	).length;
	const airForceNCOs = airForceRecords.filter(
		(r) => getCategory(r) === "NCOs"
	).length;

	return (
		<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
			<Card className='bg-gray-50 dark:bg-gray-900'>
				<CardContent className='p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Total Personnel</p>
							<p className='text-3xl font-bold'>{totalCount}</p>
							<p className='text-sm text-muted-foreground'>
								Officers:{" "}
								{records.filter((r) => getCategory(r) === "Officer").length} |
								NCOs: {records.filter((r) => getCategory(r) === "NCOs").length}
							</p>
						</div>
						<Users className='h-8 w-8 text-muted-foreground' />
					</div>
				</CardContent>
			</Card>

			<Card className='bg-red-50 dark:bg-red-950'>
				<CardContent className='p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-red-700 dark:text-red-300'>Army</p>
							<p className='text-3xl font-bold text-red-800 dark:text-red-200'>
								{armyRecords.length}
							</p>
							<p className='text-sm text-red-600 dark:text-red-400'>
								Officers: {armyOfficers} | NCOs: {armyNCOs}
							</p>
						</div>
						<Shield className='h-8 w-8 text-red-600 dark:text-red-400' />
					</div>
				</CardContent>
			</Card>

			<Card className='bg-blue-50 dark:bg-blue-950'>
				<CardContent className='p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-blue-700 dark:text-blue-300'>Navy</p>
							<p className='text-3xl font-bold text-blue-800 dark:text-blue-200'>
								{navyRecords.length}
							</p>
							<p className='text-sm text-blue-600 dark:text-blue-400'>
								Officers: {navyOfficers} | NCOs: {navyNCOs}
							</p>
						</div>
						<Anchor className='h-8 w-8 text-blue-600 dark:text-blue-400' />
					</div>
				</CardContent>
			</Card>

			<Card className='bg-sky-50 dark:bg-sky-950'>
				<CardContent className='p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-sky-700 dark:text-sky-300'>
								Air Force
							</p>
							<p className='text-3xl font-bold text-sky-800 dark:text-sky-200'>
								{airForceRecords.length}
							</p>
							<p className='text-sm text-sky-600 dark:text-sky-400'>
								Officers: {airForceOfficers} | NCOs: {airForceNCOs}
							</p>
						</div>
						<Plane className='h-8 w-8 text-sky-600 dark:text-sky-400' />
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default function DirectoryPage() {
	const [records, setRecords] = useState<Record[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<string>("all");
	const [filterService, setFilterService] = useState<string>("all");
	const [filterCategory, setFilterCategory] = useState<string>("all");

	useEffect(() => {
		fetchAllRecords();
	}, []);

	const fetchAllRecords = async () => {
		setLoading(true);
		try {
			const [queueRes, activeRes, pendingRes, pastRes] = await Promise.all([
				fetch("/api/queue"),
				fetch("/api/dhq-living-units?status=Occupied"),
				fetch("/api/allocations/requests?status=pending"),
				fetch("/api/allocations/past"),
			]);

			const [queueData, activeData, pendingData, pastData] = await Promise.all([
				queueRes.json(),
				activeRes.json(),
				pendingRes.json(),
				pastRes.json(),
			]);

			// Fix: API responses don't have 'data' property, they return arrays directly
			const allRecords: Record[] = [
				...(Array.isArray(queueData) ? queueData : queueData.data || []).map(
					(item: Omit<QueueRecord, "type">) => ({
						...item,
						type: "queue" as const,
					})
				),
				...(Array.isArray(activeData) ? activeData : activeData.data || []).map(
					(item: Omit<ActiveRecord, "type">) => ({
						...item,
						type: "active" as const,
					})
				),
				...(Array.isArray(pendingData)
					? pendingData
					: pendingData.data || []
				).map((item: Omit<PendingRecord, "type">) => ({
					...item,
					type: "pending" as const,
				})),
				...(Array.isArray(pastData) ? pastData : pastData.data || []).map(
					(item: Omit<PastRecord, "type">) => ({
						...item,
						type: "past" as const,
					})
				),
			];

			setRecords(allRecords);
		} catch (error) {
			console.error("Failed to fetch records:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredRecords = records.filter((record) => {
		const matchesSearch =
			searchTerm === "" ||
			getPersonnelName(record)
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			getPersonnelServiceNumber(record)
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			getPersonnelRank(record)
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			getUnitName(record).toLowerCase().includes(searchTerm.toLowerCase());

		const matchesType = filterType === "all" || record.type === filterType;

		const serviceNumber = getPersonnelServiceNumber(record);
		const armOfService = getArmOfService(serviceNumber);
		const matchesService =
			filterService === "all" || armOfService === filterService;

		const category = getCategory(record);
		const matchesCategory =
			filterCategory === "all" || category === filterCategory;

		return matchesSearch && matchesType && matchesService && matchesCategory;
	});

	if (loading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Personnel Directory</h1>
				<p className='text-muted-foreground'>
					Search and view all personnel across queue, active allocations, and
					historical records
				</p>
			</div>

			<ServiceSummaryCards records={records} />

			<div className='flex gap-4 flex-wrap'>
				<div className='relative flex-1 min-w-[300px]'>
					<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search by name, service number, rank, or unit...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-10'
					/>
				</div>
				<Select value={filterType} onValueChange={setFilterType}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Records</SelectItem>
						<SelectItem value='queue'>In Queue</SelectItem>
						<SelectItem value='active'>Active Allocations</SelectItem>
						<SelectItem value='pending'>Pending Approval</SelectItem>
						<SelectItem value='past'>Past Allocations</SelectItem>
					</SelectContent>
				</Select>
				<Select value={filterService} onValueChange={setFilterService}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by service' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Services</SelectItem>
						<SelectItem value='Army'>Army</SelectItem>
						<SelectItem value='Navy'>Navy</SelectItem>
						<SelectItem value='Air Force'>Air Force</SelectItem>
					</SelectContent>
				</Select>
				<Select value={filterCategory} onValueChange={setFilterCategory}>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Filter by category' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Categories</SelectItem>
						<SelectItem value='Officer'>Officers</SelectItem>
						<SelectItem value='NCOs'>NCOs</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{filteredRecords.map((record) => (
					<RecordCard key={`${record.type}-${record.id}`} record={record} />
				))}
			</div>

			{filteredRecords.length === 0 && (
				<Card>
					<CardContent className='flex flex-col items-center justify-center py-10'>
						<Users className='h-12 w-12 text-muted-foreground mb-4' />
						<p className='text-muted-foreground text-center'>
							No records found matching your search criteria
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
