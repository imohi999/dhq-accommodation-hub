import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ImportConfirmationProps {
	validationComplete: boolean;
	validationErrorsLength: number;
	parsedDataLength: number;
	isImporting: boolean;
	onImport: () => void;
}

export const ImportConfirmation = ({
	validationComplete,
	validationErrorsLength,
	parsedDataLength,
	isImporting,
	onImport,
}: ImportConfirmationProps) => {
	if (!validationComplete || validationErrorsLength > 0) return null;

	return (
		<div className='space-y-4'>
			<h3 className='text-lg font-semibold'>Step 4: Import Data</h3>
			<LoadingButton
				onClick={onImport}
				loading={isImporting}
				className='w-full'>
				{isImporting ? "Importing..." : `Import ${parsedDataLength} Records`}
			</LoadingButton>
		</div>
	);
};
