"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Upload, AlertTriangle, CheckCircle, X, Download } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

interface ExcelUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	onUploadComplete: () => void;
}

interface QueueData {
	sequence: number;
	fullName: string;
	svcNo: string;
	gender: string;
	armOfService: string;
	category: string;
	rank: string;
	maritalStatus: string;
	currentUnit?: string;
	appointment?: string;
	phone?: string;
	// Individual dependent fields (up to 6)
	dependent1Name?: string;
	dependent1Gender?: string;
	dependent1Age?: number;
	dependent2Name?: string;
	dependent2Gender?: string;
	dependent2Age?: number;
	dependent3Name?: string;
	dependent3Gender?: string;
	dependent3Age?: number;
	dependent4Name?: string;
	dependent4Gender?: string;
	dependent4Age?: number;
	dependent5Name?: string;
	dependent5Gender?: string;
	dependent5Age?: number;
	dependent6Name?: string;
	dependent6Gender?: string;
	dependent6Age?: number;
	// Unit matching fields only
	quarterName: string;
	location: string;
	blockName: string;
	flatHouseRoomName: string;
	unitName: string;
}

interface ValidationError {
	row: number;
	field: string;
	message: string;
}

export function ExcelUploadModal({
	isOpen,
	onClose,
	onUploadComplete,
}: ExcelUploadModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [data, setData] = useState<QueueData[]>([]);
	const [errors, setErrors] = useState<ValidationError[]>([]);
	const [isValidating, setIsValidating] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const requiredQueueFields = [
		"sequence",
		"fullName",
		"svcNo",
		"gender",
		"armOfService",
		"category",
		"rank",
		"maritalStatus",
	];

	const requiredUnitFields = [
		"quarterName",
		"location",
		"blockName",
		"flatHouseRoomName",
		"unitName",
	];

	const validGenders = ["Male", "Female"];
	const validCategories = ["Officer", "NCO"];
	const validMaritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type !==
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
				selectedFile.type !== "application/vnd.ms-excel"
			) {
				toast.error("Please upload a valid Excel file (.xlsx or .xls)");
				return;
			}
			setFile(selectedFile);
			setErrors([]);
			setData([]);
			setShowConfirmation(false);
		}
	};

	const validateData = (rows: any[]): ValidationError[] => {
		const validationErrors: ValidationError[] = [];

		rows.forEach((row, index) => {
			const rowNum = index + 2; // Excel rows start at 1, plus header row

			// Validate required queue fields
			requiredQueueFields.forEach((field) => {
				if (!row[field] || row[field] === "") {
					validationErrors.push({
						row: rowNum,
						field,
						message: `${field} is required`,
					});
				}
			});

			// Validate required unit fields
			requiredUnitFields.forEach((field) => {
				if (!row[field] || row[field] === "") {
					validationErrors.push({
						row: rowNum,
						field,
						message: `${field} is required`,
					});
				}
			});

			// Validate specific field values
			if (row.gender && !validGenders.includes(row.gender) && row.gender.toLowerCase() !== "n/a") {
				validationErrors.push({
					row: rowNum,
					field: "gender",
					message: `Gender must be either Male or Female`,
				});
			}

			if (row.category && !validCategories.includes(row.category)) {
				validationErrors.push({
					row: rowNum,
					field: "category",
					message: `Category must be either Officer or NCO`,
				});
			}

			if (
				row.maritalStatus &&
				!validMaritalStatuses.includes(row.maritalStatus)
			) {
				validationErrors.push({
					row: rowNum,
					field: "maritalStatus",
					message: `Invalid marital status`,
				});
			}

			// Validate numeric fields
			if (row.sequence && (isNaN(row.sequence) || row.sequence < 1)) {
				validationErrors.push({
					row: rowNum,
					field: "sequence",
					message: `Sequence must be a positive number`,
				});
			}

			// Validate individual dependent fields
			let actualDependentCount = 0;
			for (let i = 1; i <= 6; i++) {
				const nameField = `dependent${i}Name` as keyof typeof row;
				const genderField = `dependent${i}Gender` as keyof typeof row;
				const ageField = `dependent${i}Age` as keyof typeof row;

				if (row[nameField]) {
					actualDependentCount++;

					// If name is provided, check gender (but allow N/A)
					if (row[genderField] && !validGenders.includes(String(row[genderField])) && String(row[genderField]).toLowerCase() !== "n/a") {
						validationErrors.push({
							row: rowNum,
							field: String(genderField),
							message: `Invalid gender for dependent ${i}`,
						});
					}

					// Age validation - allow empty/0
					if (row[ageField] !== undefined && row[ageField] !== "" && row[ageField] !== 0 && (
						isNaN(Number(row[ageField])) ||
						Number(row[ageField]) < 0 ||
						Number(row[ageField]) > 120
					)) {
						validationErrors.push({
							row: rowNum,
							field: String(ageField),
							message: `Invalid age for dependent ${i}`,
						});
					}
				}
			}
		});

		// Check for duplicate service numbers
		const svcNumbers = new Set<string>();
		rows.forEach((row, index) => {
			if (row.svcNo) {
				if (svcNumbers.has(row.svcNo)) {
					validationErrors.push({
						row: index + 2,
						field: "svcNo",
						message: `Duplicate service number found`,
					});
				}
				svcNumbers.add(row.svcNo);
			}
		});

		return validationErrors;
	};

	const processFile = async () => {
		if (!file) return;

		setIsValidating(true);
		try {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				const jsonData = XLSX.utils.sheet_to_json(worksheet);

				// Transform and clean data
				const transformedData = jsonData.map((row: any) => {
					return {
						sequence: parseInt(row.sequence) || 0,
						fullName: String(row.fullName || "")?.trim() || "",
						svcNo: String(row.svcNo || "")?.trim() || "",
						gender: String(row.gender || "")?.trim() || "N/A",
						armOfService: String(row.armOfService || "")?.trim() || "",
						category: String(row.category || "")?.trim() || "",
						rank: String(row.rank || "")?.trim() || "",
						maritalStatus: String(row.maritalStatus || "")?.trim() || "",
						currentUnit: String(row.currentUnit || "")?.trim() || "",
						appointment: String(row.appointment || "")?.trim() || "",
						phone: String(row.phone || "")?.trim() || "",
						// Individual dependent fields
						dependent1Name: String(row.dependent1Name || "")?.trim() || "",
						dependent1Gender: String(row.dependent1Gender || "")?.trim() || "N/A",
						dependent1Age: parseInt(row.dependent1Age) || 0,
						dependent2Name: String(row.dependent2Name || "")?.trim() || "",
						dependent2Gender: String(row.dependent2Gender || "")?.trim() || "N/A",
						dependent2Age: parseInt(row.dependent2Age) || 0,
						dependent3Name: String(row.dependent3Name || "")?.trim() || "",
						dependent3Gender: String(row.dependent3Gender || "")?.trim() || "N/A",
						dependent3Age: parseInt(row.dependent3Age) || 0,
						dependent4Name: String(row.dependent4Name || "")?.trim() || "",
						dependent4Gender: String(row.dependent4Gender || "")?.trim() || "N/A",
						dependent4Age: parseInt(row.dependent4Age) || 0,
						dependent5Name: String(row.dependent5Name || "")?.trim() || "",
						dependent5Gender: String(row.dependent5Gender || "")?.trim() || "N/A",
						dependent5Age: parseInt(row.dependent5Age) || 0,
						dependent6Name: String(row.dependent6Name || "")?.trim() || "",
						dependent6Gender: String(row.dependent6Gender || "")?.trim() || "N/A",
						dependent6Age: parseInt(row.dependent6Age) || 0,
						// Unit matching fields
						quarterName: String(row.quarterName || "")?.trim() || "",
						location: String(row.location || "")?.trim() || "",
						blockName: String(row.blockName || "")?.trim() || "",
						flatHouseRoomName: String(row.flatHouseRoomName || "")?.trim() || "",
						unitName: String(row.unitName || "")?.trim() || "",
					};
				});

				// Validate data
				const validationErrors = validateData(transformedData);
				setErrors(validationErrors);

				if (validationErrors.length === 0) {
					setData(transformedData);
					setShowConfirmation(true);
				} else {
					toast.error(`Found ${validationErrors.length} validation errors`);
				}
			};

			reader.readAsArrayBuffer(file);
		} catch (error) {
			console.error("Error processing file:", error);
			toast.error("Failed to process the Excel file");
		} finally {
			setIsValidating(false);
		}
	};

	const handleUpload = async () => {
		if (data.length === 0) return;

		setIsUploading(true);
		try {
			const response = await fetch("/api/accommodation/import", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ data }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to import data");
			}

			const result = await response.json();
			toast.success(`Successfully imported ${result.imported} records`);
			onUploadComplete();
			handleClose();
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to upload data"
			);
		} finally {
			setIsUploading(false);
		}
	};

	const handleClose = () => {
		setFile(null);
		setData([]);
		setErrors([]);
		setShowConfirmation(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Import Personnel & Accommodation Data</DialogTitle>
					<DialogDescription>
						Upload an Excel file containing personnel data and their
						accommodation unit assignments
					</DialogDescription>
				</DialogHeader>

				<div className='mb-4'>
					<a
						href='/samples/dhq-accommodation-import-sample.xlsx'
						download
						className='inline-flex items-center text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 transition-colors'>
						<Download className='h-4 w-4 mr-1' />
						Download Sample Excel Template
					</a>
				</div>

				{!showConfirmation ? (
					<div className='space-y-4'>
						<div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
							<input
								type='file'
								accept='.xlsx,.xls'
								onChange={handleFileChange}
								className='hidden'
								id='excel-upload'
							/>
							<label
								htmlFor='excel-upload'
								className='flex flex-col items-center cursor-pointer'>
								<Upload className='h-12 w-12 text-gray-400 mb-3' />
								<span className='text-sm font-medium'>
									Click to upload queue and allocation data
								</span>
								<span className='text-xs text-gray-500 mt-1'>
									.xlsx or .xls files only
								</span>
							</label>
						</div>

						{file && (
							<div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
								<div className='flex items-center justify-between'>
									<span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
										{file.name}
									</span>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => setFile(null)}
										className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'>
										<X className='h-4 w-4' />
									</Button>
								</div>
							</div>
						)}

						{errors.length > 0 && (
							<div className='bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto'>
								<h4 className='font-medium text-red-800 mb-2 flex items-center'>
									<AlertTriangle className='h-4 w-4 mr-2' />
									Validation Errors
								</h4>
								<ul className='space-y-1 text-sm text-red-700'>
									{errors.slice(0, 10).map((error, index) => (
										<li key={index}>
											Row {error.row}: {error.field} - {error.message}
										</li>
									))}
									{errors.length > 10 && (
										<li className='font-medium'>
											... and {errors.length - 10} more errors
										</li>
									)}
								</ul>
							</div>
						)}

						<DialogFooter>
							<Button variant='outline' onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={processFile} disabled={!file || isValidating}>
								{isValidating ? (
									<>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
										Validating...
									</>
								) : (
									"Validate & Preview"
								)}
							</Button>
						</DialogFooter>
					</div>
				) : (
					<div className='space-y-4'>
						<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
							<div className='flex items-center'>
								<CheckCircle className='h-5 w-5 text-green-600 mr-2' />
								<span className='font-medium text-green-800'>
									Validation Successful
								</span>
							</div>
							<p className='text-sm text-green-700 mt-1'>
								{data.length} records ready to import
							</p>
						</div>

						<div className='border rounded-lg p-4'>
							<h4 className='font-medium mb-3'>Data Summary</h4>
							<div className='grid grid-cols-2 gap-4 text-sm'>
								<div>
									<p className='text-gray-600'>Total Records:</p>
									<p className='font-medium'>{data.length}</p>
								</div>
								<div>
									<p className='text-gray-600'>Officers:</p>
									<p className='font-medium'>
										{data.filter((d) => d.category === "Officer").length}
									</p>
								</div>
								<div>
									<p className='text-gray-600'>NCO:</p>
									<p className='font-medium'>
										{data.filter((d) => d.category === "NCO").length}
									</p>
								</div>
								<div>
									<p className='text-gray-600'>Unique Units:</p>
									<p className='font-medium'>
										{new Set(data.map((d) => d.unitName)).size}
									</p>
								</div>
							</div>
						</div>

						<div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
							<h4 className='font-medium text-amber-800 mb-2 flex items-center'>
								<AlertTriangle className='h-4 w-4 mr-2' />
								Important Notice
							</h4>
							<ul className='text-sm text-amber-700 space-y-1'>
								<li>
									• All listed units will be marked as &quot;Occupied&quot;
								</li>
								<li>• Queue entries will be created for all personnel</li>
								<li>• Existing service numbers will be skipped</li>
								<li>• This action cannot be undone</li>
							</ul>
						</div>

						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setShowConfirmation(false)}>
								Back
							</Button>
							<Button
								variant='default'
								className='bg-green-600 hover:bg-green-700 text-white'
								onClick={handleUpload}
								disabled={isUploading}>
								{isUploading ? (
									<>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
										Importing...
									</>
								) : (
									"Confirm & Import"
								)}
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
