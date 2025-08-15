/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddQuestionAI from "./AddQuestionAI";
import { getCaseQuestionsApi } from "@/api/api";

interface Question {
  id: string;
  question: string;
}

export default function QuestionAnswer({ selectedCase }: any) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedJurors, setSelectedJurors] = useState<number[]>([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  console.log(selectedCase, "selectedCase");

  // Fetch questions when component mounts
  useEffect(() => {
    fetchQuestions();
  }, [selectedCase]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const caseId = selectedCase?.id;
      if (!caseId) {
        setQuestions([]);
        return;
      }
      const response = await getCaseQuestionsApi(caseId);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
    setTextAnswer("");
    setSelectedRating(null);
    setAnswerSubmitted(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setTextAnswer("");
    setSelectedRating(null);
    setSelectedJurors([]);
    setAnswerSubmitted(false);
  };

  const handleJurorToggle = (jurorNumber: number) => {
    setSelectedJurors((prev) => (prev.includes(jurorNumber) ? prev.filter((j) => j !== jurorNumber) : [...prev, jurorNumber]));
  };

  const handleSelectAllJurors = () => {
    setSelectedJurors(Array.from({ length: 60 }, (_, i) => i + 1));
  };

  const handleClearJurors = () => {
    setSelectedJurors([]);
  };

  const handleYesNoAnswer = (answer: "yes" | "no") => {
    if (!selectedQuestion || selectedJurors.length === 0) return;

    const answerData = {
      type: "yes-no" as const,
      value: answer,
    };

    console.log("Selected Jurors:", selectedJurors);
    console.log("Answer:", answer);
    console.log("Question:", selectedQuestion.question);

    updateQuestionAnswerForJurors(selectedQuestion.id, selectedJurors, answerData);
    setAnswerSubmitted(true);
    handleCloseModal();
  };

  const handleRatingAnswer = (rating: number) => {
    setSelectedRating(rating);
    if (!selectedQuestion || selectedJurors.length === 0) return;

    const answerData = {
      type: "rating" as const,
      value: rating,
    };

    console.log("Selected Jurors:", selectedJurors);
    console.log("Rating:", rating);
    console.log("Question:", selectedQuestion.question);

    updateQuestionAnswerForJurors(selectedQuestion.id, selectedJurors, answerData);
    setAnswerSubmitted(true);
    handleCloseModal();
  };

  const handleTextAnswer = () => {
    if (!selectedQuestion || !textAnswer.trim() || selectedJurors.length === 0) return;

    const answerData = {
      type: "text" as const,
      value: textAnswer,
    };

    console.log("Selected Jurors:", selectedJurors);
    console.log("Text Answer:", textAnswer);
    console.log("Question:", selectedQuestion.question);

    updateQuestionAnswerForJurors(selectedQuestion.id, selectedJurors, answerData);
    setAnswerSubmitted(true);
    handleCloseModal();
  };

  const updateQuestionAnswerForJurors = (questionId: string, jurors: number[], answer: any) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            answered: true,
          };
        }
        return q;
      })
    );
  };

  const getAnswerDisplay = (question: Question) => {
    return "";
  };

  if (loading) {
    return (
      <div className="mx-auto space-y-6 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
        <div className="space-y-2 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Jury Selection Questionnaire</h1>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-500">Loading questions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl">
      <div className="space-y-2 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <h1 className="text-2xl font-bold">Jury Selection Questionnaire</h1>
        <p className="text-blue-100">Case Questions</p>
      </div>

      <div className="space-y-4 p-3 pt-0 h-[400px] overflow-y-scroll">
        {questions.length > 0 ? (
          questions.map((question, i) => (
            <div key={question.id} className="space-y-2">
              <div
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="flex-1 space-y-1 items-center">
                  {i + 1} : <Label className="text-sm font-medium leading-relaxed cursor-pointer capitalize">{question.question}</Label>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No questions available</p>
            <p className="text-sm text-gray-400 mt-1">Questions will appear here once they are added to the case</p>
          </div>
        )}
      </div>
      {/* AddQuestionAI component was removed from imports, so it's removed here */}
      <AddQuestionAI />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold pr-6">{selectedQuestion?.question}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Juror Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Jurors (1-60)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAllJurors}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearJurors}>
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto border rounded-md p-2">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((jurorNumber) => (
                  <Button
                    key={jurorNumber}
                    variant={selectedJurors.includes(jurorNumber) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleJurorToggle(jurorNumber)}
                    className="h-8 w-8 text-xs"
                  >
                    {jurorNumber}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {selectedJurors.length} juror{selectedJurors.length !== 1 ? "s" : ""}
                {selectedJurors.length > 0 && ` (${selectedJurors.sort((a, b) => a - b).join(", ")})`}
              </p>
            </div>

            <div className="border-t pt-4">
              {/* Yes/No Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Yes/No Response</Label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleYesNoAnswer("yes")} className="flex-1" disabled={selectedJurors.length === 0}>
                    Yes
                  </Button>
                  <Button variant="outline" onClick={() => handleYesNoAnswer("no")} className="flex-1" disabled={selectedJurors.length === 0}>
                    No
                  </Button>
                </div>
              </div>

              {/* Rating System */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={selectedRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRatingAnswer(rating)}
                      className="w-10 h-10"
                      disabled={selectedJurors.length === 0}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Written Response</Label>
                <div className="space-y-2">
                  <textarea
                    placeholder="Type your answer here..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="w-full min-h-[100px] p-3 border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    rows={4}
                  />
                  <Button onClick={handleTextAnswer} disabled={!textAnswer.trim() || selectedJurors.length === 0} className="w-full">
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
