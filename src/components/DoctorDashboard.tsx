import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, FileText, Calendar, Stethoscope, Clock, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddPatientDialog from "./AddPatientDialog";
import CreatePrescriptionDialog from "./CreatePrescriptionDialog";

// Mock data
const doctorProfile = {
  id: "DR001",
  name: "Dr. Sarah Johnson",
  specialization: "Cardiology",
  contact: {
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@hospital.com"
  },
  consultationTimes: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"],
  highlights: ["15+ years experience", "Board Certified", "Fellowship in Interventional Cardiology"]
};

const mockPatients = [
  {
    id: "P001",
    name: "John Smith",
    age: 45,
    lastVisit: "2024-01-15",
    condition: "Hypertension",
    status: "Active"
  },
  {
    id: "P002", 
    name: "Mary Johnson",
    age: 32,
    lastVisit: "2024-01-20",
    condition: "Regular Checkup",
    status: "Completed"
  },
  {
    id: "P003",
    name: "Robert Davis",
    age: 58,
    lastVisit: "2024-01-22",
    condition: "Chest Pain",
    status: "Follow-up"
  }
];

const mockMedicalHistory = [
  {
    id: "MH001",
    patientId: "P001",
    patientName: "John Smith",
    visitDate: "2024-01-15",
    diagnosis: "Essential Hypertension",
    treatment: "Lisinopril 10mg daily",
    visitType: "Follow-up",
    notes: "Blood pressure well controlled. Continue current medication."
  },
  {
    id: "MH002",
    patientId: "P002",
    patientName: "Mary Johnson", 
    visitDate: "2024-01-20",
    diagnosis: "Annual Physical",
    treatment: "Preventive care counseling",
    visitType: "Routine",
    notes: "Patient in excellent health. Recommended annual mammogram."
  },
  {
    id: "MH003",
    patientId: "P003",
    patientName: "Robert Davis",
    visitDate: "2024-01-22",
    diagnosis: "Atypical Chest Pain",
    treatment: "EKG, stress test ordered",
    visitType: "Consultation",
    notes: "EKG normal. Stress test scheduled for next week."
  }
];

const DoctorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
    fetchMedicalHistory();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_history")
        .select(`
          *,
          patients (name, patient_id),
          doctors (name, doctor_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedicalHistory(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching medical history:", error);
      toast.error("Failed to load medical history");
      setLoading(false);
    }
  };

  const handlePatientAdded = () => {
    fetchPatients();
  };

  const handlePrescriptionCreated = () => {
    toast.success("Prescription created successfully");
  };

  const filteredHistory = medicalHistory.filter(record =>
    record.patients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Patient Management System</p>
          </div>
          <AddPatientDialog onPatientAdded={handlePatientAdded} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Doctor Profile</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">8</div>
                  <p className="text-xs text-muted-foreground">Next at 2:00 PM</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Records</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">3</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Patients from recent appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age: {patient.age} • ID: {patient.patient_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Doctor Profile
                </CardTitle>
                <CardDescription>Professional information and credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-lg">SJ</AvatarFallback>
                  </Avatar>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-bold">{doctorProfile.name}</h3>
                      <p className="text-lg text-primary font-medium">{doctorProfile.specialization}</p>
                      <p className="text-sm text-muted-foreground">Doctor ID: {doctorProfile.id}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {doctorProfile.contact.phone}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {doctorProfile.contact.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Consultation Hours
                        </h4>
                        <div className="space-y-2">
                          {doctorProfile.consultationTimes.map((time, index) => (
                            <Badge key={index} variant="outline">{time}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Professional Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {doctorProfile.highlights.map((highlight, index) => (
                          <Badge key={index} variant="secondary">{highlight}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical History Records</CardTitle>
                <CardDescription>Comprehensive patient medical history and records</CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading medical history...</p>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No medical history records found.</p>
                    </div>
                  ) : (
                    filteredHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{record.patients?.name}</h4>
                            <p className="text-sm text-muted-foreground">Patient ID: {record.patients?.patient_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{new Date(record.visit_date).toLocaleDateString()}</p>
                            <Badge variant="outline">{record.visit_type}</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm text-muted-foreground">DIAGNOSIS</h5>
                            <p className="text-sm">{record.diagnosis}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-muted-foreground">TREATMENT</h5>
                            <p className="text-sm">{record.treatment || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">CLINICAL NOTES</h5>
                          <p className="text-sm">{record.notes || "No notes available"}</p>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">Update Record</Button>
                          <CreatePrescriptionDialog onPrescriptionCreated={handlePrescriptionCreated} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;