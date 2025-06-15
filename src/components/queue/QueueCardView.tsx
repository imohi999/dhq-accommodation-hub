import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueueItem } from "@/types/queue";
import { Calendar, Phone, Users, MapPin } from "lucide-react";

interface QueueCardViewProps {
	queueItems: QueueItem[];
	onEdit: (item: QueueItem) => void;
	onAllocate: (item: QueueItem) => void;
}

export const QueueCardView = ({
	queueItems,
	onEdit,
	onAllocate,
}: QueueCardViewProps) => {
	return (
		<div className='space-y-4'>
			{queueItems.map((item, index) => (
				<Card key={item.id} className='hover:shadow-md transition-shadow'>
					<CardContent className='p-6'>
						<div className='flex items-start justify-between'>
							<div className='flex-1'>
								<div className='flex items-center gap-4 mb-4'>
									<div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full'>
										<span className='text-lg font-bold text-gray-600'>
											#{index + 1}
										</span>
									</div>
									<div>
										<h3 className='text-lg font-semibold text-gray-900'>
											{item.full_name}
										</h3>
										<p className='text-sm text-gray-600'>
											Svc No: {item.svc_no} • {item.current_unit || "No Unit"} •{" "}
											{item.appointment || "No Appointment"}
										</p>
									</div>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
									<div className='space-y-2'>
										<div className='flex items-center gap-2'>
											<Badge variant='outline' className='text-xs'>
												{item.arm_of_service} • {item.category}
											</Badge>
											<Badge variant='secondary' className='text-xs'>
												{item.rank}
											</Badge>
										</div>
										<p className='text-sm text-gray-600'>
											{item.gender} • {item.marital_status}
										</p>
									</div>

									<div className='space-y-2'>
										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<Users className='h-4 w-4' />
											<span>
												A:{item.no_of_adult_dependents} C:
												{item.no_of_child_dependents}
											</span>
										</div>
										{item.date_tos && (
											<div className='flex items-center gap-2 text-sm text-gray-600'>
												<Calendar className='h-4 w-4' />
												<span>
													TOS: {new Date(item.date_tos).toLocaleDateString()}
												</span>
											</div>
										)}
										{item.date_sos && (
											<div className='flex items-center gap-2 text-sm text-gray-600'>
												<Calendar className='h-4 w-4' />
												<span>
													SOS: {new Date(item.date_sos).toLocaleDateString()}
												</span>
											</div>
										)}
									</div>

									<div className='space-y-2'>
										{item.phone && (
											<div className='flex items-center gap-2 text-sm text-gray-600'>
												<Phone className='h-4 w-4' />
												<span>{item.phone}</span>
											</div>
										)}
										<div className='flex items-center gap-2 text-sm text-gray-600'>
											<Calendar className='h-4 w-4' />
											<span>
												Entry Date:{" "}
												{new Date(item.entry_date_time).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className='flex flex-col gap-2 ml-4'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => onEdit(item)}
									className='whitespace-nowrap'>
									Edit
								</Button>
								<Button
									variant='destructive'
									size='sm'
									onClick={() => onAllocate(item)}
									className='whitespace-nowrap'>
									Allocate
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
			{queueItems.length === 0 && (
				<Card>
					<CardContent className='p-12 text-center'>
						<p className='text-gray-500'>
							No personnel found matching the current filters
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
