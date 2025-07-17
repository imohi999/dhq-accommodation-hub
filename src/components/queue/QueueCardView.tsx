import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueueItem } from "@/types/queue";
import { Phone, Users, ChevronDown, ChevronUp, Trash2, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
	onDelete?: (id: string) => void;
	canDelete?: boolean;
	selectedIds?: Set<string>;
	onSelectItem?: (id: string, checked: boolean) => void;
	showSelection?: boolean;
	deletingIds?: Set<string>;
}

export const QueueCardView = ({
	queueItems,
	onEdit,
	onAllocate,
	canEdit = true,
	canAllocate = true,
	onDelete,
	canDelete = false,
	selectedIds = new Set(),
	onSelectItem,
	showSelection = false,
	deletingIds = new Set(),
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
						<CardContent className='p-4'>
							{/* Header Section - Compact */}
							<div className='flex items-center justify-between mb-3'>
								<div className='flex items-center gap-3'>
									{showSelection && onSelectItem && (
										<Checkbox
											checked={selectedIds.has(item.id)}
											onCheckedChange={(checked) => onSelectItem(item.id, checked as boolean)}
											className="mr-2"
										/>
									)}
									{item.image_url ? (
										<div className='relative w-32 h-32'>
											<Image
												src={item.image_url}
												alt={item.full_name}
												fill
												sizes="128px"
												className='object-cover border-2 border-gray-200'
											/>
										</div>
									) : (
										<div className='flex items-center justify-center w-32 h-32 bg-blue-100'>
											<User className='h-16 w-16 text-blue-700' />
										</div>
									)}
									<div>
										<h3 className='text-base font-semibold leading-tight'>
											{item.rank} {item.full_name}
										</h3>
										<p className='text-xs text-muted-foreground'>
											{item.svc_no} • {item.arm_of_service}
										</p>
									</div>
								</div>
								{/* Action Buttons - Compact */}
								<div className='flex items-center gap-2'>
									{canEdit && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => onEdit(item)}
											className='text-xs px-3 py-1 h-auto'>
											Edit
										</Button>
									)}
									{canAllocate && (
										<Button
											variant='default'
											size='sm'
											onClick={() => onAllocate(item)}
											className='text-xs px-3 py-1 h-auto'>
											Allocate
										</Button>
									)}
									{canDelete && onDelete && (
										<Button
											variant='destructive'
											size='sm'
											onClick={() => onDelete(item.id)}
											disabled={deletingIds.has(item.id)}
											className='text-xs px-3 py-1 h-auto'>
											{deletingIds.has(item.id) ? (
												<div className="flex items-center gap-1">
													<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
													Deleting
												</div>
											) : (
												<>
													<Trash2 className='h-3 w-3 mr-1' />
													Delete
												</>
											)}
										</Button>
									)}
								</div>
							</div>

							{/* Content Section - Optimized Grid */}
							<div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3'>
								<div className='space-y-1'>
									<p className='font-medium text-muted-foreground'>Category</p>
									<p className='font-medium'>{item.category}</p>
								</div>
								<div className='space-y-1'>
									<p className='font-medium text-muted-foreground'>Status</p>
									<p className='font-medium'>{item.marital_status}</p>
								</div>
								<div className='space-y-1'>
									<p className='font-medium text-muted-foreground'>
										Dependents
									</p>
									<div className='flex items-center gap-1'>
										<Users className='h-3 w-3' />
										<span className='font-medium'>
											{item.no_of_adult_dependents +
												item.no_of_child_dependents}
										</span>
									</div>
								</div>
								<div className='space-y-1'>
									<p className='font-medium text-muted-foreground'>
										Entry Date
									</p>
									<p className='font-medium'>
										{new Date(item.entry_date_time).toLocaleDateString()}
									</p>
								</div>
							</div>

							{/* Additional Info - Collapsed */}
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2 text-xs text-muted-foreground'>
									<span>Unit: {item.current_unit || "Unassigned"}</span>
									{item.phone && (
										<>
											<span>•</span>
											<Phone className='h-3 w-3' />
											<span>{item.phone}</span>
										</>
									)}
									{item.dependents && item.dependents.length > 0 && (
										<CollapsibleTrigger asChild>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => toggleCard(item.id)}
												className='text-xs p-0 h-auto ml-2'>
												{expandedCards.has(item.id) ? (
													<>
														<ChevronUp className='h-3 w-3 mr-1' />
														Hide Details
													</>
												) : (
													<>
														<ChevronDown className='h-3 w-3 mr-1' />
														View Details
													</>
												)}
											</Button>
										</CollapsibleTrigger>
									)}
								</div>
							</div>

							{/* Expanded Details */}
							<CollapsibleContent>
								<div className='mt-3 pt-3 border-t space-y-3'>
									{/* Personnel Photo and Info Grid */}
									<div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
										{/* Photo Section */}
										{item.image_url && (
											<div className='md:col-span-1'>
												<p className='text-xs font-medium text-muted-foreground mb-2'>
													Personnel Photo
												</p>
												<div className='relative w-full max-w-[150px] h-[150px]'>
													<Image
														src={item.image_url}
														alt={item.full_name}
														fill
														sizes="150px"
														className='rounded-lg object-cover border-2 border-gray-200'
													/>
												</div>
											</div>
										)}
										{/* Additional Personnel Info */}
										<div className={`${item.image_url ? 'md:col-span-2' : 'md:col-span-3'} grid grid-cols-1 md:grid-cols-2 gap-3 text-xs`}>
											<div>
												<p className='font-medium text-muted-foreground mb-1'>
													Service Details
												</p>
												<p>Gender: {item.gender}</p>
												<p>Appointment: {item.appointment || "Not specified"}</p>
												{item.date_tos && (
													<p>
														TOS: {new Date(item.date_tos).toLocaleDateString()}
													</p>
												)}
											</div>
											<div>
												<p className='font-medium text-muted-foreground mb-1'>
													Family Details
												</p>
												<p>Adults: {item.no_of_adult_dependents}</p>
												<p>Children: {item.no_of_child_dependents}</p>
												{item.date_sos && (
													<p>
														SOS: {new Date(item.date_sos).toLocaleDateString()}
													</p>
												)}
											</div>
										</div>
									</div>

									{/* Dependents List */}
									{item.dependents && item.dependents.length > 0 && (
										<div>
											<h4 className='text-xs font-semibold text-muted-foreground mb-2'>
												Dependents ({item.dependents.length})
											</h4>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
												{item.dependents.map((dependent, idx) => (
													<div
														key={idx}
														className='flex items-center justify-between p-2 bg-muted rounded text-xs'>
														<span className='font-medium'>
															{dependent.name}
														</span>
														<div className='flex items-center gap-2'>
															<Badge
																variant='outline'
																className='text-xs px-1 py-0'>
																{dependent.gender[0]}
															</Badge>
															<span className='text-muted-foreground'>
																{dependent.age}y
															</span>
														</div>
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
