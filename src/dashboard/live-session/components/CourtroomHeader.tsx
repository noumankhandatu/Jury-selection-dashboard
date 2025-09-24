import { Button } from "@/components/ui/button";
import { FaRotateLeft } from "react-icons/fa6";
import { useState } from "react";
import AddQuestionModal from "./AddQuestionModal";

interface CourtroomHeaderProps {
  selectedCaseId?: string;
  selectedCase?: any;
  onAskMultipleJurors: () => void;
  onToggleBenchPosition: () => void;
  onQuestionsAdded?: () => void;
}

const CourtroomHeader = ({
  selectedCaseId,
  selectedCase,
  onAskMultipleJurors,
  onToggleBenchPosition,
  onQuestionsAdded,
}: CourtroomHeaderProps) => {
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          U.S. Courtroom Jury Box Layout
        </h2>
        <p className="text-sm text-gray-600">
          36 Jurors • 6 Boxes • 6 Seats per Box
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsAddQuestionModalOpen(true)}
          className="text-sm"
          disabled={!selectedCaseId}
        >
          Add Question
        </Button>
        <Button
          variant="outline"
          onClick={onAskMultipleJurors}
          className="text-sm"
          disabled={!selectedCaseId}
        >
          Ask multiple Juror
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

      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onOpenChange={setIsAddQuestionModalOpen}
        selectedCaseId={selectedCaseId}
        selectedCase={selectedCase}
        onQuestionsAdded={onQuestionsAdded}
      />
    </div>
  );
};

export default CourtroomHeader;
