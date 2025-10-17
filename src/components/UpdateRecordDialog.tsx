import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UpdateRecordDialogProps {
  recordId: string;
  patientId: string;
  patientName: string;
  currentData?: {
    diagnosis: string;
    treatment: string;
    visitType: string;
    notes: string;
  };
  trigger?: React.ReactNode;
}

export const UpdateRecordDialog = ({ recordId, patientId, patientName, currentData, trigger }: UpdateRecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updateData = {
      diagnosis: formData.get("diagnosis") as string,
      treatment: formData.get("treatment") as string,
      visit_type: formData.get("visitType") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const { error } = await supabase
        .from("medical_history")
        .update(updateData)
        .eq("id", recordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record updated successfully",
      });

      setOpen(false);
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
            Update Record
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Medical Record</DialogTitle>
          <DialogDescription>
            Update medical record for {patientName} (ID: {patientId})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitType">Visit Type *</Label>
            <Select name="visitType" defaultValue={currentData?.visitType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select visit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Routine">Routine</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              name="diagnosis"
              defaultValue={currentData?.diagnosis}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment *</Label>
            <Textarea
              id="treatment"
              name="treatment"
              defaultValue={currentData?.treatment}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={currentData?.notes}
              rows={4}
              placeholder="Enter clinical observations and notes"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
