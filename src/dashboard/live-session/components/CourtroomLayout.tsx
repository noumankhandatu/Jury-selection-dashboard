import { CaseJuror } from "./JurorCard";
import JuryBox from "./JuryBox";
import JudgesBench from "./JudgesBench";
import CourtroomHeader from "./CourtroomHeader";
import SingleJurorModal from "./SingleJurorModal";
import MultipleJurorsModal from "./MultipleJurorsModal";
import { useCourtroomState } from "../hooks/useCourtroomState";
import {
  assignQuestionsToJurorsApi,
  saveJurorResponseApi,
  assessResponseApi,
  getSessionScoresApi,
} from "@/api/api";
import { useEffect, useState } from "react";

// Types
interface CourtroomLayoutProps {
  allJurors?: CaseJuror[];
  selectedCaseId?: string;
  selectedCase?: any;
  sessionId?: string;
  onRefreshSessionData?: () => void;
}

// Main CourtroomLayout Component
const CourtroomLayout = ({
  allJurors = [],
  selectedCaseId,
  selectedCase,
  sessionId,
  onRefreshSessionData,
}: CourtroomLayoutProps) => {
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
  } = useCourtroomState(onRefreshSessionData);

  const [scoresByJurorId, setScoresByJurorId] = useState<
    Record<string, { overallScore?: number }>
  >({});
  const [waitingJurors, setWaitingJurors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchScores = async () => {
      if (!sessionId) return;
      try {
        const res = await getSessionScoresApi(sessionId);
        const arr = res?.scores || [];
        const mapped: Record<string, any> = {};
        arr.forEach((s: any) => {
          if (s?.jurorId) {
            mapped[s.jurorId] = { overallScore: s.overallScore };
          }
        });
        setScoresByJurorId(mapped);
      } catch (e) {
        console.error("Failed to fetch session scores", e);
      }
    };
    fetchScores();
  }, [sessionId]);

  const onSubmitSingle = async (questionId: string, _answer: string) => {
    handleSingleJurorSubmit(questionId, _answer);
    if (!sessionId || !selectedSingleJuror?.id) return;

    // Add juror to waiting state
    setWaitingJurors((prev) => new Set(prev).add(selectedSingleJuror.id));

    try {
      const saved = await saveJurorResponseApi({
        sessionId,
        questionId,
        jurorId: selectedSingleJuror.id,
        response: _answer,
        responseType: "TEXT",
      });
      const responseId = saved?.response?.id;
      if (responseId) {
        await assessResponseApi(responseId);
        const scores = await getSessionScoresApi(sessionId);
        const arr = scores?.scores || [];
        setScoresByJurorId((prev) => {
          const updated = { ...prev } as Record<string, any>;
          arr.forEach((s: any) => {
            if (s?.jurorId) {
              updated[s.jurorId] = { overallScore: s.overallScore };
            }
          });
          return updated;
        });
      }

      // Refresh session data after successful submission
      if (onRefreshSessionData) {
        onRefreshSessionData();
      }
    } catch (err) {
      console.error("Failed to save response for single juror", err);
    } finally {
      // Remove juror from waiting state
      setWaitingJurors((prev) => {
        const updated = new Set(prev);
        updated.delete(selectedSingleJuror.id);
        return updated;
      });
    }
  };

  const onSubmitMultiple = async (
    questionId: string,
    responseType: "yes-no" | "rating",
    responseValue: string
  ) => {
    handleMultipleJurorsSubmit(questionId, responseType, responseValue);
    if (!sessionId || selectedJurors.length === 0) return;
    const mappedType = responseType === "yes-no" ? "YES_NO" : "RATING";

    // Add all selected jurors to waiting state
    const jurorIds = selectedJurors.map((j) => j.id);
    setWaitingJurors((prev) => {
      const updated = new Set(prev);
      jurorIds.forEach((id) => updated.add(id));
      return updated;
    });

    try {
      const saveResults = await Promise.all(
        selectedJurors.map((j) =>
          saveJurorResponseApi({
            sessionId,
            questionId,
            jurorId: j.id,
            response: responseValue,
            responseType: mappedType,
          })
        )
      );
      const responses = saveResults.map((r) => r?.response).filter(Boolean);
      await Promise.all(responses.map((r: any) => assessResponseApi(r.id)));
      const scores = await getSessionScoresApi(sessionId);
      const arr = scores?.scores || [];
      setScoresByJurorId((prev) => {
        const updated = { ...prev } as Record<string, any>;
        arr.forEach((s: any) => {
          if (s?.jurorId) {
            updated[s.jurorId] = { overallScore: s.overallScore };
          }
        });
        return updated;
      });

      // Refresh session data after successful submission
      if (onRefreshSessionData) {
        onRefreshSessionData();
      }
    } catch (err) {
      console.error("Failed to save responses for multiple jurors", err);
    } finally {
      // Remove all selected jurors from waiting state
      setWaitingJurors((prev) => {
        const updated = new Set(prev);
        jurorIds.forEach((id) => updated.delete(id));
        return updated;
      });
    }
  };

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
          scoresByJurorId={scoresByJurorId}
          waitingJurors={waitingJurors}
        />
      );
    }).filter(Boolean); // Remove null entries
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-lg h-screen overflow-auto">
      <CourtroomHeader
        isMultiSelectMode={isMultiSelectMode}
        selectedJurorsCount={selectedJurors.length}
        selectedCaseId={selectedCaseId}
        selectedCase={selectedCase}
        onToggleMultiSelect={handleToggleMultiSelect}
        onAskMultipleJurors={handleAskMultipleJurors}
        onToggleBenchPosition={handleToggleBenchPosition}
        onQuestionsAdded={onRefreshSessionData}
      />

      <div className="flex flex-col gap-6">
        {benchAbove && <JudgesBench />}
        {allJurors.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg text-gray-600">No jurors available</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: Math.ceil(allJurors.length / 6) }, (_, i) => {
              const startIndex = i * 6;
              const endIndex = startIndex + 6;
              const boxJurors = allJurors.slice(startIndex, endIndex);
              if (boxJurors.length === 0) return null;
              return (
                <JuryBox
                  key={`box-${i + 1}`}
                  jurors={boxJurors}
                  boxNumber={i + 1}
                  selectedJurors={selectedJurors}
                  onJurorClick={handleJurorClick}
                  scoresByJurorId={scoresByJurorId}
                  waitingJurors={waitingJurors}
                />
              );
            }).filter(Boolean)}
          </div>
        )}
        {!benchAbove && <JudgesBench />}
      </div>

      <SingleJurorModal
        isOpen={singleJurorModalOpen}
        onOpenChange={setSingleJurorModalOpen}
        juror={selectedSingleJuror}
        selectedCaseId={selectedCaseId}
        onSubmit={onSubmitSingle}
        onQuestionSelected={async (questionId: string) => {
          if (!sessionId || !selectedSingleJuror?.id) return;
          try {
            await assignQuestionsToJurorsApi({
              sessionId,
              assignments: [
                {
                  questionId,
                  jurorIds: [selectedSingleJuror.id],
                },
              ],
            });
          } catch (err) {
            console.error(
              "Failed to assign question on selection (single)",
              err
            );
          }
        }}
      />

      <MultipleJurorsModal
        isOpen={multipleJurorsModalOpen}
        onOpenChange={setMultipleJurorsModalOpen}
        selectedJurors={selectedJurors}
        selectedCaseId={selectedCaseId}
        onSubmit={onSubmitMultiple}
        onQuestionSelected={async (questionId: string) => {
          if (!sessionId || selectedJurors.length === 0) return;
          try {
            await assignQuestionsToJurorsApi({
              sessionId,
              assignments: [
                {
                  questionId,
                  jurorIds: selectedJurors.map((j) => j.id),
                },
              ],
            });
          } catch (err) {
            console.error(
              "Failed to assign question on selection (multiple)",
              err
            );
          }
        }}
      />
    </div>
  );
};

export default CourtroomLayout;
