-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  consultation_times TEXT[],
  highlights TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  email TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  visit_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_history table
CREATE TABLE public.medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_history_id TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  visit_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  medical_history_id UUID REFERENCES public.medical_history(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  date_prescribed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for doctors (doctors can see their own data)
CREATE POLICY "Doctors can view their own profile" 
ON public.doctors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own profile" 
ON public.doctors 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for patients (doctors can see all patients)
CREATE POLICY "Authenticated users can view patients" 
ON public.patients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create patients" 
ON public.patients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for medical history
CREATE POLICY "Authenticated users can view medical history" 
ON public.medical_history 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create medical history" 
ON public.medical_history 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update medical history" 
ON public.medical_history 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create RLS policies for prescriptions
CREATE POLICY "Authenticated users can view prescriptions" 
ON public.prescriptions 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prescriptions" 
ON public.prescriptions 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample doctor data
INSERT INTO public.doctors (doctor_id, name, specialization, phone, email, consultation_times, highlights) VALUES
('DR001', 'Dr. Sarah Johnson', 'Cardiology', '+1 (555) 123-4567', 'sarah.johnson@hospital.com', 
 ARRAY['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'], 
 ARRAY['15+ years experience', 'Board Certified', 'Fellowship in Interventional Cardiology']);

-- Insert sample patient data  
INSERT INTO public.patients (patient_id, name, age, phone, email, date_of_birth, gender) VALUES
('P001', 'John Smith', 45, '+1 (555) 234-5678', 'john.smith@email.com', '1979-03-15', 'male'),
('P002', 'Mary Johnson', 32, '+1 (555) 345-6789', 'mary.johnson@email.com', '1992-07-22', 'female'),
('P003', 'Robert Davis', 58, '+1 (555) 456-7890', 'robert.davis@email.com', '1966-11-08', 'male');