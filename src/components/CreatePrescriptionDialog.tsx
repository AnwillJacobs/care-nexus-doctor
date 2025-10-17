import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreatePrescriptionDialogProps {
  medicalHistoryId?: string;
  patientId?: string;
  trigger?: React.ReactNode;
}

export const CreatePrescriptionDialog = ({ medicalHistoryId, patientId, trigger }: CreatePrescriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && !patientId) {
      fetchPatients();
    }
  }, [open, patientId]);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from("patients").select("id, name, patient_id");
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } else {
      setPatients(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const prescriptionData = {
      prescription_id: `RX${Date.now()}`,
      patient_id: patientId || (formData.get("patientId") as string),
      doctor_id: "temp-doctor-id", // This should come from auth context
      medical_history_id: medicalHistoryId || null,
      medication_name: formData.get("medicationName") as string,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string,
      duration: formData.get("duration") as string,
      instructions: formData.get("instructions") as string,
    };

    try {
      const { error } = await supabase.from("prescriptions").insert([prescriptionData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      setOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Create Prescription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
          <DialogDescription>Fill in the prescription details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!patientId && (
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select name="patientId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.patient_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="medicationName">Medication Name *</Label>
            <Input id="medicationName" name="medicationName" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input id="dosage" name="dosage" placeholder="e.g., 500mg" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input id="frequency" name="frequency" placeholder="e.g., Twice daily" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration *</Label>
            <Input id="duration" name="duration" placeholder="e.g., 7 days" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" name="instructions" rows={3} placeholder="Additional instructions for the patient" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
