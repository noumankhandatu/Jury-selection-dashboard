import { Button } from "@/components/ui/button";
import { FaRotateLeft } from "react-icons/fa6";
import { useState } from "react";
import { AddQuestionDialog } from "@/dashboard/create-case/components/add-question-dialog";
import { Question } from "@/types/questions";

interface CourtroomHeaderProps {
  selectedCaseId?: string;
  selectedCase?: any;
  allJurors?: any[];
  onAskMultipleJurors: () => void;
  onToggleBenchPosition: () => void;
  onQuestionsAdded?: (questions: Question[]) => void;
}

const CourtroomHeader = ({
  selectedCaseId,
  selectedCase,
  allJurors = [],
  onAskMultipleJurors,
  onToggleBenchPosition,
  onQuestionsAdded,
}: CourtroomHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<{
    question: Question;
    index: number;
  } | null>(null);

  const handleAddQuestion = (question: Question) => {
    const newQuestions = [...questions, question];
    setQuestions(newQuestions);
    onQuestionsAdded?.(newQuestions);
  };

  const handleEditQuestion = (editedQuestion: Question, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = editedQuestion;
    setQuestions(updatedQuestions);
    onQuestionsAdded?.(updatedQuestions);
  };

  const handleOpenDialog = () => {
    setEditingQuestion(null); // Reset editing state when opening for new question
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null); // Clear editing state when closing
  };

  // Calculate dynamic values
  const totalJurors = allJurors.length;
  const seatsPerBox = 6;
  const totalBoxes = Math.ceil(totalJurors / seatsPerBox);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          U.S. Courtroom Jury Box Layout
        </h2>
        {totalJurors > 0 && (
          <p className="text-sm text-gray-600">
            {totalJurors} Juror{totalJurors !== 1 ? "s" : ""} • {totalBoxes} Box{totalBoxes !== 1 ? "es" : ""} • {seatsPerBox} Seats per Box
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          onClick={handleOpenDialog}
          className="text-sm"
          disabled={!selectedCaseId}
        >
          Add Question
        </Button>
        <Button
          variant="default"
          onClick={onAskMultipleJurors}
          className="text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0"
          disabled={!selectedCaseId}
        >
          Select Multiple jurors
        </Button>
        <button
          type="button"
          onClick={onToggleBenchPosition}
          className="p-2 rounded hover:bg-gray-200 transition"
          aria-label="Toggle Judge's Bench Position"
        >
          <FaRotateLeft />
        </button>
      </div>

      <AddQuestionDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default CourtroomHeader;