import { useState } from "react";
import { CaseJuror } from "../components/JurorCard";

export const useCourtroomState = (onRefreshSessionData?: () => void) => {
  // UI State
  const [benchAbove, setBenchAbove] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // Modal State
  const [singleJurorModalOpen, setSingleJurorModalOpen] = useState(false);
  const [multipleJurorsModalOpen, setMultipleJurorsModalOpen] = useState(false);
  
  // Selection State
  const [selectedJurors, setSelectedJurors] = useState<CaseJuror[]>([]);
  const [selectedSingleJuror, setSelectedSingleJuror] = useState<CaseJuror | null>(null);
  
  // Form State - removed individual state as it's now managed within the modal

  // Event Handlers
  const handleJurorClick = (juror: CaseJuror) => {
    if (isMultiSelectMode) {
      setSelectedJurors(prev => 
        prev.find(j => j.id === juror.id) 
          ? prev.filter(j => j.id !== juror.id)
          : [...prev, juror]
      );
    } else {
      setSelectedSingleJuror(juror);
      setSingleJurorModalOpen(true);
    }
  };

  const handleSingleJurorSubmit = (questionId: string, answer: string) => {
    console.log("Single Juror Answer:", {
      juror: selectedSingleJuror,
      questionId,
      answer
    });
    
    // Refresh session data after submission
    if (onRefreshSessionData) {
      onRefreshSessionData();
    }
  };

  const handleMultipleJurorsSubmit = (questionId: string, responseType: 'yes-no' | 'rating', responseValue: string) => {
    console.log("Multiple Jurors Answer:", {
      jurors: selectedJurors,
      questionId,
      responseType,
      responseValue
    });
    
    // Refresh session data after submission
    if (onRefreshSessionData) {
      onRefreshSessionData();
    }
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedJurors([]);
    }
  };

  const handleToggleBenchPosition = () => {
    setBenchAbove(prev => !prev);
  };

  const handleAskMultipleJurors = () => {
    setMultipleJurorsModalOpen(true);
  };

  return {
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
  };
};
