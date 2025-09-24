import TitleTag from "@/components/shared/tag/tag";
import { SelectCase } from "@/components/shared/select-case";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";
import { useLiveSession } from "./useLiveSession";
import LiveSessionData from "./components/live-session-data";
import CourtroomLayout from "./components/CourtroomLayout";
import { getCaseJurorsApi } from "@/api/api";
import { CaseJuror } from "./components/JurorCard";
import { useEffect, useState } from "react";

const LiveSession = () => {
  const { cases, selectedCase, handleCaseSelect } = useLiveSession();
  const [jurors, setJurors] = useState<CaseJuror[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refreshSessionData, setRefreshSessionData] = useState<number>(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Function to trigger session data refresh
  const triggerSessionDataRefresh = () => {
    setRefreshSessionData((prev) => prev + 1);
  };

  // Handle session creation
  const handleSessionCreated = (id: string) => {
    setSessionId(id);
    setSessionStarted(true);
  };

  // Reset session state when case changes
  useEffect(() => {
    setSessionStarted(false);
    setSessionId(null);
  }, [selectedCase?.id]);

  // Fetch jurors for selected case
  useEffect(() => {
    const fetchCaseJurors = async () => {
      if (!selectedCase?.id) {
        setJurors([]);
        return;
      }

      try {
        setLoading(true);
        const response = await getCaseJurorsApi(selectedCase.id);
        if (response.success && response.data?.jurors) {
          setJurors(response.data.jurors);
        } else {
          setJurors([]);
        }
      } catch (error) {
        console.error("Error fetching case jurors:", error);
        setJurors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseJurors();
  }, [selectedCase?.id]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div
        className="mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={itemVariants}
      >
        <TitleTag title="Live Session" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SelectCase
              cases={cases}
              selectedCase={selectedCase}
              onCaseSelect={handleCaseSelect}
              title="Select Case"
              description="Choose a case to start live session"
              showDetails={true}
            />
          </div>
          <div>
            {selectedCase && (
              <LiveSessionData
                jurors={jurors}
                caseSelected={selectedCase}
                onSessionCreated={handleSessionCreated}
                refreshSessionData={refreshSessionData}
                sessionId={sessionId}
              />
            )}
          </div>
        </div>
        {selectedCase && sessionStarted && (
          <div className="grid grid-cols-1 gap-6">
            <div className="">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-lg text-gray-600">Loading jurors...</div>
                </div>
              ) : (
                <CourtroomLayout
                  allJurors={jurors}
                  selectedCaseId={selectedCase?.id}
                  selectedCase={selectedCase}
                  sessionId={sessionId || undefined}
                  onRefreshSessionData={triggerSessionDataRefresh}
                />
              )}
            </div>
            {/* <div>
              <QuestionAnswer selectedCase={selectedCase} />
            </div> */}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveSession;
