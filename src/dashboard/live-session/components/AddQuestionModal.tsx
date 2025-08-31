import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createQuestionApi } from "@/api/api";

interface AddQuestionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCaseId?: string;
}

const AddQuestionModal = ({
  isOpen,
  onOpenChange,
  selectedCaseId
}: AddQuestionModalProps) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim() || !selectedCaseId) return;
    
    try {
      setLoading(true);
      await createQuestionApi(selectedCaseId, {
        question: question.trim(),
        questionType: "TEXT",
        isRequired: false,
        order: 1
      });
      
      // Reset form and close modal
      setQuestion("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestByAI = () => {
    // TODO: Implement AI question suggestion functionality
    console.log("AI suggestion functionality to be implemented");
  };

  const handleClose = () => {
    setQuestion("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add New Question
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="question-input" className="text-sm font-medium">
              Question
            </Label>
            <Textarea
              id="question-input"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleSuggestByAI}
              className="text-sm"
            >
              Suggest Question by AI
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
          >
            {loading ? "Creating..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionModal;
