import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useAllocation } from "@/hooks/useAllocation";
import { APIAllocationRequest } from "@/src/app/(dashboard)/allocations/pending/page";
import Image from "next/image";

interface AllocationLetterProps {
	isOpen: boolean;
	onClose: () => void;
	allocationRequest: APIAllocationRequest;
}

export const AllocationLetter = ({
	isOpen,
	onClose,
	allocationRequest,
}: AllocationLetterProps) => {
	console.log({ allocationRequest: JSON.stringify(allocationRequest) });

	const { stampSettings } = useAllocation();
	const activeStamp = stampSettings.find((stamp) => stamp.is_active);

	const handlePrint = () => {
		const printContent = document.getElementById("allocation-letter-content");
		if (printContent) {
			const printWindow = window.open("", "_blank");
			if (printWindow) {
				// Clone the content and replace Next Image with regular img for printing
				const clonedContent = printContent.cloneNode(true) as HTMLElement;
				const nextImages = clonedContent.querySelectorAll("img[data-nimg]");
				nextImages.forEach((img) => {
					img.removeAttribute("data-nimg");
					img.removeAttribute("decoding");
					img.removeAttribute("loading");
					img.removeAttribute("style");
					img.setAttribute(
						"style",
						"width: 100%; height: 100%; object-fit: contain;"
					);
				});

				printWindow.document.write(`
          <html>
            <head>
              <title>Allocation Letter</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body { 
                  font-family: 'Inter', Arial, sans-serif; 
                  margin: 0;
                  padding: 40px;
                  line-height: 1.6;
                  font-size: 12px;
                  color: #000;
                  background: white;
                }
                
                /* Main container */
                #allocation-letter-content {
                  max-width: 8.5in;
                  margin: 0 auto;
                  padding: 40px;
                  background: white;
                }
                
                /* Header section */
                .text-center {
                  text-align: center;
                }
                
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-8 { margin-bottom: 2rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mt-12 { margin-top: 3rem; }
                .mt-1 { margin-top: 0.25rem; }
                
                /* Logo container */
                .flex {
                  display: flex;
                }
                
                .justify-center {
                  justify-content: center;
                }
                
                .relative {
                  position: relative;
                }
                
                .w-24 {
                  width: 96px;
                }
                
                .h-24 {
                  height: 96px;
                }
                
                .object-contain {
                  object-fit: contain;
                }
                
                /* Typography */
                .text-lg {
                  font-size: 1.125rem;
                  line-height: 1.75rem;
                }
                
                .text-sm {
                  font-size: 0.875rem;
                  line-height: 1.25rem;
                }
                
                .text-xs {
                  font-size: 0.75rem;
                  line-height: 1rem;
                }
                
                .font-bold {
                  font-weight: 700;
                }
                
                .underline {
                  text-decoration: underline;
                }
                
                /* Text alignment */
                .text-right {
                  text-align: right;
                }
                
                /* Spacing */
                .space-y-4 > * + * {
                  margin-top: 1rem;
                }
                
                /* Custom classes */
                .transit-notice {
                  font-weight: bold;
                  text-decoration: underline;
                }
                
                /* Print specific styles */
                @media print { 
                  @page { 
                    margin: 0.5in;
                    size: letter;
                  }
                  
                  body { 
                    margin: 0;
                    padding: 0;
                    font-size: 11px;
                  }
                  
                  #allocation-letter-content {
                    padding: 0;
                    max-width: 100%;
                  }
                  
                  .text-lg {
                    font-size: 16px;
                    line-height: 1.4;
                  }
                  
                  .text-sm {
                    font-size: 12px;
                    line-height: 1.4;
                  }
                  
                  .text-xs {
                    font-size: 10px;
                    line-height: 1.3;
                  }
                  
                  /* Ensure proper spacing */
                  p {
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                  }
                  
                  /* Page breaks */
                  .signature-section {
                    page-break-inside: avoid;
                  }
                  
                  .copy-section {
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              ${clonedContent.innerHTML}
            </body>
          </html>
        `);
				printWindow.document.close();
				printWindow.print();
			}
		}
	};

	const currentDate = new Date().toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});

	const currentTime = new Date().toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	// Ensure proper letter ID format - use the actual letter_id from the request
	const displayLetterId = allocationRequest.letterId || "DHQ/GAR/ABJ/00/00/LOG";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center justify-between'>
						<Button
							onClick={handlePrint}
							size='sm'
							className='flex items-center gap-2'>
							<Printer className='h-4 w-4' />
							Print
						</Button>
					</DialogTitle>
				</DialogHeader>

				<div
					id='allocation-letter-content'
					className='p-8 bg-white text-black text-sm'>
					{/* Header */}
					<div className='text-center mb-6'>
						<div className='flex justify-center mb-4'>
							<div className='relative w-24 h-24'>
								<Image
									src='/lovable-uploads/5fdd34e0-92c2-4d90-b14f-74d73614597d.png'
									alt='Nigerian Coat of Arms'
									fill
									className='object-contain'
									priority
								/>
							</div>
						</div>
						<h1 className='text-lg font-bold mb-2'>
							DEFENCE HEADQUARTERS GARRISON
						</h1>
						<h2 className='text-lg font-bold mb-1'>MOGADISHU CANTONMENT</h2>
						<h3 className='text-lg font-bold'>ABUJA</h3>
					</div>

					{/* Letter Reference - Display actual letter ID */}
					<div className='mb-4'>
						<p className='font-bold'>{displayLetterId}</p>
					</div>

					{/* Personnel Information */}
					<div className='mb-4'>
						<p>Svc No: {allocationRequest.personnelData.svcNo}</p>
						<p>Rank: {allocationRequest.personnelData.rank}</p>
						<p>Name: {allocationRequest.personnelData.fullName}</p>
						<p>
							Unit:{" "}
							{allocationRequest.personnelData.currentUnit || "DHQ Garrison"}
						</p>
						{allocationRequest.personnelData.phone && (
							<p>Phone No: {allocationRequest.personnelData.phone}</p>
						)}
					</div>

					{/* Date and Time */}
					<div className='text-right mb-6'>
						<p>
							Date: {currentDate} Time: {currentTime}
						</p>
					</div>

					{/* Subject */}
					<div className='text-center mb-6'>
						<p className='font-bold underline'>
							ALLOCATION OF DEFENCE HEADQUARTERS ACCOMMODATION
						</p>
					</div>

					{/* Body */}
					<div className='space-y-4 mb-8'>
						<p>
							I am directed to inform you that you have been allocated{" "}
							{allocationRequest.unit.blockName},
							{allocationRequest.unit.flatHouseRoomName}{" "}
							{allocationRequest.unitData.quarterName},
							{allocationRequest.unitData.location} as residential quarter{" "}
							{allocationRequest.unit.blockName}{" "}
							{allocationRequest.unit.flatHouseRoomName} on{" "}
							{new Date(allocationRequest.allocationDate).toLocaleDateString(
								"en-GB"
							)}
							. You are please requested to note that the accommodation is{" "}
							<span className='transit-notice'>transit in nature</span> and if
							it is unoccupied{" "}
							<span className='transit-notice'>2 Weeks after publication</span>,
							the allocation will be revoked and re-allocated to another
							personnel. In the event of posting out of DHQ or upon retirement,
							you are required to vacate and submit the keys of your
							house/apartment to the QM DHQ Gar for proper marching out
							procedure. Failure to vacate DHQ accommodation will lead to
							forceful ejection. Please be reminded of the existence of Rules
							and Regulations binding Barracks accommodation and note that you
							are to take proper care of all DHQ properties in your
							accommodation.
						</p>

						<p>
							2. While wishing you a fruitful tour of duty and a happy stay in
							your new quarters.
						</p>

						<p>
							Please accept the assurances and esteemed regards of the Comd.
						</p>
					</div>

					{/* Signature - Removed stamp image box, only text */}
					<div className='text-right mt-12'>
						{activeStamp && (
							<div className='text-sm'>
								<p className='font-bold'>{activeStamp.stamp_name}</p>
								<p>{activeStamp.stamp_rank}</p>
								<p>{activeStamp.stamp_appointment}</p>
								{activeStamp.stamp_note && <p>{activeStamp.stamp_note}</p>}
							</div>
						)}
					</div>

					{/* Copy Section */}
					<div className='mt-12 text-xs'>
						<p className='font-bold'>P Copy:</p>
						<p>DHQ Gar Comd</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
