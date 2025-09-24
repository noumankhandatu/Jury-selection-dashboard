import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  assignQuestionsToJurorsApi,
  assessResponseApi,
  getCaseQuestionsApi,
  saveJurorResponseApi,
} from "@/api/api";
import JurorCard, { CaseJuror } from "./JurorCard";

interface Question {
  id: string;
  question: string;
}

interface MultipleJurorsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allJurors?: CaseJuror[];
  selectedCaseId?: string;
  sessionId?: string;
  onRequestScoresRefresh?: () => void;
  onAssessmentStart?: (jurorIds: string[]) => void;
  onAssessmentEnd?: (jurorIds: string[]) => void;
}

const MultipleJurorsModal = ({
  isOpen,
  onOpenChange,
  allJurors = [],
  selectedCaseId,
  sessionId,
  onRequestScoresRefresh,
  onAssessmentStart,
  onAssessmentEnd,
}: MultipleJurorsModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [responseType, setResponseType] = useState<"yes-no" | "rating" | "">(
    ""
  );
  const [yesNoChoice, setYesNoChoice] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [selectedJurorIds, setSelectedJurorIds] = useState<Set<string>>(
    new Set()
  );
  const [pendingJurorIds, setPendingJurorIds] = useState<Set<string>>(
    new Set()
  );

  const fetchQuestions = useCallback(async () => {
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
  }, [selectedCaseId]);

  // Fetch questions when modal opens and caseId is available
  useEffect(() => {
    if (isOpen && selectedCaseId) {
      fetchQuestions();
    }
  }, [isOpen, selectedCaseId, fetchQuestions]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedQuestionId("");
      setResponseType("");
      setYesNoChoice("");
      setRating("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!sessionId || !selectedQuestionId || !responseType) return;
    const responseValue = responseType === "yes-no" ? yesNoChoice : rating;
    if (!responseValue || selectedJurorIds.size === 0) return;

    try {
      setLoading(true);
      if (onAssessmentStart) {
        onAssessmentStart(Array.from(selectedJurorIds));
      }
      // 1) Assign the question to all selected jurors in one request
      await assignQuestionsToJurorsApi({
        sessionId,
        assignments: [
          {
            questionId: selectedQuestionId,
            jurorIds: Array.from(selectedJurorIds),
          },
        ],
      });

      // 2) Save responses for each selected juror
      const mappedType = responseType === "yes-no" ? "YES_NO" : "RATING";
      const responseIds: string[] = [];
      for (const jurorId of selectedJurorIds) {
        const saved = await saveJurorResponseApi({
          sessionId,
          questionId: selectedQuestionId,
          jurorId,
          response: responseValue,
          responseType: mappedType,
        });
        const responseId = saved?.response?.id;
        if (responseId) responseIds.push(responseId);
      }

      // 3) Close modal before running assessments
      onOpenChange(false);

      // 4) Assess all saved responses
      for (const rid of responseIds) {
        await assessResponseApi(rid);
      }

      if (onRequestScoresRefresh) {
        await onRequestScoresRefresh();
      }
      if (onAssessmentEnd) {
        onAssessmentEnd(Array.from(selectedJurorIds));
      }
    } catch (error) {
      console.error("Failed to submit assignments/responses", error);
    } finally {
      setLoading(false);
      // Reset form state
      setSelectedQuestionId("");
      setResponseType("");
      setYesNoChoice("");
      setRating("");
      setSelectedJurorIds(new Set());
      setPendingJurorIds(new Set());
    }
  };

  const handleJurorToggle = async (juror: CaseJuror) => {
    if (!selectedQuestionId || !responseType) return;
    const responseValue = responseType === "yes-no" ? yesNoChoice : rating;
    if (!responseValue) return;

    const isSelected = selectedJurorIds.has(juror.id);
    setSelectedJurorIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(juror.id);
      else next.add(juror.id);
      return next;
    });
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);
  const canProceedToJurors =
    selectedQuestionId &&
    responseType &&
    ((responseType === "yes-no" && yesNoChoice) ||
      (responseType === "rating" && rating));
  const canSubmit = canProceedToJurors && selectedJurorIds.size > 0;
  // Utility to split jurors into boxes of 6 (3 columns x 2 rows)
  const jurorBoxes: CaseJuror[][] = [];
  (allJurors || []).forEach((juror, index) => {
    const boxIndex = Math.floor(index / 6);
    if (!jurorBoxes[boxIndex]) jurorBoxes[boxIndex] = [];
    jurorBoxes[boxIndex].push(juror);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ask multiple Juror
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Question Selection */}
          <div className="space-y-3">
            <Label htmlFor="question-select" className="text-sm font-medium">
              Select Question
            </Label>
            <Select
              value={selectedQuestionId}
              onValueChange={(value) => {
                setSelectedQuestionId(value);
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-auto min-h-[40px] py-2">
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading questions..."
                      : "Choose a question to ask"
                  }
                  className="text-left"
                >
                  {selectedQuestion && (
                    <div
                      className="truncate max-w-[450px] text-left"
                      title={selectedQuestion.question}
                    >
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
                        <div
                          className="truncate max-w-[480px] font-medium"
                          title={question.question}
                        >
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
              <Label className="text-sm font-medium">Selected Question</Label>
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
              <Select
                value={responseType}
                onValueChange={(value: "yes-no" | "rating") => {
                  setResponseType(value);
                  setYesNoChoice("");
                  setRating("");
                }}
              >
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
          {responseType === "yes-no" && (
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
          {responseType === "rating" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Rating (1-5)</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}{" "}
                      {value === 1
                        ? "⭐"
                        : value === 2
                        ? "⭐⭐"
                        : value === 3
                        ? "⭐⭐⭐"
                        : value === 4
                        ? "⭐⭐⭐⭐"
                        : "⭐⭐⭐⭐⭐"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Boxes of jurors: each box has 3 columns x 2 rows (6 jurors) */}
          {canProceedToJurors && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Jurors</Label>
              <div className="max-h-[420px] overflow-auto pr-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jurorBoxes.map((boxJurors, boxIdx) => {
                  const columns: CaseJuror[][] = [
                    boxJurors.slice(0, 2),
                    boxJurors.slice(2, 4),
                    boxJurors.slice(4, 6),
                  ];
                  return (
                    <div key={boxIdx} className="border rounded-lg bg-white/70">
                      <div className="px-3 py-2 border-b bg-muted/40 text-xs font-semibold rounded-t-lg w-fit ml-3 mt-2">
                        {`Box ${boxIdx + 1}`}
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-3">
                          {columns.map((col, colIdx) => (
                            <div
                              key={colIdx}
                              className="grid grid-rows-2 gap-3"
                            >
                              {col.map((juror) => {
                                const isSelected = selectedJurorIds.has(
                                  juror.id
                                );
                                const isPending = pendingJurorIds.has(juror.id);
                                return (
                                  <div
                                    key={juror.id}
                                    className={
                                      isPending
                                        ? "opacity-60 pointer-events-none"
                                        : ""
                                    }
                                  >
                                    <JurorCard
                                      juror={juror}
                                      isSelected={isSelected}
                                      onClick={() => handleJurorToggle(juror)}
                                      showAvatar={false}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Select jurors now. Assignments and responses will be saved on
                Submit, then assessments will run.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultipleJurorsModal;
