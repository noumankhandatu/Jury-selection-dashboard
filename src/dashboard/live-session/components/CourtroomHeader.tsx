import { Button } from "@/components/ui/button";
import { FaRotateLeft } from "react-icons/fa6";
import { useState } from "react";
import AddQuestionModal from "./AddQuestionModal";

interface CourtroomHeaderProps {
  isMultiSelectMode: boolean;
  selectedJurorsCount: number;
  selectedCaseId?: string;
  onToggleMultiSelect: () => void;
  onAskMultipleJurors: () => void;
  onToggleBenchPosition: () => void;
}

const CourtroomHeader = ({ 
  isMultiSelectMode, 
  selectedJurorsCount, 
  selectedCaseId,
  onToggleMultiSelect, 
  onAskMultipleJurors, 
  onToggleBenchPosition 
}: CourtroomHeaderProps) => {
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  return (
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-xl font-bold text-gray-900">U.S. Courtroom Jury Box Layout</h2>
      <p className="text-sm text-gray-600">36 Jurors • 6 Boxes • 6 Seats per Box</p>
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
        variant={isMultiSelectMode ? "default" : "outline"}
        onClick={onToggleMultiSelect}
        className="text-sm"
      >
        {isMultiSelectMode ? "Exit Multi-Select" : "Select Multiple Jurors"}
      </Button>
      {isMultiSelectMode && selectedJurorsCount > 0 && (
        <Button
          onClick={onAskMultipleJurors}
          className="text-sm"
        >
          Ask ({selectedJurorsCount})
        </Button>
      )}
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
    />
  </div>
  );
};

export default CourtroomHeader;
