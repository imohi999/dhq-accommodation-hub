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
import { Label } from "@/components/ui/label";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RotateCcw, Check, ChevronsUpDown } from "lucide-react";

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
		armOfService?: string;
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
		armOfService?: string;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		[key: string]: any;
	};
}

interface PastRecord extends BaseRecord {
	type: "past";
	personnelData: PersonnelData;
	unitData: UnitData;
	unit: {
		quarterName: string;
		noOfRoomsInBq: number;
		location: string;
		category: string;
		accommodationTypeId: string;
		blockName: string;
		noOfRooms: string;
		status: string;
		typeOfOccupancy: string;
		bq: boolean;
		flatHouseRoomName: string;
		unitName: string;
		blockImageUrl: string;
	};
	allocationStartDate: string;
	allocationEndDate?: string | null;
	letterId: string;
	queue?: {
		maritalStatus?: string;
		category?: string;
		gender?: string;
		appointment?: string;
		currentUnit?: string;
		armOfService?: string;
		noOfAdultDependents?: number;
		noOfChildDependents?: number;
		dependents?: Array<{
			name: string;
			age: number;
			gender: string;
		}>;
	};
}

type Record = QueueRecord | ActiveRecord | PendingRecord | PastRecord;


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
	const armOfService = getArmOfService(record);

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
			case "past": {
				// {additionalInfo.unitDetails && (
				// 	<div className='flex items-center gap-2 text-sm text-muted-foreground'>
				// 		<Home className='h-4 w-4' />
				// 		<span>
				// 			{additionalInfo.unitDetails.noOfRooms || 0} Room
				// 			{additionalInfo.unitDetails.noOfRooms !== 1 ? "s" : ""}
				// 		</span>
				// 		{additionalInfo.unitDetails.bq &&
				// 			additionalInfo.unitDetails.noOfRoomsInBq !== undefined &&
				// 			additionalInfo.unitDetails.noOfRoomsInBq > 0 && (
				// 				<Badge variant='secondary' className='text-xs ml-2'>
				// 					BQ: {additionalInfo.unitDetails.noOfRoomsInBq} Room
				// 					{additionalInfo.unitDetails.noOfRoomsInBq !== 1
				// 						? "s"
				// 						: ""}
				// 				</Badge>
				// 			)}
				// 	</div>
				// )}
				// Get queue data if available, similar to active records
				const queueData = record.queue;
				return {
					maritalStatus:
						queueData?.maritalStatus && queueData.maritalStatus !== "Unknown"
							? queueData.maritalStatus
							: record.personnelData?.maritalStatus || "N/A",
					phone: record.personnelData?.phone || "N/A",
					category:
						queueData?.category && queueData.category !== "Unknown"
							? queueData.category
							: record.personnelData?.category || "N/A",
					gender:
						queueData?.gender && queueData.gender !== "Unknown"
							? queueData.gender
							: record.personnelData?.gender || "N/A",
					appointment:
						queueData?.appointment && queueData.appointment !== "Unknown"
							? queueData.appointment
							: record.personnelData?.appointment || "No Appointment",
					currentUnit:
						queueData?.currentUnit ||
						record.personnelData?.current_unit ||
						record.personnelData?.currentUnit ||
						"No Unit",
					// Get dependent counts from queue data if available
					adultDependents: queueData?.noOfAdultDependents || 0,
					childDependents: queueData?.noOfChildDependents || 0,
					entryDate: record.allocationStartDate,
					// Unit details for past allocations
					unitDetails: {
						location: record.unit.location,
						quarterName: record.unit.quarterName,
						blockName: record.unit.blockName,
						flatHouseRoomName: record.unit.flatHouseRoomName,
						noOfRooms: record.unit.noOfRooms,
						bq: record.unit.bq,
						noOfRoomsInBq: record.unit.noOfRoomsInBq,
						accommodationType: record.unitData.accommodationType,
					},
				};
			}
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
							{/* Dependents details for queue records, active records, pending records, and past records */}
							{((record.type === "queue" &&
								record.dependents &&
								record.dependents.length > 0) ||
								(record.type === "active" &&
									(record.occupants?.find((o) => o.isCurrent)?.queue?.dependents
										?.length ?? 0) > 0) ||
								(record.type === "pending" &&
									record.queue?.dependents &&
									record.queue.dependents.length > 0) ||
								(record.type === "past" &&
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
											? record.occupants?.find((o) => o.isCurrent)?.queue
													?.dependents || []
											: record?.type === "pending"
											? record?.queue?.dependents || []
											: record?.type === "past"
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

// Helper function to get arm of service from record
const getArmOfService = (record: Record): string => {
	switch (record.type) {
		case "queue":
			return record.armOfService || "Unknown";
		case "active": {
			// For active records, try to get from queue data first
			const currentOccupant = record.occupants?.find((o) => o.isCurrent);
			return currentOccupant?.queue?.armOfService || "Unknown";
		}
		case "pending":
			return record.personnelData?.arm_of_service || record.queue?.armOfService || "Unknown";
		case "past":
			return record.queue?.armOfService || "Unknown";
		default:
			return "Unknown";
	}
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
		(r) => getArmOfService(r) === "Nigerian Army"
	);
	const navyRecords = records.filter(
		(r) => getArmOfService(r) === "Nigerian Navy"
	);
	const airForceRecords = records.filter(
		(r) => getArmOfService(r) === "Nigerian Air Force"
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
							<p className='text-sm text-red-700 dark:text-red-300'>
								Nigerian Army
							</p>
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
							<p className='text-sm text-blue-700 dark:text-blue-300'>
								Nigerian Navy
							</p>
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
								Nigerian Air Force
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
	const [genderFilter, setGenderFilter] = useState("all");
	const [maritalStatusFilter, setMaritalStatusFilter] = useState("all");
	const [unitFilter, setUnitFilter] = useState("all");
	const [dependentsFilter, setDependentsFilter] = useState("all");
	const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);

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

	// Helper function to get additional info - used by RecordCard and filters
	const getAdditionalInfo = (record: Record) => {
		switch (record.type) {
			case "queue":
				return {
					currentUnit: record.currentUnit || "No Unit",
					maritalStatus: record.maritalStatus || "N/A",
					gender: record.gender || "N/A",
					adultDependents: record.noOfAdultDependents || 0,
					childDependents: record.noOfChildDependents || 0,
				};
			case "active": {
				const currentOccupant = record.occupants?.find((o) => o.isCurrent);
				const queueData = currentOccupant?.queue;
				return {
					currentUnit: queueData?.currentUnit || "No Unit",
					maritalStatus: queueData?.maritalStatus || "N/A",
					gender: queueData?.gender || "N/A",
					adultDependents: queueData?.noOfAdultDependents || 0,
					childDependents: queueData?.noOfChildDependents || 0,
				};
			}
			case "pending":
				return {
					currentUnit:
						record.personnelData?.current_unit ||
						record.personnelData?.currentUnit ||
						"No Unit",
					maritalStatus: record.personnelData?.maritalStatus || "N/A",
					gender: record.personnelData?.gender || "N/A",
					adultDependents:
						record.queue?.noOfAdultDependents ||
						record.personnelData?.noOfAdultDependents ||
						0,
					childDependents:
						record.queue?.noOfChildDependents ||
						record.personnelData?.noOfChildDependents ||
						0,
				};
			case "past": {
				const queueData = record.queue;
				return {
					currentUnit:
						queueData?.currentUnit ||
						record.personnelData?.current_unit ||
						record.personnelData?.currentUnit ||
						"No Unit",
					maritalStatus:
						queueData?.maritalStatus && queueData.maritalStatus !== "Unknown"
							? queueData.maritalStatus
							: record.personnelData?.maritalStatus || "N/A",
					gender:
						queueData?.gender && queueData.gender !== "Unknown"
							? queueData.gender
							: record.personnelData?.gender || "N/A",
					adultDependents: queueData?.noOfAdultDependents || 0,
					childDependents: queueData?.noOfChildDependents || 0,
				};
			}
			default:
				return {
					currentUnit: "No Unit",
					maritalStatus: "N/A",
					gender: "N/A",
					adultDependents: 0,
					childDependents: 0,
				};
		}
	};

	// Extract unique current units from all records
	const getUniqueCurrentUnits = () => {
		const units = new Set<string>();

		records.forEach((record: Record) => {
			const additionalInfo = getAdditionalInfo(record);
			if (
				additionalInfo.currentUnit &&
				additionalInfo.currentUnit !== "No Unit"
			) {
				units.add(additionalInfo.currentUnit);
			}
		});

		return Array.from(units).sort();
	};

	const uniqueCurrentUnits = getUniqueCurrentUnits();

	const handleResetFilters = () => {
		setSearchTerm("");
		setGenderFilter("all");
		setMaritalStatusFilter("all");
		setFilterCategory("all");
		setUnitFilter("all");
		setFilterService("all");
		setFilterType("all");
		setDependentsFilter("all");
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

		const armOfService = getArmOfService(record);
		const matchesService =
			filterService === "all" || armOfService === filterService;

		const category = getCategory(record);
		const matchesCategory =
			filterCategory === "all" || category === filterCategory;

		// Get additional info for other filters
		const additionalInfo = getAdditionalInfo(record);

		// Gender filter
		const matchesGender =
			genderFilter === "all" || additionalInfo.gender === genderFilter;

		// Marital status filter
		const matchesMaritalStatus =
			maritalStatusFilter === "all" ||
			additionalInfo.maritalStatus === maritalStatusFilter;

		// Unit filter
		const matchesUnit =
			unitFilter === "all" || additionalInfo.currentUnit === unitFilter;

		// Dependents filter
		const hasDependents =
			additionalInfo.adultDependents + additionalInfo.childDependents > 0;
		const matchesDependents =
			dependentsFilter === "all" ||
			(dependentsFilter === "with" && hasDependents) ||
			(dependentsFilter === "without" && !hasDependents);

		return (
			matchesSearch &&
			matchesType &&
			matchesService &&
			matchesCategory &&
			matchesGender &&
			matchesMaritalStatus &&
			matchesUnit &&
			matchesDependents
		);
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

			{/* Filters Section */}
			<div className='bg-white dark:bg-card p-6 rounded-lg border mb-6'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg font-semibold'>Filters</h3>
					<Button
						variant='outline'
						size='sm'
						onClick={handleResetFilters}
						className='flex items-center gap-2'>
						<RotateCcw className='h-4 w-4' />
						Reset Filters
					</Button>
				</div>

				{/* First row: Search and Service Branch */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
					<div className='space-y-2'>
						<Label htmlFor='search'>Search</Label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
							<Input
								id='search'
								placeholder='Search by name, service number, rank, or unit...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Service Branch</Label>
						<Select value={filterService} onValueChange={setFilterService}>
							<SelectTrigger>
								<SelectValue placeholder='All Services' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Services</SelectItem>
								<SelectItem value='Nigerian Army'>Nigerian Army</SelectItem>
								<SelectItem value='Nigerian Navy'>Nigerian Navy</SelectItem>
								<SelectItem value='Nigerian Air Force'>
									Nigerian Air Force
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Second row: Other filters */}
				<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
					<div className='space-y-2'>
						<Label>Status</Label>
						<Select value={filterType} onValueChange={setFilterType}>
							<SelectTrigger>
								<SelectValue placeholder='All Records' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Records</SelectItem>
								<SelectItem value='queue'>In Queue</SelectItem>
								<SelectItem value='active'>Active</SelectItem>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='past'>Past</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Category</Label>
						<Select value={filterCategory} onValueChange={setFilterCategory}>
							<SelectTrigger>
								<SelectValue placeholder='All Categories' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								<SelectItem value='NCOs'>NCOs</SelectItem>
								<SelectItem value='Officer'>Officer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Current Unit</Label>
						<Popover open={unitPopoverOpen} onOpenChange={setUnitPopoverOpen}>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={unitPopoverOpen}
									className='w-full justify-between font-normal'>
									{unitFilter === "all" ? "All Units" : unitFilter}
									<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-full p-0'>
								<Command>
									<CommandInput placeholder='Search units...' />
									<CommandEmpty>No unit found.</CommandEmpty>
									<CommandGroup>
										<CommandItem
											value='all'
											onSelect={() => {
												setUnitFilter("all");
												setUnitPopoverOpen(false);
											}}>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													unitFilter === "all" ? "opacity-100" : "opacity-0"
												)}
											/>
											All Units
										</CommandItem>
										{uniqueCurrentUnits.map((unit: string) => (
											<CommandItem
												key={unit}
												value={unit}
												onSelect={(currentValue) => {
													setUnitFilter(currentValue);
													setUnitPopoverOpen(false);
												}}>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														unitFilter === unit ? "opacity-100" : "opacity-0"
													)}
												/>
												{unit}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<div className='space-y-2'>
						<Label>Marital Status</Label>
						<Select
							value={maritalStatusFilter}
							onValueChange={setMaritalStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder='All Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='Single'>Single</SelectItem>
								<SelectItem value='Married'>Married</SelectItem>
								<SelectItem value='Divorced'>Divorced</SelectItem>
								<SelectItem value='Widowed'>Widowed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Dependents</Label>
						<Select
							value={dependentsFilter}
							onValueChange={setDependentsFilter}>
							<SelectTrigger>
								<SelectValue placeholder='All Personnel' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Personnel</SelectItem>
								<SelectItem value='with'>With Dependents</SelectItem>
								<SelectItem value='without'>Without Dependents</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label>Gender</Label>
						<Select value={genderFilter} onValueChange={setGenderFilter}>
							<SelectTrigger>
								<SelectValue placeholder='All Genders' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Genders</SelectItem>
								<SelectItem value='Male'>Male</SelectItem>
								<SelectItem value='Female'>Female</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
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
