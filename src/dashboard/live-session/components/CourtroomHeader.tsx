import { Button } from "@/components/ui/button";
import { FaRotateLeft } from "react-icons/fa6";
import { useState } from "react";
import AddQuestionModal from "./AddQuestionModal";

interface CourtroomHeaderProps {
  selectedCaseId?: string;
  selectedCase?: any;
  allJurors?: any[];
  onAskMultipleJurors: () => void;
  onToggleBenchPosition: () => void;
  onQuestionsAdded?: () => void;
}

const CourtroomHeader = ({
  selectedCaseId,
  selectedCase,
  allJurors = [],
  onAskMultipleJurors,
  onToggleBenchPosition,
  onQuestionsAdded,
}: CourtroomHeaderProps) => {
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

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
          onClick={() => setIsAddQuestionModalOpen(true)}
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
