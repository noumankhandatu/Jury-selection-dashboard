import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCaseQuestionsApi } from "@/api/api";
import { CaseJuror } from "./JurorCard";

interface Question {
  id: string;
  question: string;
}

interface SingleJurorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  juror: CaseJuror | null;
  selectedCaseId?: string;
  onSubmit: (questionId: string, answer: string) => void;
  onQuestionSelected?: (questionId: string) => void;
}

const SingleJurorModal = ({
  isOpen,
  onOpenChange,
  juror,
  selectedCaseId,
  onSubmit,
  onQuestionSelected
}: SingleJurorModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [answer, setAnswer] = useState("");

  // Fetch questions when modal opens and caseId is available
  useEffect(() => {
    if (isOpen && selectedCaseId) {
      fetchQuestions();
    }
  }, [isOpen, selectedCaseId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuestionId("");
      setAnswer("");
    }
  }, [isOpen]);

  const fetchQuestions = async () => {
    if (!selectedCaseId) return;
    
    try {
      setLoading(true);
      const response = await getCaseQuestionsApi(selectedCaseId);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedQuestionId || !answer.trim()) return;
    
    onSubmit(selectedQuestionId, answer.trim());
    setSelectedQuestionId("");
    setAnswer("");
    onOpenChange(false);
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Question Juror: #{juror?.jurorNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="question-select" className="text-sm font-medium">
              Select Question
            </Label>
            <Select 
              value={selectedQuestionId} 
              onValueChange={(value) => {
                setSelectedQuestionId(value);
                if (value && onQuestionSelected) onQuestionSelected(value);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-auto min-h-[40px] py-2">
                <SelectValue 
                  placeholder={loading ? "Loading questions..." : "Choose a question to ask"}
                  className="text-left"
                >
                  {selectedQuestion && (
                    <div className="truncate max-w-[450px] text-left" title={selectedQuestion.question}>
                      {selectedQuestion.question}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-[550px]">
                {questions.length === 0 && !loading ? (
                  <SelectItem value="" disabled>
                    No questions available
                  </SelectItem>
                ) : (
                  questions.map((question) => (
                    <SelectItem 
                      key={question.id} 
                      value={question.id}
                      className="max-w-[520px] py-3 px-3"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="truncate max-w-[480px] font-medium" title={question.question}>
                          {question.question}
                        </div>
                        {question.question.length > 60 && (
                          <div className="text-xs text-muted-foreground">
                            Click to see full question
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedQuestion && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Selected Question
                </Label>
                <div className="p-3 bg-muted/50 rounded-md border">
                  <p className="text-sm leading-relaxed">
                    {selectedQuestion.question}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="answer-input" className="text-sm font-medium">
                  Answer
                </Label>
                <Input
                  id="answer-input"
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedQuestionId || !answer.trim()}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SingleJurorModal;
