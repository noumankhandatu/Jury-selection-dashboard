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

  // Helper function to get dynamic jury boxes
  const getJuryBoxes = () => {
    const jurorsPerBox = 6;
    const totalBoxes = Math.ceil(allJurors.length / jurorsPerBox);
    
    // Only create boxes that have jurors
    return Array.from({ length: totalBoxes }, (_, i) => {
      const startIndex = i * jurorsPerBox;
      const endIndex = startIndex + jurorsPerBox;
      const boxJurors = allJurors.slice(startIndex, endIndex);
      
      // Only render box if it has jurors
      if (boxJurors.length === 0) return null;
      
      return (
        <JuryBox
          key={`box-${i + 1}`}
          jurors={boxJurors}
          boxNumber={i + 1}
          selectedJurors={selectedJurors}
          onJurorClick={handleJurorClick}
        />
      );
    }).filter(Boolean); // Remove null entries
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
        {allJurors.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-gray-600">No jurors available</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getJuryBoxes()}
          </div>
        )}
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
