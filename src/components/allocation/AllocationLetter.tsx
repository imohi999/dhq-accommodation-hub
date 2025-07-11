import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useAllocation } from "@/hooks/useAllocation";
import { APIAllocationRequest } from "@/src/app/(dashboard)/allocations/pending/page";

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
	const { stampSettings } = useAllocation();
	const activeStamp = stampSettings.find((stamp) => stamp.is_active);

	// Ensure proper letter ID format - use the actual letter_id from the request
	const displayLetterId = allocationRequest.letterId || "DHQ/GAR/ABJ/00/00/LOG";

	const generatePrintDocument = (forDownload = false) => {
		const printContent = document.getElementById("allocation-letter-content");
		if (printContent) {
			const printWindow = window.open("", "_blank");
			if (printWindow) {
				// Clone the content
				const clonedContent = printContent.cloneNode(true) as HTMLElement;

				// Ensure all images have absolute URLs for printing
				const images = clonedContent.querySelectorAll("img");
				images.forEach((img) => {
					// Convert relative URLs to absolute
					const src = img.getAttribute("src");
					if (src && src.startsWith("/")) {
						img.setAttribute("src", window.location.origin + src);
					}
				});

				const filename = `Allocation_Letter_${allocationRequest.personnelData.fullName.replace(
					/\s+/g,
					"_"
				)}_${displayLetterId.replace(/\//g, "-")}.pdf`;

				printWindow.document.write(`
          <html>
            <head>
              <title>${forDownload ? filename : "Allocation Letter"}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body { 
                  font-family: 'Times New Roman', Times, serif; 
                  margin: 0;
                  padding: 40px;
                  line-height: 1.6;
                  font-size: 14px;
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
                .leading-none { line-height: 1; }
								.mb-0 { margin-bottom: 0; }
                .mb-6 { margin-bottom: 1.5rem; }
								.text-justify { text-align: justify; }
								.mr-16 { margin-right: 4rem; }
								.mr-18 { margin-right: 4.5rem; }
								.mr-20 { margin-right: 5rem; }
								.mr-24 { margin-right: 6rem; }
								.mr-28 { margin-right: 7rem; }
								.mr-42 { margin-right: 10.5rem; }
								.mr-40 { margin-right: 10rem; }
								.mr-52 { margin-right: 13rem; }
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
                
                .justify-end {
                  justify-content: flex-end;
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
                    font-size: 14px;
                  }
                  
                  #allocation-letter-content {
                    padding: 0;
                    max-width: 100%;
                  }
                  
                  .text-lg {
                    font-size: 18px;
                    line-height: 1.4;
                  }
                  
                  .text-sm {
                    font-size: 14px;
                    line-height: 1.4;
                  }
                  
                  .text-xs {
                    font-size: 12px;
                    line-height: 1.3;
                  }
                  
                  /* Ensure proper spacing */
                  p {
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                  }
                  
                  /* Force images to display */
                  img {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    max-width: 96px !important;
                    max-height: 96px !important;
                    width: 96px !important;
                    height: 96px !important;
                    object-fit: contain !important;
                    margin: 0 auto !important;
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

				// Add a small delay to ensure images are loaded
				setTimeout(() => {
					if (forDownload) {
						// For download, we'll use the print dialog which allows saving as PDF
						printWindow.print();
						// Close the window after a delay to allow the print dialog to appear
						setTimeout(() => {
							printWindow.close();
						}, 1000);
					} else {
						// For regular print
						printWindow.print();
					}
				}, 500);
			}
		}
	};

	const handlePrint = () => {
		generatePrintDocument(false);
	};

	const handleDownload = () => {
		generatePrintDocument(true);
	};

	const currentDate = new Date().toLocaleDateString("en-GB", {
		month: "short",
		year: "2-digit",
	});

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center justify-between'>
						<span className='text-lg'>Allocation Letter</span>
						<div className='flex items-center gap-2'>
							<Button
								onClick={handleDownload}
								size='sm'
								variant='outline'
								className='flex items-center gap-2'>
								<Download className='h-4 w-4' />
								Save as PDF
							</Button>
							<Button
								onClick={handlePrint}
								size='sm'
								className='flex items-center gap-2'>
								<Printer className='h-4 w-4' />
								Print
							</Button>
						</div>
					</DialogTitle>
				</DialogHeader>

				<div
					id='allocation-letter-content'
					className='p-8 bg-white text-black text-sm'
					style={{
						fontFamily: "Times New Roman, Times, serif",
						fontSize: "14px",
					}}>
					{/* Header */}
					<div className='text-center mb-6'>
						<div className='flex justify-center mb-4'>
							<img
								src='/lovable-uploads/5fdd34e0-92c2-4d90-b14f-74d73614597d.png'
								alt='Nigerian Coat of Arms'
								style={{
									width: "96px",
									height: "96px",
									objectFit: "contain",
								}}
							/>
						</div>
						<h1 className='text-lg font-bold mb-0 leading-none'>
							DEFENCE HEADQUARTERS GARRISON
						</h1>
						<h2 className='text-lg font-bold mb-0 leading-none'>
							MOGADISHU CANTONMENT
						</h2>
						<h3 className='text-lg font-bold mb-0 leading-none'>ABUJA</h3>
					</div>

					{/* Letter Reference - Display actual letter ID */}
					<div className='mb-2'>
						<p className='font-bold'>{displayLetterId}</p>
					</div>

					{/* Personnel Information */}
					<div className='mb-4'>
						<p className='mb-0 leading-none'>
							Svc No: {allocationRequest.personnelData.svcNo}
						</p>
						<p className='mb-0 leading-none'>
							Rank: {allocationRequest.personnelData.rank}
						</p>
						<p className='mb-0 leading-none'>
							Name: {allocationRequest.personnelData.fullName}
						</p>
						<p className='mb-0 leading-none'>
							Unit:{" "}
							{allocationRequest.personnelData.currentUnit || "DHQ Garrison"}
						</p>
						{allocationRequest.personnelData.phone && (
							<p className='mb-0 leading-none'>
								Phone No: {allocationRequest.personnelData.phone}
							</p>
						)}
					</div>

					{/* Date and Time */}
					<div className='text-right mb-6 mr-42'>
						<p>{currentDate}</p>
					</div>

					{/* Subject */}
					<div className='text-center mb-6'>
						<p className='font-bold underline'>
							ALLOCATION OF DEFENCE HEADQUARTERS ACCOMMODATION
						</p>
					</div>

					{/* Body */}
					<div className='space-y-4 mb-8 text-justify'>
						<p>
							1.&nbsp;&nbsp;&nbsp;&nbsp; I am directed to inform you that you
							have been allocated{" "}
							<span className='font-bold'>
								{allocationRequest.unit.blockName}
							</span>
							,{" "}
							<span className='font-bold'>
								{allocationRequest.unit.flatHouseRoomName}
							</span>{" "}
							<span className='font-bold'>
								{allocationRequest.unitData.quarterName}
							</span>
							,{" "}
							<span className='font-bold'>
								{allocationRequest.unitData.location}
							</span>{" "}
							as residential quarter{" "}
							<span className='font-bold'>
								{allocationRequest.unit.flatHouseRoomName}
							</span>{" "}
							on{" "}
							<span className='font-bold'>
								{new Date(allocationRequest.allocationDate).toLocaleDateString(
									"en-GB",
									{
										day: "2-digit",
										month: "short",
										year: "2-digit",
									}
								)}
							</span>
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
							2.&nbsp;&nbsp;&nbsp; While wishing you a fruitful tour of duty and
							a happy stay in your new quarters. Please accept the assurances
							and esteemed regards of the Comd.
						</p>
					</div>

					{/* Signature - Removed stamp image box, only text */}
					<div className='text-left mt-12 mr-40 flex justify-end'>
						{activeStamp && (
							<div className='text-sm'>
								<p className='font-bold mb-0 leading-none'>
									{activeStamp.stamp_name}
								</p>
								<p className='mb-0 leading-none'>{activeStamp.stamp_rank}</p>
								<p className='mb-0 leading-none'>
									{activeStamp.stamp_appointment}
								</p>
								{activeStamp.stamp_note && (
									<p className='mb-0 leading-none'>{activeStamp.stamp_note}</p>
								)}
							</div>
						)}
					</div>

					{/* Copy Section */}
					<div className='text-xs'>
						<p className='font-bold mb-0 leading-none'>Copy To:</p>
						{activeStamp?.copy_to ? (
							<div style={{ whiteSpace: "pre-line" }}>
								{activeStamp.copy_to}
							</div>
						) : (
							<p>DHQ Gar Comd</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
