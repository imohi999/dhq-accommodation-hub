import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useStampSettings } from "@/hooks/useStampSettings";

interface ClearanceLetterProps {
	isOpen: boolean;
	onClose: () => void;
	allocation: any;
}

export const ClearanceLetter = ({
	isOpen,
	onClose,
	allocation,
}: ClearanceLetterProps) => {
	const { stampSettings } = useStampSettings();
	const activeStamp = stampSettings.find((stamp) => stamp.is_active);
	
	const personnelData = allocation?.personnel_data || allocation?.personnelData;
	const unitData = allocation?.unit_data || allocation?.unitData;
	const latestInspection = allocation?.clearance_inspections?.[0];

	// Ensure proper letter ID format
	const displayLetterId = `DHQ/AMU/CLR/${new Date().getFullYear()}/${allocation.id?.slice(-6) || "000000"}`;

	const generatePrintDocument = (forDownload = false) => {
		const printContent = document.getElementById("clearance-letter-content");
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

				const filename = `Clearance_Letter_${personnelData?.name?.replace(
					/\s+/g,
					"_"
				)}_${displayLetterId.replace(/\//g, "-")}.pdf`;

				printWindow.document.write(`
          <html>
            <head>
              <title>${forDownload ? filename : "Clearance Letter"}</title>
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
                #clearance-letter-content {
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
								.text-justify { text-align: justify; }
								.mr-16 { margin-right: 4rem; }
								.mr-18 { margin-right: 4.5rem; }
								.mr-20 { margin-right: 5rem; }
								.mr-24 { margin-right: 6rem; }
								.mr-28 { margin-right: 7rem; }
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
                  
                  #clearance-letter-content {
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
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

	// Safe date formatting function
	const formatSafeDate = (dateValue: any, defaultText = 'N/A') => {
		if (!dateValue) return defaultText;
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return defaultText;
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
		} catch {
			return defaultText;
		}
	};

	// Safe date formatting function with full month name
	const formatSafeDateLong = (dateValue: any, defaultText = 'N/A') => {
		if (!dateValue) return defaultText;
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return defaultText;
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			});
		} catch {
			return defaultText;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center justify-between'>
						<span className='text-lg'>Clearance Letter</span>
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
					id='clearance-letter-content'
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
						<h1 className='text-lg font-bold leading-tight'>
							DEFENCE HEADQUARTERS
						</h1>
						<h2 className='text-lg font-bold leading-tight'>
							ACCOMMODATION MANAGEMENT UNIT
						</h2>
						<h3 className='text-lg font-bold leading-tight'>CLEARANCE CERTIFICATE</h3>
					</div>

					{/* Letter Reference - Display actual letter ID */}
					<div className='mb-2'>
						<p className='font-bold'>{displayLetterId}</p>
					</div>

					{/* Date */}
					<div className='text-right mb-6 mr-52'>
						<p>{currentDate}</p>
					</div>

					{/* Subject */}
					<div className='text-center mb-6'>
						<p className='font-bold underline'>
							TO WHOM IT MAY CONCERN
						</p>
					</div>

					{/* Body */}
					<div className='space-y-4 mb-8 text-justify'>
						<p className='text-center font-bold'>
							CLEARANCE CERTIFICATE FOR {personnelData?.rank} {personnelData?.name} ({personnelData?.svcNo})
						</p>

						<p>
							This is to certify that the above-named officer/personnel has satisfactorily vacated 
							the DHQ accommodation unit allocated to them and has been cleared following a thorough 
							inspection of the property.
						</p>

						<p>
							<span className='font-bold'>Accommodation Details:</span><br/>
							Unit Name: {unitData?.unitName}<br/>
							Unit Number: {unitData?.unitNo}<br/>
							Unit Type: {unitData?.unitType}<br/>
							Location: {unitData?.location || 'N/A'}<br/>
							Allocation Period: {formatSafeDate(allocation.allocation_start_date)} to {' '}
							{formatSafeDate(allocation.allocation_end_date, 'Present')}
						</p>

						{latestInspection && (
							<>
								<p>
									<span className='font-bold'>Inspection Details:</span><br/>
									Inspector: {latestInspection.inspector_rank} {latestInspection.inspector_name} ({latestInspection.inspector_svc_no})<br/>
									Appointment: {latestInspection.inspector_appointment}<br/>
									Inspection Date: {formatSafeDateLong(latestInspection.inspection_date)}<br/>
									{latestInspection.remarks && (
										<>Remarks: {latestInspection.remarks}</>
									)}
								</p>

								<p>
									The inspection confirmed that all items in the accommodation inventory have been 
									accounted for and the unit has been left in an acceptable condition, subject to 
									normal wear and tear.
								</p>
							</>
						)}

						<p>
							This clearance certificate is issued without prejudice and confirms that the 
							above-named personnel has no outstanding obligations regarding the referenced 
							accommodation unit.
						</p>

						<p>
							This certificate is valid for official purposes and should be presented as required.
						</p>
					</div>

					{/* Signature - Removed stamp image box, only text */}
					<div className='text-left mt-12 mr-40 flex justify-end'>
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
						<p className='font-bold'>Copy To:</p>
						{activeStamp?.copy_to ? (
							<div style={{ whiteSpace: "pre-line" }}>
								{activeStamp.copy_to}
							</div>
						) : (
							<p>DHQ Accommodation Management Unit</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};