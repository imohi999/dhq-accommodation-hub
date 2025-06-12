
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
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { width: 60px; height: 60px; margin: 0 auto 10px; }
                .content { line-height: 1.6; }
                .subject { font-weight: bold; text-decoration: underline; margin: 20px 0; }
                .paragraph { margin-bottom: 15px; }
                .signature-section { margin-top: 40px; }
                @media print { @page { margin: 40px; } }
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
        
        <div id="allocation-letter-content" className="p-8 bg-white text-black">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/6dea8f38-4e85-41a5-95cc-343631f1cde0.png" 
                alt="DHQ Logo" 
                className="w-16 h-16"
              />
            </div>
            <h1 className="text-lg font-bold">DEFENCE HEADQUARTERS GARRISON</h1>
            <h2 className="text-lg font-bold">MOGADISHU CANTONMENT ABUJA</h2>
            <div className="mt-4">
              <p className="font-bold underline">DHQGAR/ABJ/LOG</p>
            </div>
            <div className="mt-4 text-right">
              <p>{currentDate}</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6">
            <p className="font-bold">{allocationRequest.personnel_data.rank} {allocationRequest.personnel_data.full_name}</p>
            <p>Svc No: {allocationRequest.personnel_data.svc_no}</p>
            <p>{allocationRequest.personnel_data.current_unit || "Naval Academy"}</p>
            <p>{allocationRequest.personnel_data.appointment || "Academy Instructor"}</p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <p className="font-bold underline">SUBJECT: ALLOCATION OF ACCOMMODATION</p>
          </div>

          {/* Body */}
          <div className="space-y-4 mb-8">
            <p>
              I am directed to inform you that you have been allocated accommodation as detailed below:
            </p>

            <div className="ml-8">
              <p><strong>Type:</strong> {allocationRequest.unit_data.housing_type_name || allocationRequest.unit_data.category}</p>
              <p><strong>Location:</strong> {allocationRequest.unit_data.location}</p>
              <p><strong>Quarter:</strong> {allocationRequest.unit_data.quarter_name}</p>
              <p><strong>Block:</strong> {allocationRequest.unit_data.block_name}</p>
              <p><strong>Flat/House/Room:</strong> {allocationRequest.unit_data.flat_house_room_name}</p>
              <p><strong>No. of Rooms:</strong> {allocationRequest.unit_data.no_of_rooms}</p>
            </div>

            <p>
              2. You are to report to the Estate Manager for the collection of keys and documentation.
            </p>

            <p>
              3. Please ensure you comply with all accommodation regulations and maintain the facility in good condition.
            </p>

            <p>
              4. Any damages beyond fair wear and tear will be charged to your account.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-12">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-32 h-20 border-2 border-gray-300 mx-auto flex items-center justify-center text-xs text-gray-500">
                  OFFICIAL STAMP
                </div>
              </div>
              {activeStamp && (
                <div>
                  <p className="font-bold">{activeStamp.stamp_name}</p>
                  <p>{activeStamp.stamp_rank}</p>
                  <p>{activeStamp.stamp_appointment}</p>
                  {activeStamp.stamp_note && <p className="text-sm italic">{activeStamp.stamp_note}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-xs">
            <p>Copy to:</p>
            <p>1. Estate Manager - for information and necessary action</p>
            <p>2. Unit file</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
