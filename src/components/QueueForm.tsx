
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueFormProps } from "@/types/queue";
import { useQueueForm } from "@/hooks/useQueueForm";
import { PersonalInfoFields } from "@/components/queue/PersonalInfoFields";
import { ServiceInfoFields } from "@/components/queue/ServiceInfoFields";
import { DependentsFields } from "@/components/queue/DependentsFields";
import { DependentsDetailsFields } from "@/components/queue/DependentsDetailsFields";
import { UnitAndDatesFields } from "@/components/queue/UnitAndDatesFields";

export const QueueForm = ({ item, onSubmit, onCancel }: QueueFormProps) => {
  const {
    formData,
    units,
    loading,
    handleInputChange,
    handleSubmit
  } = useQueueForm(item, onSubmit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit' : 'Add'} Personnel</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PersonalInfoFields 
              formData={formData}
              onInputChange={handleInputChange}
            />
            <ServiceInfoFields 
              formData={formData}
              onInputChange={handleInputChange}
            />
            <DependentsFields 
              formData={formData}
              onInputChange={handleInputChange}
            />
            <UnitAndDatesFields 
              formData={formData}
              units={units}
              onInputChange={handleInputChange}
            />
          </div>

          <DependentsDetailsFields
            dependents={formData.dependents}
            onDependentsChange={(dependents) => handleInputChange('dependents', dependents)}
          />

          <div className="flex gap-4 pt-4">
            <LoadingButton 
              type="submit" 
              loading={loading}
              loadingText="Saving..."
            >
              {item ? "Update" : "Create"}
            </LoadingButton>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
