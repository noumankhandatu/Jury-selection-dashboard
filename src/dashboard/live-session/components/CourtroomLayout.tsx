import { Juror } from "./JurorCard";
import JuryBox from "./JuryBox";
import JudgesBench from "./JudgesBench";
import CourtroomHeader from "./CourtroomHeader";
import SingleJurorModal from "./SingleJurorModal";
import MultipleJurorsModal from "./MultipleJurorsModal";
import { useCourtroomState } from "../hooks/useCourtroomState";

// Types
interface CourtroomLayoutProps {
  allJurors?: Juror[];
  selectedCaseId?: string;
}

// Main CourtroomLayout Component
const CourtroomLayout = ({ allJurors = [], selectedCaseId }: CourtroomLayoutProps) => {
  const {
    // State
    benchAbove,
    isMultiSelectMode,
    selectedJurors,
    selectedSingleJuror,
    singleJurorModalOpen,
    multipleJurorsModalOpen,
    
    // Setters
    setSingleJurorModalOpen,
    setMultipleJurorsModalOpen,
    
    // Handlers
    handleJurorClick,
    handleSingleJurorSubmit,
    handleMultipleJurorsSubmit,
    handleToggleMultiSelect,
    handleToggleBenchPosition,
    handleAskMultipleJurors,
  } = useCourtroomState();

  // Helper function to get jury boxes
  const getJuryBoxes = () => {
    return Array.from({ length: 6 }, (_, i) => {
      const startIndex = i * 6;
      const endIndex = startIndex + 6;
      const boxJurors = allJurors.slice(startIndex, endIndex);
      
      return (
        <JuryBox
          key={`box-${i + 1}`}
          jurors={boxJurors}
          boxNumber={i + 1}
          selectedJurors={selectedJurors}
          onJurorClick={handleJurorClick}
        />
      );
    });
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-lg h-screen overflow-auto">
      <CourtroomHeader
        isMultiSelectMode={isMultiSelectMode}
        selectedJurorsCount={selectedJurors.length}
        onToggleMultiSelect={handleToggleMultiSelect}
        onAskMultipleJurors={handleAskMultipleJurors}
        onToggleBenchPosition={handleToggleBenchPosition}
      />

      <div className="flex flex-col gap-6">
        {benchAbove && <JudgesBench />}
        <div className="grid grid-cols-2 gap-6">
          {getJuryBoxes()}
        </div>
        {!benchAbove && <JudgesBench />}
      </div>

      <SingleJurorModal
        isOpen={singleJurorModalOpen}
        onOpenChange={setSingleJurorModalOpen}
        juror={selectedSingleJuror}
        selectedCaseId={selectedCaseId}
        onSubmit={handleSingleJurorSubmit}
      />

      <MultipleJurorsModal
        isOpen={multipleJurorsModalOpen}
        onOpenChange={setMultipleJurorsModalOpen}
        selectedJurors={selectedJurors}
        selectedCaseId={selectedCaseId}
        onSubmit={handleMultipleJurorsSubmit}
      />
    </div>
  );
};

export default CourtroomLayout;
