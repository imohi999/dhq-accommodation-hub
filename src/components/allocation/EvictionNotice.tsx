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

interface EvictionNoticeProps {
	isOpen: boolean;
	onClose: () => void;
	unit: APIAllocationRequest;
	evictionDate?: Date;
}

export const EvictionNotice = ({
	isOpen,
	onClose,
	unit,
	evictionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
}: EvictionNoticeProps) => {
	const { stampSettings } = useAllocation();
	const activeStamp = stampSettings.find((stamp) => stamp.is_active);

	console.log({ unit });

	const generatePrintDocument = (forDownload = false) => {
		const printContent = document.getElementById("eviction-notice-content");
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

				const filename = `Eviction_Notice_${unit.personnelData.fullName?.replace(
					/\s+/g,
					"_"
				)}_${unit.unit.unitName}.pdf`;

				printWindow.document.write(`
          <html>
            <head>
              <title>${forDownload ? filename : "Eviction Notice"}</title>
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
                #eviction-notice-content {
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
                .ml-6 { margin-left: 1.5rem; }
                .mr-16 { margin-right: 4rem; }
                .mr-20 { margin-right: 5rem; }
                .mr-24 { margin-right: 6rem; }
                .mr-28 { margin-right: 7rem; }
								.mr-40 { margin-right: 10rem; }
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
                
                .justify-between {
                  justify-content: space-between;
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
                
                .uppercase {
                  text-transform: uppercase;
                }
                
                /* Text alignment */
                .text-right {
                  text-align: right;
                }
                
                .text-left {
                  text-align: left;
                }
                
                /* Spacing */
                .space-y-4 > * + * {
                  margin-top: 1rem;
                }
                
                /* Custom classes */
                .notice-title {
                  font-weight: bold;
                  text-decoration: underline;
                  font-size: 1.25rem;
                  margin: 2rem 0;
                }
                
                .notice-body {
                  font-size: 1.1rem;
                  line-height: 1.8;
                  text-align: justify;
                  margin: 2rem 0;
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
                  
                  #eviction-notice-content {
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

	const evictionDateFormatted = evictionDate
		.toLocaleDateString("en-GB", {
			month: "short",
			year: "2-digit",
		})
		.toUpperCase();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center justify-between'>
						<span className='text-lg'>Eviction Notice</span>
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
					id='eviction-notice-content'
					className='p-8 bg-white text-black text-sm'
					style={{
						fontFamily: "Times New Roman, Times, serif",
						fontSize: "14px",
					}}>
					{/* RESTRICTED Header */}
					<div className='text-center mb-8'>
						<p className='font-semibold text-lg'>RESTRICTED</p>
					</div>

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

					{/* Personnel Information */}
					<div className='mb-4'>
						<p className='mb-0 leading-none'>
							Svc No: {unit.personnelData.svcNo}
						</p>
						<p className='mb-0 leading-none'>Rank: {unit.personnelData.rank}</p>
						<p className='mb-0 leading-none'>
							Name: {unit.personnelData.fullName}
						</p>
						<p className='mb-0 leading-none'>
							Unit: {unit.personnelData.currentUnit}
						</p>
						<p className='mb-0 leading-none'>
							Quarter Name: {unit.unitData.quarterName}
						</p>
					</div>

					{/* Notice Title */}
					<div className='text-center mb-8 uppercase font-bold'>
						<p className='notice-title font-bold uppercase underline'>
							NOTICE TO VACATE {unit.unitData.flatHouseRoomName}{" "}
							{unit.unitData.blockName}
						</p>
					</div>

					{/* Body */}
					<div className='notice-body mb-8'>
						<p className='uppercase text-justify '>
							THE OCCUPANT OF ABOVE FLAT IS HEREBY REQUESTED TO VACATE THIS
							TRANSIT ACCN NLT &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							{evictionDateFormatted} TO ENABLE THE NEW ALLOTTEE TO MOVE INTO
							THE APARTMENT. FAILURE TO COMPLY WITH ABOVE DIRECTIVE WILL LEAD TO
							FORCEFUL EVICTION.
						</p>
					</div>

					{/* Signature Section and Date at bottom */}
					<div className='flex justify-between items-end mt-12'>
						{/* Date on left */}
						<div className='text-left'>
							<p>{currentDate}</p>
						</div>

						{/* Signature on right */}
						<div className='text-left flex justify-end mr-40'>
							{activeStamp && (
								<div className='text-sm'>
									<p className='font-bold mb-0 leading-none'>
										{activeStamp.stamp_name}
									</p>
									<p className='mb-0 leading-none'>{activeStamp.stamp_rank}</p>
									<p className='mb-0 leading-none'>
										{activeStamp.stamp_appointment}
									</p>
									<p className='mb-0 leading-none'>for Comd</p>
								</div>
							)}
						</div>
					</div>

					{/* RESTRICTED Footer */}
					<div className='text-center mt-12'>
						<p className='font-semibold text-lg'>RESTRICTED</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
