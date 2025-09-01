import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pill } from "lucide-react";

interface Patient {
  id: string;
  patient_id: string;
  name: string;
}

interface Doctor {
  id: string;
  doctor_id: string;
  name: string;
}

interface CreatePrescriptionDialogProps {
  onPrescriptionCreated?: () => void;
}

const CreatePrescriptionDialog = ({ onPrescriptionCreated }: CreatePrescriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchDoctors();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_id, name")
        .order("name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, doctor_id, name")
        .order("name");

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  const generatePrescriptionId = () => {
    const timestamp = Date.now();
    return `RX${timestamp.toString().slice(-6)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.medicationName || !formData.dosage || !formData.frequency || !formData.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const prescriptionId = generatePrescriptionId();
      
      const { error } = await supabase
        .from("prescriptions")
        .insert({
          prescription_id: prescriptionId,
          patient_id: formData.patientId,
          doctor_id: formData.doctorId,
          medication_name: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration,
          instructions: formData.instructions || null,
        });

      if (error) throw error;

      toast.success("Prescription created successfully");
      setFormData({
        patientId: "",
        doctorId: "",
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
      setOpen(false);
      onPrescriptionCreated?.();
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pill className="h-4 w-4" />
          Create Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
          <DialogDescription>
            Create a new prescription for a patient.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select onValueChange={(value) => handleInputChange("patientId", value)}>
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
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor *</Label>
              <Select onValueChange={(value) => handleInputChange("doctorId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.doctor_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                value={formData.medicationName}
                onChange={(e) => handleInputChange("medicationName", e.target.value)}
                placeholder="Enter medication name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                placeholder="e.g., 10mg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                placeholder="e.g., Twice daily"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 7 days"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Enter special instructions for the patient"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrescriptionDialog;