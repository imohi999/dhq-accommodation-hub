
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { UnitHistory } from "@/types/accommodation";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitName: string;
  history: UnitHistory[];
}

export const HistoryModal = ({ isOpen, onClose, unitName, history }: HistoryModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Occupancy History - {unitName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{record.occupant_name}</span>
                      <Badge variant="outline">{record.rank}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.service_number}</p>
                  </div>
                  {record.duration_days && (
                    <Badge variant="secondary">
                      {record.duration_days} days
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Start:</span>
                    <span>{formatDate(record.start_date)}</span>
                  </div>
                  {record.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="text-muted-foreground">End:</span>
                      <span>{formatDate(record.end_date)}</span>
                    </div>
                  )}
                </div>
                
                {record.reason_for_leaving && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reason for leaving:</span>
                    <p className="mt-1 text-foreground">{record.reason_for_leaving}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No occupancy history available for this unit.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
