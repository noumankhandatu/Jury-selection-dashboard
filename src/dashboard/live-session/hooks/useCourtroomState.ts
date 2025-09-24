import { useState } from "react";
import { CaseJuror } from "../components/JurorCard";

export const useCourtroomState = (onRefreshSessionData?: () => void) => {
  // UI State
  const [benchAbove, setBenchAbove] = useState(false);

  // Modal State
  const [singleJurorModalOpen, setSingleJurorModalOpen] = useState(false);
  const [multipleJurorsModalOpen, setMultipleJurorsModalOpen] = useState(false);

  // Selection State
  const [selectedSingleJuror, setSelectedSingleJuror] =
    useState<CaseJuror | null>(null);

  // Form State - removed individual state as it's now managed within the modal

  // Event Handlers
  const handleJurorClick = (juror: CaseJuror) => {
    setSelectedSingleJuror(juror);
    setSingleJurorModalOpen(true);
  };

  const handleSingleJurorSubmit = (questionId: string, answer: string) => {
    console.log("Single Juror Answer:", {
      juror: selectedSingleJuror,
      questionId,
      answer,
    });

    // Refresh session data after submission
    if (onRefreshSessionData) {
      onRefreshSessionData();
    }
  };

  const handleToggleBenchPosition = () => {
    setBenchAbove((prev) => !prev);
  };

  const handleAskMultipleJurors = () => {
    setMultipleJurorsModalOpen(true);
  };

  return {
    // State
    benchAbove,
    selectedSingleJuror,
    singleJurorModalOpen,
    multipleJurorsModalOpen,

    // Setters
    setSingleJurorModalOpen,
    setMultipleJurorsModalOpen,

    // Handlers
    handleJurorClick,
    handleSingleJurorSubmit,
    handleToggleBenchPosition,
    handleAskMultipleJurors,
  };
};
