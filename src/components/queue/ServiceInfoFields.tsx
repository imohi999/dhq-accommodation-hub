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

	// If the current rank is not in the valid options, add it temporarily
	// This handles cases where data has invalid rank assignments
	const displayRankOptions =
		formData.rank && !rankOptions.includes(formData.rank)
			? [...rankOptions, formData.rank]
			: rankOptions;

	return (
		<>
			<div className='space-y-2'>
				<Label htmlFor='arm_of_service'>Arm of Service *</Label>
				<Select
					key={`arm-of-service-${formData.arm_of_service}`}
					value={formData.arm_of_service || ""}
					onValueChange={(value) => onInputChange("arm_of_service", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select service' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Nigerian Army'>Nigerian Army</SelectItem>
						<SelectItem value='Nigerian Navy'>Nigerian Navy</SelectItem>
						<SelectItem value='Nigerian Air Force'>
							Nigerian Air Force
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category'>Category *</Label>
				<Select
					key={`category-${formData.category}`}
					value={formData.category || ""}
					onValueChange={(value) => onInputChange("category", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select category' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='NCO'>NCO</SelectItem>
						<SelectItem value='Officer'>Officer</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='rank'>Rank *</Label>
				<Select
					key={`rank-${formData.rank}`}
					value={formData.rank || ""}
					onValueChange={(value) => onInputChange("rank", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select rank' />
					</SelectTrigger>
					<SelectContent>
						{displayRankOptions.map((rank) => (
							<SelectItem key={rank} value={rank}>
								{rank}
								{formData.rank === rank && !rankOptions.includes(rank) && (
									<span className='text-xs text-orange-500 ml-2'>
										(Invalid)
									</span>
								)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</>
	);
};
