import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  description: string;
  jurorTraits: string;
  questions: string[];
}

interface EditCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCase: Case | null;
  editFormData: {
    number: string;
    name: string;
    type: string;
    status: string;
    description: string;
    jurorTraits: string;
    questions: string[];
  };
  onEditFormDataChange: (field: string, value: string | string[]) => void;
  onSave: () => void;
}

export default function EditCaseDialog({ isOpen, onOpenChange, editingCase, editFormData, onEditFormDataChange, onSave }: EditCaseDialogProps) {
  if (!editingCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Edit Case</span>
          </DialogTitle>
          <DialogDescription>Modify case information</DialogDescription>
        </DialogHeader>
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editCaseNumber" className="text-gray-700">
                Case Number
              </Label>
              <Input
                id="editCaseNumber"
                value={editFormData.number}
                onChange={(e) => onEditFormDataChange("number", e.target.value)}
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCaseType" className="text-gray-700">
                Case Type
              </Label>
              <Select value={editFormData.type} onValueChange={(value) => onEditFormDataChange("type", value)}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200">
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="CRIMINAL">Criminal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editCaseName" className="text-gray-700">
              Case Name
            </Label>
            <Input
              id="editCaseName"
              value={editFormData.name}
              onChange={(e) => onEditFormDataChange("name", e.target.value)}
              className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editCaseStatus" className="text-gray-700">
              Status
            </Label>
            <Select value={editFormData.status} onValueChange={(value) => onEditFormDataChange("status", value)}>
              <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editCaseDescription" className="text-gray-700">
              Description
            </Label>
            <Textarea
              id="editCaseDescription"
              value={editFormData.description}
              onChange={(e) => onEditFormDataChange("description", e.target.value)}
              className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editJurorTraits" className="text-gray-700">
              Juror Traits
            </Label>
            <Textarea
              id="editJurorTraits"
              value={editFormData.jurorTraits}
              onChange={(e) => onEditFormDataChange("jurorTraits", e.target.value)}
              className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Questions</Label>
            <div className="space-y-2">
              {editFormData.questions.map((question, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={question}
                    onChange={(e) => {
                      const newQuestions = [...editFormData.questions];
                      newQuestions[index] = e.target.value;
                      onEditFormDataChange("questions", newQuestions);
                    }}
                    className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newQuestions = editFormData.questions.filter((_, i) => i !== index);
                      onEditFormDataChange("questions", newQuestions);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  onEditFormDataChange("questions", [...editFormData.questions, ""]);
                }}
                className="w-full"
              >
                Add Question
              </Button>
            </div>
          </div>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white hover:bg-gray-50">
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
