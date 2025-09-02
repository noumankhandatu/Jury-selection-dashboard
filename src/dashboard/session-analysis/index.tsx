//
import { motion } from "framer-motion";
import TitleTag from "@/components/shared/tag/tag";
import { itemVariants } from "@/utils/fn";
import { Selectors } from "./components/Selectors";
import { useSessionAnalysis } from "./hooks/useSessionAnalysis";
import { JurorResponses } from "./components/JurorResponses";

//

const SessionAnalysisPage = () => {
  const {
    cases,
    selectedCase,
    setSelectedCase,
    sessions,
    selectedSession,
    setSelectedSession,
    sessionDetail,
    sessionStats,
    selectedResponseId,
    setSelectedResponseId,
    isLoading,
    error,
  } = useSessionAnalysis();

  // data fetching moved to useSessionAnalysis hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div className="mx-auto space-y-6" initial="hidden" animate="visible" variants={itemVariants}>
        <TitleTag title="Session Analysis" />
        <Selectors
          cases={cases}
          selectedCase={selectedCase}
          onCaseSelect={setSelectedCase}
          sessions={sessions}
          selectedSession={selectedSession}
          onSessionSelect={setSelectedSession}
          isLoading={isLoading}
          error={error}
        />
        {selectedCase && selectedSession && (
          <div className="space-y-6">
            <JurorResponses
              session={sessionDetail}
              sessionStats={sessionStats}
              onSelectResponse={setSelectedResponseId}
              selectedResponseId={selectedResponseId}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SessionAnalysisPage;