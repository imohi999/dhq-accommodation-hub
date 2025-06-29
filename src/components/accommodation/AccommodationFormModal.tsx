"use client";

import { useState, useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { Save, X, Upload, Image } from "lucide-react";
import {
	DHQLivingUnitWithHousingType,
	AccommodationType,
} from "@/types/accommodation";
import { Progress } from "@/components/ui/progress";

interface AccommodationFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	editingUnit: DHQLivingUnitWithHousingType | null;
	housingTypes: AccommodationType[];
}

export function AccommodationFormModal({
	isOpen,
	onClose,
	onSuccess,
	editingUnit,
	housingTypes,
}: AccommodationFormModalProps) {
	const [loading, setLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [applyToAllUnits, setApplyToAllUnits] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, setFormData] = useState({
		quarterName: "",
		location: "",
		category: "",
		accommodationTypeId: "",
		noOfRooms: 1,
		status: "vacant",
		typeOfOccupancy: "",
		bq: false,
		noOfRoomsInBq: 0,
		blockName: "",
		flatHouseRoomName: "",
		unitName: "",
		blockImageUrl: "",
	});

	useEffect(() => {
		if (editingUnit) {
			setFormData({
				quarterName: editingUnit.quarterName || "",
				location: editingUnit.location || "",
				category: editingUnit.category || "",
				accommodationTypeId: editingUnit.accommodationTypeId || "",
				noOfRooms: editingUnit.noOfRooms || 1,
				status: editingUnit.status || "vacant",
				typeOfOccupancy: editingUnit.typeOfOccupancy || "",
				bq: editingUnit.bq || false,
				noOfRoomsInBq: editingUnit.noOfRoomsInBq || 0,
				blockName: editingUnit.blockName || "",
				flatHouseRoomName: editingUnit.flatHouseRoomName || "",
				unitName: editingUnit.unitName || "",
				blockImageUrl: editingUnit.blockImageUrl || "",
			});
		} else {
			// Reset form for new unit
			setFormData({
				quarterName: "",
				location: "",
				category: "",
				accommodationTypeId: "",
				noOfRooms: 1,
				status: "vacant",
				typeOfOccupancy: "",
				bq: false,
				noOfRoomsInBq: 0,
				blockName: "",
				flatHouseRoomName: "",
				unitName: "",
				blockImageUrl: "",
			});
		}
	}, [editingUnit]);

	const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new window.Image();
				img.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(new Error("Could not get canvas context"));
						return;
					}

					// Calculate new dimensions
					let width = img.width;
					let height = img.height;

					if (width > maxWidth) {
						height = (maxWidth / width) * height;
						width = maxWidth;
					}

					canvas.width = width;
					canvas.height = height;

					// Draw resized image
					ctx.drawImage(img, 0, 0, width, height);

					// Convert to blob
					canvas.toBlob(
						(blob) => {
							if (blob) {
								resolve(blob);
							} else {
								reject(new Error("Could not convert canvas to blob"));
							}
						},
						"image/jpeg",
						0.85
					);
				};
				img.onerror = reject;
				img.src = e.target?.result as string;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Resize image
			const resizedBlob = await resizeImage(file, 512);

			// Convert blob to base64
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setFormData((prev) => ({ ...prev, blockImageUrl: base64String }));
				setUploadProgress(100);
				toast.success("Image uploaded successfully");
				setIsUploading(false);
			};
			reader.readAsDataURL(resizedBlob);

			// Simulate progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 100);
		} catch (error) {
			console.error("Error uploading image:", error);
			toast.error("Failed to upload image");
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (!formData.quarterName.trim()) {
			toast.error("Quarter name is required");
			return;
		}
		if (!formData.location.trim()) {
			toast.error("Location is required");
			return;
		}
		if (!formData.accommodationTypeId) {
			toast.error("Accommodation type is required");
			return;
		}

		setLoading(true);
		try {
			const url = editingUnit
				? `/api/dhq-living-units/${editingUnit.id}`
				: "/api/units/create";

			const method = editingUnit ? "PUT" : "POST";

			console.log({ formData, applyToAllUnits });

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...formData, applyToAllUnits }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save accommodation");
			}

			toast.success(
				editingUnit
					? "Accommodation updated successfully"
					: "Accommodation created successfully"
			);

			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error saving accommodation:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to save accommodation"
			);
		} finally {
			setLoading(false);
			setApplyToAllUnits(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>
						{editingUnit ? "Edit" : "Add"} Accommodation Unit
					</DialogTitle>
					<DialogDescription>
						{editingUnit
							? "Update the details of the accommodation unit"
							: "Fill in the details to create a new accommodation unit"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='quarterName'>Quarter Name *</Label>
							<Input
								id='quarterName'
								value={formData.quarterName}
								onChange={(e) =>
									setFormData({ ...formData, quarterName: e.target.value })
								}
								placeholder='e.g., Block A'
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='location'>Location *</Label>
							<Input
								id='location'
								value={formData.location}
								onChange={(e) =>
									setFormData({ ...formData, location: e.target.value })
								}
								placeholder='e.g., Main Base'
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='accommodationType'>Accommodation Type *</Label>
							<Select
								value={formData.accommodationTypeId}
								onValueChange={(value) =>
									setFormData({ ...formData, accommodationTypeId: value })
								}>
								<SelectTrigger id='accommodationType'>
									<SelectValue placeholder='Select type' />
								</SelectTrigger>
								<SelectContent>
									{housingTypes.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='category'>Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}>
								<SelectTrigger id='category'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='Officer'>Officer</SelectItem>
									<SelectItem value='NCOs'>NCOs</SelectItem>
									<SelectItem value='Other'>Other</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='noOfRooms'>Number of Rooms *</Label>
							<Input
								id='noOfRooms'
								type='number'
								min='1'
								value={formData.noOfRooms}
								onChange={(e) =>
									setFormData({
										...formData,
										noOfRooms: parseInt(e.target.value) || 1,
									})
								}
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='status'>Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									setFormData({ ...formData, status: value })
								}>
								<SelectTrigger id='status'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='vacant'>Vacant</SelectItem>
									<SelectItem value='occupied'>Occupied</SelectItem>
									<SelectItem value='maintenance'>Under Maintenance</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='blockName'>Block Name</Label>
							<Input
								id='blockName'
								value={formData.blockName}
								onChange={(e) =>
									setFormData({ ...formData, blockName: e.target.value })
								}
								placeholder='e.g., Block 1'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='unitName'>Unit Name</Label>
							<Input
								id='unitName'
								value={formData.unitName}
								onChange={(e) =>
									setFormData({ ...formData, unitName: e.target.value })
								}
								placeholder='e.g., Unit 101'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='flatHouseRoomName'>Flat/House/Room Name</Label>
							<Input
								id='flatHouseRoomName'
								value={formData.flatHouseRoomName}
								onChange={(e) =>
									setFormData({
										...formData,
										flatHouseRoomName: e.target.value,
									})
								}
								placeholder='e.g., Flat 2A'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='typeOfOccupancy'>Type of Occupancy</Label>
							<Input
								id='typeOfOccupancy'
								value={formData.typeOfOccupancy}
								onChange={(e) =>
									setFormData({ ...formData, typeOfOccupancy: e.target.value })
								}
								placeholder='e.g., Single, Family'
							/>
						</div>
					</div>

					<div className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<Switch
								id='bq'
								checked={formData.bq}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, bq: checked })
								}
							/>
							<Label htmlFor='bq'>Has Boys Quarter (BQ)</Label>
						</div>

						{formData.bq && (
							<div className='space-y-2'>
								<Label htmlFor='noOfRoomsInBq'>Number of Rooms in BQ</Label>
								<Input
									id='noOfRoomsInBq'
									type='number'
									min='0'
									value={formData.noOfRoomsInBq}
									onChange={(e) =>
										setFormData({
											...formData,
											noOfRoomsInBq: parseInt(e.target.value) || 0,
										})
									}
								/>
							</div>
						)}

						<div className='space-y-2'>
							<Label htmlFor='blockImageUrl'>Block Image</Label>
							<div className='flex gap-2'>
								<Input
									id='blockImageUrl'
									type='url'
									value={formData.blockImageUrl}
									onChange={(e) =>
										setFormData({ ...formData, blockImageUrl: e.target.value })
									}
									placeholder='https://example.com/image.jpg'
									className='flex-1'
								/>
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleImageUpload}
									className='hidden'
								/>
								<Button
									type='button'
									variant='outline'
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className='flex items-center gap-2'>
									<Upload className='h-4 w-4' />
									Upload
								</Button>
							</div>
							{isUploading && (
								<div className='space-y-2'>
									<Progress value={uploadProgress} className='h-2' />
									<p className='text-sm text-muted-foreground'>
										Uploading image... {uploadProgress}%
									</p>
								</div>
							)}
							{formData.blockImageUrl &&
								formData.blockImageUrl.startsWith("data:") && (
									<div className='mt-2'>
										<img
											src={formData.blockImageUrl}
											alt='Block preview'
											className='h-32 w-auto rounded border'
										/>
									</div>
								)}
						</div>

						<div className='flex items-center space-x-2'>
							<Switch
								id='applyToAllUnits'
								checked={applyToAllUnits}
								onCheckedChange={setApplyToAllUnits}
								disabled={!formData.blockImageUrl || !formData.quarterName}
							/>
							<Label htmlFor='applyToAllUnits' className='text-sm'>
								Apply image to all units in{" "}
								{formData.quarterName || "this quarter"}
							</Label>
						</div>
					</div>

					<div className='flex gap-4 pt-4'>
						<Button
							type='submit'
							disabled={loading}
							className='flex items-center gap-2'>
							<Save className='h-4 w-4' />
							{loading ? "Saving..." : editingUnit ? "Update" : "Create"} Unit
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={loading}
							className='flex items-center gap-2'>
							<X className='h-4 w-4' />
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
