import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingState } from "@/components/ui/spinner";
import { Trash2, Edit } from "lucide-react";
interface MaintenanceTask {
  id: string;
  unitId: string;
  unitName: string;
  taskName: string;
  taskDescription: string;
  lastPerformedDate: string;
  nextDueDate: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
import { useState } from "react";

export function MaintenanceTaskTable({
  tasks,
  loading,
  onEdit,
  onDelete
}: {
  tasks: MaintenanceTask[],
  loading: boolean,
  onEdit: (task: MaintenanceTask) => void,
  onDelete: (id: string) => void
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState isLoading={true} children={null} />;
  }

  if (!tasks.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No maintenance tasks yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-x-auto border shadow-sm bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-muted text-foreground">
            <th className="p-3 text-left">Unit Name</th>
            <th className="p-3 text-left">Task Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Last Performed</th>
            <th className="p-3 text-left">Next Due</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Notes</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{task.unitName}</td>
              <td className="p-3 font-medium">{task.taskName}</td>
              <td className="p-3 max-w-xs break-words">{task.taskDescription}</td>
              <td className="p-3">
                {task.lastPerformedDate ? new Date(task.lastPerformedDate).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">
                {task.nextDueDate ? new Date(task.nextDueDate).toLocaleDateString() : "-"}
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="p-3">{task.notes}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <LoadingButton 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(task)}
                    disabled={deletingId === task.id}
                  >
                    <Edit className="h-3 w-3" />
                  </LoadingButton>
                  <LoadingButton 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(task.id)}
                    loading={deletingId === task.id}
                    disabled={deletingId !== null}
                  >
                    <Trash2 className="h-3 w-3" />
                  </LoadingButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}