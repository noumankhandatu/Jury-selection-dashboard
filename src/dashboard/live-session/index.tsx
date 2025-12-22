import TitleTag from "@/components/shared/tag/tag";
import { SelectCase } from "@/components/shared/select-case";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";
import { useLiveSession } from "./useLiveSession";
import LiveSessionData from "./components/live-session-data";
import CourtroomLayout from "./components/court-room-layout/CourtroomLayout";
import { getCaseJurorsApi, createSessionApi, updateSessionStatusApi, postSessionSummaryApi } from "@/api/api";
import { CaseJuror } from "./components/JurorCard";
import { useEffect, useState } from "react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle } from "lucide-react";

interface SessionStatus {
  status: 'active' | 'pending' | 'completed';
}

const LiveSession = () => {
  const { cases, selectedCase, handleCaseSelect } = useLiveSession();
  const [jurors, setJurors] = useState<CaseJuror[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refreshSessionData, setRefreshSessionData] = useState<number>(0);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');

  // Calculate sessionStarted based on status
  const sessionStarted = sessionStatus?.status === 'active';

  const triggerSessionDataRefresh = () => {
    setRefreshSessionData((prev) => prev + 1);
  };

  const handleSessionCreated = (id: string, status: SessionStatus) => {
    setSessionId(id);
    setSessionStatus(status);
  };

  const handleSessionStatusUpdate = (status: SessionStatus) => {
    setSessionStatus(status);
    // Update localStorage based on session status
    if (status.status === 'active') {
      localStorage.setItem('activeSession', 'true');
      window.dispatchEvent(new CustomEvent('sessionStatusChange', { detail: { activeSession: true } }));
    } else if (status.status === 'completed' || status.status === 'pending') {
      localStorage.removeItem('activeSession');
      window.dispatchEvent(new CustomEvent('sessionStatusChange', { detail: { activeSession: false } }));
    }
  };

  const handleStartSessionConfirm = async () => {
    if (!selectedCase) {
      toast.error("Please select a case first");
      return;
    }

    setIsProcessing(true);
    try {
      const currentTime = new Date().toISOString();
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const sessionPayload = {
        name: `${selectedCase.name} - Jury Selection Session`,
        description: `Live Q&A session for ${selectedCase.name} (${selectedCase.type} case)`,
        caseId: selectedCase.id,
        startTime: currentTime,
        endTime: endTime,
      };

      const response = await createSessionApi(sessionPayload);

      let sessionId: string;
      let sessionStatus: SessionStatus;

      // Handle different response structures
      if (response.session) {
        sessionId = response.session.id;
        sessionStatus = {
          status: response.session.status.toLowerCase() as SessionStatus['status']
        };

        await updateSessionStatusApi(sessionId, 'ACTIVE', currentTime, undefined);

        if (response.isExisting) {
          toast.info("Existing session found. Resuming session.");
        } else {
          toast.success("Session started successfully!");
        }
      } else if (response?.data?.session?.id) {
        sessionId = response.data.session.id;
        sessionStatus = { status: 'active' };
        toast.success("Session started successfully!");
      } else {
        throw new Error("Failed to create session: Invalid response");
      }

      handleSessionCreated(sessionId, sessionStatus);
      triggerSessionDataRefresh();
      
      // Store active session status in localStorage and dispatch event
      localStorage.setItem('activeSession', 'true');
      window.dispatchEvent(new CustomEvent('sessionStatusChange', { detail: { activeSession: true } }));

    } catch (error: any) {
      console.error("Error starting session:", error);
      let errorMessage = "Failed to start session";

      if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Case not found. Please select a valid case.";
      } else if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.error || "Invalid request data";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setShowStartConfirm(false);
    }
  };

  const handleEndSessionConfirm = async () => {
    if (!sessionId) {
      toast.error("No active session to end");
      return;
    }

    setIsProcessing(true);
    try {
      const endTime = new Date().toISOString();

      // 1. First, end the session
      await updateSessionStatusApi(sessionId, 'COMPLETED', undefined, endTime);

      // 2. Send summary to summary API if summary exist
      if (summary.trim()) {
        try {
          await postSessionSummaryApi(sessionId, summary.trim());
          toast.success("Session ended with summary saved!");
        } catch (summaryError: any) {
          // Log but don't fail the entire session end process
          console.warn("Failed to save summary, but session ended:", summaryError);
          toast.success("Session ended (summary may not have been saved)");
        }
      } else {
        toast.success("Session ended successfully!");
      }

      // 3. Update local state
      const newStatus: SessionStatus = { status: 'completed' };
      setSessionStatus(newStatus);
      triggerSessionDataRefresh();
      
      // Clear active session status from localStorage and dispatch event
      localStorage.removeItem('activeSession');
      window.dispatchEvent(new CustomEvent('sessionStatusChange', { detail: { activeSession: false } }));

    } catch (error: any) {
      console.error("Error ending session:", error);
      toast.error(error.message || "Failed to end session");
    } finally {
      setIsProcessing(false);
      setShowEndConfirm(false);
      setSummary(''); // Reset summary for next time
    }
  };

  useEffect(() => {
    setSessionId(null);
    setSessionStatus(null);
    setShowStartConfirm(false);
    setShowEndConfirm(false);
  }, [selectedCase?.id]);

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
      <motion.div className="mx-auto space-y-6" initial="hidden" animate="visible" variants={itemVariants}>
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
                onSessionStatusUpdate={handleSessionStatusUpdate}
                refreshSessionData={refreshSessionData}
                sessionId={sessionId}
                setSessionId={setSessionId}
                sessionStatus={sessionStatus}
                onStartSessionClick={() => setShowStartConfirm(true)}
                onEndSessionClick={() => setShowEndConfirm(true)}
                isStartDisabled={sessionStatus?.status === 'completed'}
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
          </div>
        )}

        <ConfirmationDialog
          isOpen={showStartConfirm}
          onClose={() => !isProcessing && setShowStartConfirm(false)}
          onConfirm={handleStartSessionConfirm}
          title="Start Live Session"
          description={
            <div className="space-y-3">
              <p>Are you sure you want to start the live session? Once started, jurors will be able to join and participate.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium">✨ One-Time Session</p>
                <p className="mt-1">This is a unique, one-time session designed to capture authentic juror responses. Once started, this session will run once and cannot be restarted, ensuring the integrity and authenticity of your data collection.</p>
              </div>
            </div>
          }
          confirmText="Start Session"
          isLoading={isProcessing}
          icon={PlayCircle}
        />

        <ConfirmationDialog
          isOpen={showEndConfirm}
          onClose={() => !isProcessing && setShowEndConfirm(false)}
          onConfirm={handleEndSessionConfirm}
          title="End Live Session"
          description="Are you sure you want to end the session? This will close the session for all jurors and cannot be undone."
          confirmText="End Session"
          variant="destructive"
          isLoading={isProcessing}
          Children={
            <div className="space-y-2 py-2 mt-1">
              <p className="text-sm font-medium text-black">
                Add any final summary about this session:
              </p>
              <Textarea
                placeholder="Enter session summary here..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-700">
                These summary will be saved as part of the session summary.
              </p>
            </div>
          }
        >
        </ConfirmationDialog>
      </motion.div>
    </div>
  );
};

export default LiveSession;