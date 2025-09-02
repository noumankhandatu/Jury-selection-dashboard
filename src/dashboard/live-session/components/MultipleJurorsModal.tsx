import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { getCaseQuestionsApi } from "@/api/api";
import { Juror } from "./JurorCard";

interface Question {
  id: string;
  question: string;
}

interface MultipleJurorsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJurors: Juror[];
  selectedCaseId?: string;
  onSubmit: (questionId: string, responseType: 'yes-no' | 'rating', responseValue: string) => void;
  onQuestionSelected?: (questionId: string) => void;
}

const MultipleJurorsModal = ({
  isOpen,
  onOpenChange,
  selectedJurors,
  selectedCaseId,
  onSubmit,
  onQuestionSelected
}: MultipleJurorsModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [responseType, setResponseType] = useState<'yes-no' | 'rating' | ''>('');
  const [yesNoChoice, setYesNoChoice] = useState<string>("");
  const [rating, setRating] = useState<string>("");

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
      setResponseType('');
      setYesNoChoice("");
      setRating("");
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
    if (!selectedQuestionId || !responseType) return;
    
    const responseValue = responseType === 'yes-no' ? yesNoChoice : rating;
    if (!responseValue) return;
    
    onSubmit(selectedQuestionId, responseType, responseValue);
    setSelectedQuestionId("");
    setResponseType('');
    setYesNoChoice("");
    setRating("");
    onOpenChange(false);
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const canSubmit = selectedQuestionId && responseType && 
    ((responseType === 'yes-no' && yesNoChoice) || (responseType === 'rating' && rating));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Question Multiple Jurors ({selectedJurors.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Selected Jurors Display */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selected Jurors</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border max-h-24 overflow-y-auto">
              {selectedJurors.map((juror) => (
                <Badge key={juror.id} variant="secondary" className="text-xs">
                  #{juror.jurorNumber}
                </Badge>
              ))}
            </div>
          </div>

          {/* Question Selection */}
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

          {/* Full Question Display */}
          {selectedQuestion && (
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
          )}

          {/* Response Type Selection */}
          {selectedQuestion && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Response Type</Label>
              <Select value={responseType} onValueChange={(value: 'yes-no' | 'rating') => {
                setResponseType(value);
                setYesNoChoice("");
                setRating("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose response type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes-no">Yes/No Response</SelectItem>
                  <SelectItem value="rating">Rating (1-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Yes/No Response */}
          {responseType === 'yes-no' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Yes/No Choice</Label>
              <Select value={yesNoChoice} onValueChange={setYesNoChoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Yes or No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rating Response */}
          {responseType === 'rating' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Rating (1-5)</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} {value === 1 ? '⭐' : value === 2 ? '⭐⭐' : value === 3 ? '⭐⭐⭐' : value === 4 ? '⭐⭐⭐⭐' : '⭐⭐⭐⭐⭐'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            disabled={!canSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleJurorsModal;
