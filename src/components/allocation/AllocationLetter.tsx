
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AllocationRequest, AllocationLetterData } from "@/types/allocation";
import { useAllocation } from "@/hooks/useAllocation";
import { Printer, Download } from "lucide-react";

interface AllocationLetterProps {
  isOpen: boolean;
  onClose: () => void;
  allocationRequest: AllocationRequest;
}

export const AllocationLetter = ({ isOpen, onClose, allocationRequest }: AllocationLetterProps) => {
  const { stampSettings } = useAllocation();
  const currentStamp = stampSettings[0];

  const letterData: AllocationLetterData = {
    letterRef: allocationRequest.letter_id,
    date: new Date(allocationRequest.allocation_date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    personnel: {
      name: allocationRequest.personnel_data.full_name,
      rank: allocationRequest.personnel_data.rank,
      serviceNumber: allocationRequest.personnel_data.svc_no,
      unit: allocationRequest.personnel_data.current_unit || "N/A",
      maritalStatus: allocationRequest.personnel_data.marital_status,
      dependents: {
        adults: allocationRequest.personnel_data.no_of_adult_dependents,
        children: allocationRequest.personnel_data.no_of_child_dependents,
      },
    },
    accommodation: {
      type: allocationRequest.unit_data.housing_type?.name || "N/A",
      location: allocationRequest.unit_data.location,
      quarter: allocationRequest.unit_data.quarter_name,
      block: allocationRequest.unit_data.block_name,
      flatHouseRoom: allocationRequest.unit_data.flat_house_room_name,
      rooms: allocationRequest.unit_data.no_of_rooms,
    },
    stamp: currentStamp ? {
      name: currentStamp.stamp_name,
      rank: currentStamp.stamp_rank,
      appointment: currentStamp.stamp_appointment,
      note: currentStamp.stamp_note,
    } : {
      name: "Officer",
      rank: "Rank",
      appointment: "Appointment",
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would ideally generate a PDF, but for now we'll use print
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Allocation Letter - {letterData.letterRef}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4 print:text-black print:bg-white">
          {/* Letter Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-4">
              <img 
                src="/lovable-uploads/5d2ea046-7e4b-4691-945f-759906349865.png" 
                alt="Nigerian Army Logo" 
                className="h-16 w-16"
              />
              <div>
                <h1 className="text-lg font-bold">NIGERIAN ARMY</h1>
                <h2 className="text-base font-semibold">DEFENCE HEADQUARTERS</h2>
                <h3 className="text-sm">GARRISON COMMAND ABUJA</h3>
              </div>
            </div>
          </div>

          {/* Letter Reference and Date */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Ref: {letterData.letterRef}</p>
            </div>
            <div className="text-right">
              <p>{letterData.date}</p>
            </div>
          </div>

          {/* Addressee */}
          <div>
            <p className="font-medium">{letterData.personnel.rank} {letterData.personnel.name}</p>
            <p>Svc No: {letterData.personnel.serviceNumber}</p>
            <p>{letterData.personnel.unit}</p>
          </div>

          {/* Subject */}
          <div>
            <p className="font-medium underline">
              ALLOCATION OF DEFENCE HEADQUARTERS QUARTERS
            </p>
          </div>

          {/* Letter Body */}
          <div className="space-y-4">
            <p>
              I am directed to inform you that you have been allocated the under-mentioned 
              Defence Headquarters Quarter with effect from {letterData.date}.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium">QUARTER DETAILS:</h4>
              <ul className="list-none space-y-1 ml-4">
                <li>Quarter Name: {letterData.accommodation.quarter}</li>
                <li>Location: {letterData.accommodation.location}</li>
                <li>Block: {letterData.accommodation.block}</li>
                <li>Flat/House/Room: {letterData.accommodation.flatHouseRoom}</li>
                <li>Number of Rooms: {letterData.accommodation.rooms}</li>
                <li>Type: {letterData.accommodation.type}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">PERSONNEL DETAILS:</h4>
              <ul className="list-none space-y-1 ml-4">
                <li>Marital Status: {letterData.personnel.maritalStatus}</li>
                <li>Number of Adult Dependents: {letterData.personnel.dependents.adults}</li>
                <li>Number of Child Dependents: {letterData.personnel.dependents.children}</li>
              </ul>
            </div>

            <p>
              You are to report to the Estate Manager for proper documentation and 
              key collection not later than 7 days from the date of this letter.
            </p>

            <p>
              Please ensure you comply with all garrison standing orders and 
              regulations regarding the use and maintenance of the allocated quarter.
            </p>
          </div>

          {/* Signature Block */}
          <div className="space-y-8 mt-12">
            <div className="text-right">
              <div className="space-y-1">
                <p className="font-medium">{letterData.stamp.name}</p>
                <p>{letterData.stamp.rank}</p>
                <p>{letterData.stamp.appointment}</p>
                {letterData.stamp.note && (
                  <p className="text-sm italic">{letterData.stamp.note}</p>
                )}
              </div>
            </div>
          </div>

          {/* Copy to */}
          <div className="space-y-2 mt-8">
            <p className="font-medium">Copy to:</p>
            <ul className="list-none space-y-1 ml-4">
              <li>1. Estate Manager - DHQ Garrison Command</li>
              <li>2. Unit Commanding Officer</li>
              <li>3. File</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
