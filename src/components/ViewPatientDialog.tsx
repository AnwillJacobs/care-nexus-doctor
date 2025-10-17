import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, FileText, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ViewPatientDialogProps {
  patientId: string;
  trigger?: React.ReactNode;
}

export const ViewPatientDialog = ({ patientId, trigger }: ViewPatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPatientData();
    }
  }, [open, patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch medical history
      const { data: historyData, error: historyError } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", patientId)
        .order("visit_date", { ascending: false });

      if (historyError) throw historyError;
      setMedicalHistory(historyData || []);

      // Fetch prescriptions
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patientId)
        .order("date_prescribed", { ascending: false });

      if (prescriptionError) throw prescriptionError;
      setPrescriptions(prescriptionData || []);
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
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>Complete patient information and medical history</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">Loading...</div>
        ) : patient ? (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                Info
              </TabsTrigger>
              <TabsTrigger value="history">
                <FileText className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="prescriptions">
                <Pill className="h-4 w-4 mr-2" />
                Prescriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Patient ID: {patient.patient_id}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{patient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="capitalize">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p>{patient.date_of_birth || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{patient.phone || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{patient.email || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{patient.address || "N/A"}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{patient.emergency_contact_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{patient.emergency_contact_phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {medicalHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No medical history records found</p>
              ) : (
                medicalHistory.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{record.visit_type}</Badge>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(record.visit_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                      <p>{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Treatment</p>
                      <p>{record.treatment}</p>
                    </div>
                    {record.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              {prescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No prescriptions found</p>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{prescription.medication_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(prescription.date_prescribed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dosage</p>
                        <p className="text-sm">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                        <p className="text-sm">{prescription.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-sm">{prescription.duration}</p>
                      </div>
                    </div>
                    {prescription.instructions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Instructions</p>
                        <p className="text-sm">{prescription.instructions}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
