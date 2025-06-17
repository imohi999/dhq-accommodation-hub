import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { QueueFormData } from "@/types/queue";
import { getRankOptions } from "@/constants/ranks";

interface ServiceInfoFieldsProps {
	formData: QueueFormData;
	onInputChange: (field: string, value: string | number) => void;
}

export const ServiceInfoFields = ({
	formData,
	onInputChange,
}: ServiceInfoFieldsProps) => {
	const rankOptions = getRankOptions(
		formData.arm_of_service,
		formData.category
	);

	return (
		<>
			<div className='space-y-2'>
				<Label htmlFor='arm_of_service'>Arm of Service *</Label>
				<Select
					value={formData.arm_of_service}
					onValueChange={(value) => onInputChange("arm_of_service", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select service' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Army'>Army</SelectItem>
						<SelectItem value='Navy'>Navy</SelectItem>
						<SelectItem value='Air Force'>Air Force</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category'>Category *</Label>
				<Select
					value={formData.category}
					onValueChange={(value) => onInputChange("category", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select category' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='NCOs'>NCOs</SelectItem>
						<SelectItem value='Officer'>Officer</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='rank'>Rank *</Label>
				<Select
					value={formData.rank}
					onValueChange={(value) => onInputChange("rank", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select rank' />
					</SelectTrigger>
					<SelectContent>
						{rankOptions.map((rank) => (
							<SelectItem key={rank} value={rank}>
								{rank}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</>
	);
};
