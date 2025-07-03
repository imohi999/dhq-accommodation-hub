import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Image } from "lucide-react";
import { toast } from "react-toastify";
import { QueueFormData } from "@/types/queue";

interface PersonalInfoFieldsProps {
	formData: QueueFormData;
	onInputChange: (field: string, value: string | number) => void;
}

export const PersonalInfoFields = ({
	formData,
	onInputChange,
}: PersonalInfoFieldsProps) => {
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);


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
				onInputChange("image_url", base64String);
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

	return (
		<>
			<div className='space-y-2'>
				<Label htmlFor='full_name'>Full Name *</Label>
				<Input
					id='full_name'
					value={formData.full_name}
					onChange={(e) => onInputChange("full_name", e.target.value)}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='svc_no'>Service Number *</Label>
				<Input
					id='svc_no'
					value={formData.svc_no}
					onChange={(e) => onInputChange("svc_no", e.target.value)}
					required
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='gender'>Gender *</Label>
				<Select
					key={`gender-${formData.gender}`}
					value={formData.gender || ""}
					onValueChange={(value) => onInputChange("gender", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select gender' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Male'>Male</SelectItem>
						<SelectItem value='Female'>Female</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='marital_status'>Marital Status *</Label>
				<Select
					key={`marital-status-${formData.marital_status}`}
					value={formData.marital_status || ""}
					onValueChange={(value) => onInputChange("marital_status", value)}>
					<SelectTrigger>
						<SelectValue placeholder='Select status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='Single'>Single</SelectItem>
						<SelectItem value='Married'>Married</SelectItem>
						<SelectItem value='Divorced'>Divorced</SelectItem>
						<SelectItem value='Widowed'>Widowed</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='phone'>Phone (Optional)</Label>
				<Input
					id='phone'
					value={formData.phone}
					onChange={(e) => onInputChange("phone", e.target.value)}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='image_url'>Personnel Photo</Label>
				<div className='flex gap-2'>
					<Input
						id='image_url'
						type='url'
						value={formData.image_url || ""}
						onChange={(e) => onInputChange("image_url", e.target.value)}
						placeholder='https://example.com/photo.jpg'
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
				{formData.image_url && formData.image_url.startsWith("data:") && (
					<div className='mt-2'>
						<img
							src={formData.image_url}
							alt='Personnel photo'
							className='h-32 w-32 rounded-full object-cover border-2 border-gray-200'
						/>
					</div>
				)}
			</div>
		</>
	);
};
