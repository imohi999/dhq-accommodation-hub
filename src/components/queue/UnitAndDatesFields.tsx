import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { QueueFormData, Unit } from "@/types/queue";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface UnitAndDatesFieldsProps {
	formData: QueueFormData;
	units: Unit[];
	onInputChange: (field: string, value: string | number) => void;
	onUnitsRefresh?: () => void;
}

export const UnitAndDatesFields = ({
	formData,
	units,
	onInputChange,
	onUnitsRefresh,
}: UnitAndDatesFieldsProps) => {
	const [open, setOpen] = useState(false);
	const [createUnitDialogOpen, setCreateUnitDialogOpen] = useState(false);
	const [newUnitName, setNewUnitName] = useState("");
	const [newUnitDescription, setNewUnitDescription] = useState("");
	const [isCreatingUnit, setIsCreatingUnit] = useState(false);

	const handleCreateUnit = async () => {
		if (!newUnitName.trim()) {
			toast.error("Unit name is required");
			return;
		}

		setIsCreatingUnit(true);
		try {
			const response = await fetch("/api/units/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: newUnitName.trim(),
					description: newUnitDescription.trim() || null,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create unit");
			}

			const newUnit = await response.json();
			toast.success(`Unit "${newUnit.name}" created successfully`);

			// Reset form
			setNewUnitName("");
			setNewUnitDescription("");
			setCreateUnitDialogOpen(false);

			// Select the newly created unit
			onInputChange("current_unit", newUnit.name);

			// Refresh units list
			if (onUnitsRefresh) {
				onUnitsRefresh();
			}
		} catch (error) {
			console.error("Error creating unit:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create unit"
			);
		} finally {
			setIsCreatingUnit(false);
		}
	};

	return (
		<>
			<div className='space-y-2'>
				<Label htmlFor='current_unit'>
					Current Unit <span>*</span>
				</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant='outline'
							role='combobox'
							aria-expanded={open}
							className='w-full justify-between'>
							{formData.current_unit
								? units.find((unit) => unit.name === formData.current_unit)
										?.name
								: "Select unit..."}
							<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
						</Button>
					</PopoverTrigger>
					<PopoverContent className='w-full p-0'>
						<Command>
							<CommandInput placeholder='Search units...' />
							<CommandEmpty>No unit found.</CommandEmpty>
							<CommandGroup>
								{units.map((unit) => (
									<CommandItem
										key={unit.id}
										value={unit.name}
										onSelect={(currentValue) => {
											onInputChange("current_unit", currentValue);
											setOpen(false);
										}}>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												formData.current_unit === unit.name
													? "opacity-100"
													: "opacity-0"
											)}
										/>
										{unit.name}
									</CommandItem>
								))}
								{/* Always show Create New Unit button at the end */}
								<div className='px-2 py-1 border-t'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => {
											setCreateUnitDialogOpen(true);
											setOpen(false);
										}}
										className='w-full justify-start text-sm h-8'>
										<Plus className='h-4 w-4 mr-2' />
										Create New Unit
									</Button>
								</div>
							</CommandGroup>
						</Command>
					</PopoverContent>
				</Popover>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='appointment'>Appointment (Optional)</Label>
				<Input
					id='appointment'
					value={formData.appointment}
					onChange={(e) => onInputChange("appointment", e.target.value)}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='date_tos'>
					Date TOS <span>*</span>
				</Label>
				<Input
					id='date_tos'
					type='date'
					value={formData.date_tos}
					onChange={(e) => onInputChange("date_tos", e.target.value)}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='date_sos'>Date SOS</Label>
				<Input
					id='date_sos'
					type='date'
					value={formData.date_sos}
					onChange={(e) => onInputChange("date_sos", e.target.value)}
				/>
			</div>

			{/* Create Unit Dialog */}
			<Dialog
				open={createUnitDialogOpen}
				onOpenChange={setCreateUnitDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Unit</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='unit-name'>Unit Name</Label>
							<Input
								id='unit-name'
								value={newUnitName}
								onChange={(e) => setNewUnitName(e.target.value)}
								placeholder='Enter unit name...'
								disabled={isCreatingUnit}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='unit-description'>Description (Optional)</Label>
							<Textarea
								id='unit-description'
								value={newUnitDescription}
								onChange={(e) => setNewUnitDescription(e.target.value)}
								placeholder='Enter unit description...'
								disabled={isCreatingUnit}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => {
								setCreateUnitDialogOpen(false);
								setNewUnitName("");
								setNewUnitDescription("");
							}}
							disabled={isCreatingUnit}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateUnit}
							disabled={isCreatingUnit || !newUnitName.trim()}>
							{isCreatingUnit ? "Creating..." : "Create Unit"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
