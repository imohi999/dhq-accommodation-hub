import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueueItem } from "@/types/queue";
import {
	Calendar,
	Phone,
	Users,
	MapPin,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface QueueCardViewProps {
	queueItems: QueueItem[];
	onEdit: (item: QueueItem) => void;
	onAllocate: (item: QueueItem) => void;
	canEdit?: boolean;
	canAllocate?: boolean;
}

export const QueueCardView = ({
	queueItems,
	onEdit,
	onAllocate,
	canEdit = true,
	canAllocate = true,
}: QueueCardViewProps) => {
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

	const toggleCard = (id: string) => {
		setExpandedCards((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	return (
		<div className='space-y-4'>
			{queueItems.map((item, index) => (
				<Collapsible key={item.id} open={expandedCards.has(item.id)}>
					<Card className='hover:shadow-md transition-shadow'>
						<CardContent className='p-6'>
							<div className='flex items-start justify-between'>
								<div className='space-y-3 flex-1'>
									{/* Header Section */}
									<div className='flex items-start justify-between'>
										<div>
											<h3 className='text-lg font-semibold'>
												{item.rank} {item.full_name}
											</h3>
											<p className='text-sm text-muted-foreground'>
												Svc No: {item.svc_no}
											</p>
											<p className='text-sm text-muted-foreground'>
												Queue Position: #{index + 1}
											</p>
										</div>
										<div className='flex items-center gap-2'>
											<Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
												In Queue
											</Badge>
										</div>
									</div>

									{/* Content Section */}
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
										<div>
											<p className='font-medium'>Personnel Details:</p>
											<p>{item.arm_of_service} • {item.category}</p>
											<p>{item.gender} • {item.marital_status}</p>
											<p>Unit: {item.current_unit || "No Unit"}</p>
											<p>Appointment: {item.appointment || "No Appointment"}</p>
											{item.phone && <p>Phone: {item.phone}</p>}
										</div>
										<div>
											<p className='font-medium'>Queue Information:</p>
											<div className='flex items-center gap-2'>
												<Users className='h-4 w-4' />
												<span>Adults: {item.no_of_adult_dependents}, Children: {item.no_of_child_dependents}</span>
											</div>
											<p>Entry Date: {new Date(item.entry_date_time).toLocaleDateString()}</p>
											{item.date_tos && <p>TOS: {new Date(item.date_tos).toLocaleDateString()}</p>}
											{item.date_sos && <p>SOS: {new Date(item.date_sos).toLocaleDateString()}</p>}
											{item.dependents && item.dependents.length > 0 && (
												<CollapsibleTrigger asChild>
													<Button variant='ghost' size='sm' onClick={() => toggleCard(item.id)} className='text-xs p-0 h-auto'>
														{expandedCards.has(item.id) ? (
															<><ChevronUp className='h-3 w-3 mr-1' />Hide Dependents</>
														) : (
															<><ChevronDown className='h-3 w-3 mr-1' />View Dependents</>
														)}
													</Button>
												</CollapsibleTrigger>
											)}
										</div>
									</div>
								</div>

								{/* Action Section */}
								<div className='flex items-center gap-2'>
									{canEdit && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => onEdit(item)}
											className='flex items-center gap-2'>
											Edit
										</Button>
									)}
									{canAllocate && (
										<Button
											variant='default'
											size='sm'
											onClick={() => onAllocate(item)}
											className='flex items-center gap-2'>
											Allocate
										</Button>
									)}
								</div>
							</div>

							{/* Dependents List */}
							<CollapsibleContent>
								{item.dependents && item.dependents.length > 0 && (
									<div className='mt-4 pt-4 border-t'>
										<h4 className='text-sm font-semibold mb-2'>
											Dependents Details
										</h4>
										<div className='space-y-2'>
											{item.dependents.map((dependent, idx) => (
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
							</CollapsibleContent>
						</CardContent>
					</Card>
				</Collapsible>
			))}
			{queueItems.length === 0 && (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-muted-foreground'>
							No personnel found matching the current filters
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
