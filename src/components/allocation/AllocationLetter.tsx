
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { AllocationRequest } from "@/types/allocation";
import { useAllocation } from "@/hooks/useAllocation";

interface AllocationLetterProps {
  isOpen: boolean;
  onClose: () => void;
  allocationRequest: AllocationRequest;
}

export const AllocationLetter = ({ isOpen, onClose, allocationRequest }: AllocationLetterProps) => {
  const { stampSettings } = useAllocation();
  const activeStamp = stampSettings.find(stamp => stamp.is_active);

  const handlePrint = () => {
    const printContent = document.getElementById('allocation-letter-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Allocation Letter</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 40px; 
                  line-height: 1.4;
                  font-size: 12px;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                }
                .logo { 
                  width: 80px; 
                  height: 80px; 
                  margin: 0 auto 15px; 
                }
                .content { 
                  line-height: 1.6; 
                }
                .letter-ref {
                  margin: 20px 0;
                  font-weight: bold;
                }
                .personnel-info {
                  margin: 20px 0;
                  line-height: 1.4;
                }
                .date-time {
                  text-align: right;
                  margin: 20px 0;
                }
                .subject {
                  font-weight: bold;
                  text-align: center;
                  margin: 30px 0;
                  text-decoration: underline;
                }
                .allocation-details {
                  margin: 20px 0;
                  line-height: 1.6;
                }
                .signature-section {
                  margin-top: 60px;
                  text-align: right;
                }
                .copy-section {
                  margin-top: 40px;
                  font-size: 11px;
                }
                .transit-notice {
                  font-weight: bold;
                  text-decoration: underline;
                }
                @media print { 
                  @page { margin: 40px; } 
                  body { font-size: 11px; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Ensure proper letter ID format - use the actual letter_id from the request
  const displayLetterId = allocationRequest.letter_id || 'DHQ/GAR/ABJ/00/00/LOG';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Allocation Letter
            <Button onClick={handlePrint} size="sm" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div id="allocation-letter-content" className="p-8 bg-white text-black text-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/b7ec1911-808e-434f-a9d0-013852ef65b9.png" 
                alt="DHQ Logo" 
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-base font-bold mb-1">DEFENCE HEADQUARTERS GARRISON</h1>
            <h2 className="text-base font-bold mb-1">MOGADISHU CANTONMENT</h2>
            <h3 className="text-base font-bold">ABUJA</h3>
          </div>

          {/* Letter Reference - Display actual letter ID */}
          <div className="mb-4">
            <p className="font-bold">{displayLetterId}</p>
          </div>

          {/* Personnel Information */}
          <div className="mb-4">
            <p>Svc No: {allocationRequest.personnel_data.svc_no}</p>
            <p>Rank: {allocationRequest.personnel_data.rank}</p>
            <p>Name: {allocationRequest.personnel_data.full_name}</p>
            <p>Unit: {allocationRequest.personnel_data.current_unit || "DHQ Garrison"}</p>
            {allocationRequest.personnel_data.phone && (
              <p>Phone No: {allocationRequest.personnel_data.phone}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="text-right mb-6">
            <p>Date: {currentDate} Time: {currentTime}</p>
          </div>

          {/* Subject */}
          <div className="text-center mb-6">
            <p className="font-bold underline">ALLOCATION OF DEFENCE HEADQUARTERS ACCOMMODATION</p>
          </div>

          {/* Body */}
          <div className="space-y-4 mb-8">
            <p>
              I am directed to inform you that you have been allocated {allocationRequest.unit_data.block_name}, 
              {allocationRequest.unit_data.flat_house_room_name} {allocationRequest.unit_data.quarter_name}, 
              {allocationRequest.unit_data.location} as residential quarter {allocationRequest.unit_data.block_name} {allocationRequest.unit_data.flat_house_room_name} on {new Date(allocationRequest.allocation_date).toLocaleDateString('en-GB')}. 
              You are please requested to note that the accommodation is <span className="transit-notice">transit in nature</span> and if it is unoccupied <span className="transit-notice">2 Weeks after publication</span>, the allocation will be revoked and re-allocated to another personnel. In the event of posting out of DHQ or upon retirement, you are required to vacate and submit the keys of your house/apartment to the QM DHQ Gar for proper marching out procedure. Failure to vacate DHQ accommodation will lead to forceful ejection. Please be reminded of the existence of Rules and Regulations binding Barracks accommodation and note that you are to take proper care of all DHQ properties in your accommodation.
            </p>

            <p>
              2. While wishing you a fruitful tour of duty and a happy stay in your new quarters.
            </p>

            <p>
              Please accept the assurances and esteemed regards of the Comd.
            </p>
          </div>

          {/* Signature - Removed stamp image box, only text */}
          <div className="text-right mt-12">
            {activeStamp && (
              <div className="text-sm">
                <p className="font-bold">{activeStamp.stamp_name}</p>
                <p>{activeStamp.stamp_rank}</p>
                <p>{activeStamp.stamp_appointment}</p>
                {activeStamp.stamp_note && <p>{activeStamp.stamp_note}</p>}
              </div>
            )}
          </div>

          {/* Copy Section */}
          <div className="mt-12 text-xs">
            <p className="font-bold">P Copy:</p>
            <p>DHQ Gar Comd</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
