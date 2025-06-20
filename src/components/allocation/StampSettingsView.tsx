"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { StampSettings } from "@/types/allocation";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Interface for API response data (camelCase format from API)
interface StampSettingsAPIResponse {
	id: string;
	stampName: string;
	stampRank: string;
	stampAppointment: string;
	stampNote?: string | null;
	copyTo?: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export const StampSettingsView = () => {
	const [settings, setSettings] = useState<StampSettings>({
		id: "",
		stamp_name: "",
		stamp_rank: "",
		stamp_appointment: "",
		stamp_note: "",
		copy_to: "",
		is_active: true,
		created_at: "",
		updated_at: "",
	});
	const [saving, setSaving] = useState(false);

	// Use SWR to fetch stamp settings - API returns camelCase
	const {
		data: stampSettingsData,
		error,
		isLoading,
	} = useSWR<StampSettingsAPIResponse[]>("/api/stamp-settings", fetcher);

	useEffect(() => {
		if (error) {
			console.error("Error fetching stamp settings:", error);
			toast.error("Failed to fetch stamp settings");
		}
	}, [error]);

	useEffect(() => {
		if (stampSettingsData) {
			// Find the active stamp setting - API returns camelCase
			const activeSettings = stampSettingsData.find((s) => s.isActive);
			if (activeSettings) {
				// Transform from camelCase to snake_case for component state
				setSettings({
					id: activeSettings.id,
					stamp_name: activeSettings.stampName,
					stamp_rank: activeSettings.stampRank,
					stamp_appointment: activeSettings.stampAppointment,
					stamp_note: activeSettings.stampNote || "",
					copy_to: activeSettings.copyTo || "",
					is_active: activeSettings.isActive,
					created_at: activeSettings.createdAt,
					updated_at: activeSettings.updatedAt,
				});
			}
		}
	}, [stampSettingsData]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const saveData = {
				stampName: settings.stamp_name,
				stampRank: settings.stamp_rank,
				stampAppointment: settings.stamp_appointment,
				stampNote: settings.stamp_note,
				copyTo: settings.copy_to,
				isActive: true,
			};

			let response;

			if (settings.id) {
				// Update existing
				response = await fetch(`/api/stamp-settings/${settings.id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(saveData),
				});
			} else {
				// Create new
				response = await fetch("/api/stamp-settings", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(saveData),
				});
			}

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save stamp settings");
			}

			const savedData = await response.json();

			// Update local state with the response data
			setSettings({
				...savedData,
				stamp_name: savedData.stampName,
				stamp_rank: savedData.stampRank,
				stamp_appointment: savedData.stampAppointment,
				stamp_note: savedData.stampNote,
				copy_to: savedData.copyTo,
				is_active: savedData.isActive,
				created_at: savedData.createdAt,
				updated_at: savedData.updatedAt,
			});

			toast.success("Stamp settings saved successfully");

			// Revalidate the data
			await mutate("/api/stamp-settings");
		} catch (error) {
			console.error("Error saving stamp settings:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to save stamp settings"
			);
		} finally {
			setSaving(false);
		}
	};

	if (isLoading) {
		return <LoadingState isLoading={true}>{null}</LoadingState>;
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-[#1B365D] dark:text-foreground'>
					Stamp Settings
				</h1>
				<p className='text-muted-foreground'>
					Configure the stamp information for allocation letters
				</p>
			</div>

			<Card className='max-w-2xl'>
				<CardHeader>
					<CardTitle>Allocation Letter Stamp Configuration</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='stamp_name'>Stamp Name</Label>
						<Input
							id='stamp_name'
							value={settings.stamp_name}
							onChange={(e) =>
								setSettings({ ...settings, stamp_name: e.target.value })
							}
							placeholder='Enter the name for the stamp'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='stamp_rank'>Stamp Rank</Label>
						<Input
							id='stamp_rank'
							value={settings.stamp_rank}
							onChange={(e) =>
								setSettings({ ...settings, stamp_rank: e.target.value })
							}
							placeholder='Enter the rank for the stamp'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='stamp_appointment'>Stamp Appointment</Label>
						<Input
							id='stamp_appointment'
							value={settings.stamp_appointment}
							onChange={(e) =>
								setSettings({ ...settings, stamp_appointment: e.target.value })
							}
							placeholder='Enter the appointment for the stamp'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='stamp_note'>Stamp remarks (Optional)</Label>
						<Textarea
							id='stamp_note'
							value={settings.stamp_note || ""}
							onChange={(e) =>
								setSettings({ ...settings, stamp_note: e.target.value })
							}
							placeholder='Enter any additional remarks for the stamp'
							rows={3}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='copy_to'>Copy To (Optional)</Label>
						<Textarea
							id='copy_to'
							value={settings.copy_to || ""}
							onChange={(e) =>
								setSettings({ ...settings, copy_to: e.target.value })
							}
							placeholder='Enter recipients to copy (e.g., "1. Chief of Staff\n2. Director of Operations")'
							rows={3}
						/>
					</div>

					<LoadingButton
						onClick={handleSave}
						loading={saving}
						className='w-full'>
						{saving ? "Saving..." : "Save Stamp Settings"}
					</LoadingButton>
				</CardContent>
			</Card>
		</div>
	);
};
