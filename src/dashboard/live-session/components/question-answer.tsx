/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Question {
  id: string;
  text: string;
  answered: boolean;
  jurorAnswers: Record<
    number,
    {
      type: "yes-no" | "rating" | "text";
      value: any;
    }
  >;
}

export default function QuestionAnswer() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "Have you or a family member ever been treated by the defendant doctor?",
      answered: false,
      jurorAnswers: {},
    },
    {
      id: "2",
      text: "Do you have any medical training or background?",
      answered: false,
      jurorAnswers: {},
    },
    {
      id: "3",
      text: "Have you ever been involved in a medical malpractice case?",
      answered: false,
      jurorAnswers: {},
    },
    {
      id: "4",
      text: "Do you have strong feelings about the medical profession?",
      answered: false,
      jurorAnswers: {},
    },
    {
      id: "5",
      text: "Can you be impartial in evaluating medical evidence?",
      answered: false,
      jurorAnswers: {},
    },
  ]);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedJurors, setSelectedJurors] = useState<number[]>([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [currentlyAnswering, setCurrentlyAnswering] = useState<string | null>(null);

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
    console.log("Question:", selectedQuestion.text);

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
    console.log("Question:", selectedQuestion.text);

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
    console.log("Question:", selectedQuestion.text);

    updateQuestionAnswerForJurors(selectedQuestion.id, selectedJurors, answerData);
    setAnswerSubmitted(true);
    handleCloseModal();
  };

  const updateQuestionAnswerForJurors = (questionId: string, jurors: number[], answer: Question["jurorAnswers"][number]) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const updatedJurorAnswers = { ...q.jurorAnswers };
          jurors.forEach((juror) => {
            updatedJurorAnswers[juror] = answer;
          });
          return {
            ...q,
            answered: Object.keys(updatedJurorAnswers).length > 0,
            jurorAnswers: updatedJurorAnswers,
          };
        }
        return q;
      })
    );
  };

  const getAnswerDisplay = (question: Question) => {
    return "";
  };

  return (
    <div className=" mx-auto space-y-6  bg-white/80 backdrop-blur-md shadow-xl rounded-2xl ">
      <div className="space-y-2 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg ">
        <h1 className="text-2xl font-bold">Jury Selection Questionnaire</h1>
        <p>Please answer the following questions by clicking on each checkbox.</p>
      </div>

      <div className="space-y-4 p-3 pt-0">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <div
              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleQuestionClick(question)}
            >
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium leading-relaxed cursor-pointer">{question.text}</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold pr-6">{selectedQuestion?.text}</DialogTitle>
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
