import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import TitleTag from "@/components/shared/tag/tag";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportSessionReportHTML } from "./utils/exportReportHTML";
import { itemVariants } from "@/utils/fn";
import { Selectors } from "./components/Selectors";
import { useSessionAnalysis } from "./hooks/useSessionAnalysis";
import { JurorResponses } from "./components/JurorResponses";
import SessionOverview from "./components/SessionOverview";
import StrikeRecommendationsSection from "./components/StrikeRecommendationsSection";
import { StrikeRecommendationsResponse } from "./components/StrikeRecommendationsSection";
import {
  getSessionSelectedJurorsApi,
  setJurorSelectedForFinalApi,
} from "@/api/api";

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

  const [selectedBucket, setSelectedBucket] = useState<
    "all" | "low" | "mid" | "high" | null
  >(null);
  const [strikeRecommendations, setStrikeRecommendations] =
    useState<StrikeRecommendationsResponse | null>(null);
  const [selectedJurorIds, setSelectedJurorIds] = useState<Set<string>>(
    () => new Set()
  );
  // data fetching moved to useSessionAnalysis hook

  // Read caseId from query to deep-link from dashboard
  const queryCaseId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("caseId");
  }, []);

  useEffect(() => {
    if (!queryCaseId || !cases.length) return;
    const found = cases.find((c) => String(c.id) === String(queryCaseId));
    if (found) setSelectedCase(found);
  }, [queryCaseId, cases, setSelectedCase]);

  // Once sessions load for the selected case, choose the latest session automatically
  useEffect(() => {
    if (!sessions.length || !selectedCase) return;
    const sorted = [...sessions].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
    setSelectedSession(sorted[0] || null);
  }, [sessions, selectedCase, setSelectedSession]);

  // Load selected jurors from database when session changes
  useEffect(() => {
    if (!selectedSession?.id) return;
    getSessionSelectedJurorsApi(selectedSession.id)
      .then((data: { selectedJurorIds?: string[] }) => {
        setSelectedJurorIds(
          new Set(
            Array.isArray(data?.selectedJurorIds) ? data.selectedJurorIds : []
          )
        );
      })
      .catch(() => {
        setSelectedJurorIds(new Set());
      });
  }, [selectedSession?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div
        className="mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <TitleTag title="Session Analysis" />
          {selectedSession && (
            <Button
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0"
              onClick={() => {
                // Use same canonical id as grid (mapBestJurorToDisplay: juror.id ?? item.id)
                const selectedJurors = (bestJurors || [])
                  .filter((bj: any) => {
                    const canonicalId = String(bj?.juror?.id ?? bj?.id ?? "");
                    return canonicalId && selectedJurorIds.has(canonicalId);
                  })
                  .map((bj: any) => ({
                    id: bj.juror?.id ?? bj.id,
                    name: bj.juror?.name || "Unknown Juror",
                    jurorNumber: bj.juror?.jurorNumber ?? bj.jurorNumber,
                    panelPosition:
                      bj.juror?.panelPosition ?? bj.panelPosition ?? null,
                  }));
                exportSessionReportHTML({
                  session: sessionDetail,
                  sessionStats,
                  strikeRecommendations,
                  selectedJurors,
                });
              }}
            >
              <FileDown className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          )}
        </div>
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
              session={sessionDetail}
              bestJurors={bestJurors}
              selectedBucket={selectedBucket}
              selectedJurorIds={selectedJurorIds}
              onSelectForFinal={async (juror) => {
                try {
                  await setJurorSelectedForFinalApi(
                    selectedSession.id,
                    juror.id,
                    true
                  );
                  setSelectedJurorIds((prev) => new Set(prev).add(juror.id));
                } catch (e) {
                  console.error("Failed to set selected for final:", e);
                }
              }}
              onUnselectForFinal={async (jurorId) => {
                try {
                  await setJurorSelectedForFinalApi(
                    selectedSession.id,
                    jurorId,
                    false
                  );
                  setSelectedJurorIds((prev) => {
                    const next = new Set(prev);
                    next.delete(jurorId);
                    return next;
                  });
                } catch (e) {
                  console.error("Failed to unselect for final:", e);
                }
              }}
              onBucketClick={(bucket) => {
                setSelectedBucket(bucket);
                if (bucket === "all") return fetchBestJurors(0, 100);
                if (bucket === "low") return fetchBestJurors(0, 59);
                if (bucket === "mid") return fetchBestJurors(60, 79);
                if (bucket === "high") return fetchBestJurors(80);
              }}
            />
            {selectedSession && (
              <StrikeRecommendationsSection
                sessionId={selectedSession.id}
                sessionStatus={selectedSession.status || sessionDetail?.status}
                onDataLoaded={setStrikeRecommendations}
              />
            )}
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
