//
import { motion } from "framer-motion";
import TitleTag from "@/components/shared/tag/tag";
import { itemVariants } from "@/utils/fn";
import { Selectors } from "./components/Selectors";
import { useSessionAnalysis } from "./hooks/useSessionAnalysis";
import { JurorResponses } from "./components/JurorResponses";
import { BestJurorsGrid } from "./components/BestJurorsGrid";
import SessionOverview from "./components/SessionOverview";

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
    bestJurors,
    fetchBestJurors,
    selectedResponseId,
    setSelectedResponseId,
    isLoading,
    error,
  } = useSessionAnalysis();

  // data fetching moved to useSessionAnalysis hook

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div
        className="mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={itemVariants}
      >
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
            <SessionOverview
              sessionStats={sessionStats}
              onBucketClick={(bucket) => {
                if (bucket === "low") return fetchBestJurors(0, 59);
                if (bucket === "mid") return fetchBestJurors(60, 79);
                if (bucket === "high") return fetchBestJurors(80);
              }}
            />
            {/* New Matched Jurors card above Top Jurors */}
            {Array.isArray(bestJurors) && (
              <BestJurorsGrid session={sessionDetail} bestJurors={bestJurors} />
            )}

            <JurorResponses
              session={sessionDetail}
              sessionStats={sessionStats}
              onSelectResponse={setSelectedResponseId}
              selectedResponseId={selectedResponseId}
            />
            {Array.isArray(bestJurors) && bestJurors.length > 0 && (
              <div className="space-y-3">
                <div className="text-base font-semibold">Matched Jurors</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bestJurors.map(
                    (bj: {
                      id: string;
                      juror?: { name?: string; jurorNumber?: string };
                      overallScore?: number;
                      averageScore?: number;
                      questionCount?: number;
                    }) => (
                      <div
                        key={bj.id}
                        className="rounded-lg border bg-white shadow"
                      >
                        <div className="p-4">
                          <div className="font-semibold text-gray-900">
                            {bj.juror?.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            #{bj.juror?.jurorNumber}
                          </div>
                          <div className="mt-2 text-sm">
                            Overall:{" "}
                            <span className="font-semibold">
                              {Math.round(Number(bj.overallScore ?? 0))}%
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            Avg: {Math.round(Number(bj.averageScore ?? 0))}% •
                            Questions: {bj.questionCount ?? 0}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SessionAnalysisPage;
