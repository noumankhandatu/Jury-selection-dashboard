import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HelpCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getSessionsByCaseApi } from "@/api/api";
import { SessionsByCaseResponse } from "@/api/types";
import SessionStatusComponent from "./SessionStatsComponent";
import SessionControls from "./SessionControls";
import SessionStats from "./SessionStats";
import { LiveSessionDataProps, SessionStatus } from "@/types/sessions";

const LiveSessionData = ({
  jurors,
  caseSelected,
  refreshSessionData,
  sessionId,
  setSessionId,
  sessionStatus: externalSessionStatus,
  onSessionStatusUpdate,
  onStartSessionClick,
  onEndSessionClick,
  isStartDisabled = false
}: LiveSessionDataProps) => {
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionsByCaseResponse | null>(null);
  const [isLoadingSessionData, setIsLoadingSessionData] = useState(false);
  const [internalSessionStatus, setInternalSessionStatus] = useState<SessionStatus | null>(null);

  const sessionStatus = externalSessionStatus || internalSessionStatus;
  const sessionActive = sessionStatus?.status === 'active';

  const fetchSessionData = useCallback(async (caseId: string) => {
    setIsLoadingSessionData(true);
    try {
      const response = await getSessionsByCaseApi(caseId);
      setSessionData(response);

      if (response?.sessions && response.sessions.length > 0) {
        const firstSession = response.sessions[0];
        const status = firstSession.status.toLowerCase() as SessionStatus['status'];
        const newStatus: SessionStatus = { status };
        setSessionId(firstSession?.id)
        setInternalSessionStatus(newStatus);

        if (onSessionStatusUpdate) {
          onSessionStatusUpdate(newStatus);
        }
      } else {
        setInternalSessionStatus(null);
      }
    } catch (error: any) {
      console.error("Error fetching session data:", error);
      setSessionData(null);
      setInternalSessionStatus(null);
    } finally {
      setIsLoadingSessionData(false);
    }
  }, [onSessionStatusUpdate]);

  useEffect(() => {
    if (caseSelected?.id) {
      fetchSessionData(caseSelected.id);
    } else {
      setSessionData(null);
    }
  }, [caseSelected?.id]);

  useEffect(() => {
    if (refreshSessionData && caseSelected?.id) {
      fetchSessionData(caseSelected.id);
    }
  }, [refreshSessionData, caseSelected?.id]);

  useEffect(() => {
    if (!sessionId) {
      setInternalSessionStatus(null);
    }
  }, [sessionId]);

  const handleStatusChange = (status: SessionStatus) => {
    setInternalSessionStatus(status);
    if (onSessionStatusUpdate) {
      onSessionStatusUpdate(status);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div>
        <Card className="overflow-hidden border-none shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
          <div className="h-3 bg-gradient-to-r from-primary-500 to-primary-600" />

          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between gap-3 text-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  Live Session Data
                </span>
              </div>

              <SessionStatusComponent
                sessionId={sessionId}
                sessionStatus={sessionStatus}
                onStatusChange={handleStatusChange}
              />
            </CardTitle>
          </CardHeader>

          <CardContent>
            {caseSelected ? (
              <motion.div className="space-y-6" variants={itemVariants}>
                {error && (
                  <motion.div
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </motion.div>
                )}

                <SessionStats
                  assignments={sessionData?.sessions?.[0]?._count?.assignments || 0}
                  totalJurors={jurors?.length || 0}
                  responses={sessionData?.sessions?.[0]?._count?.responses || 0}
                  assessments={sessionData?.sessions?.[0]?._count?.assessments || 0}
                  isLoading={isLoadingSessionData}
                />

                <SessionControls
                  sessionActive={sessionActive}
                  caseSelected={caseSelected}
                  sessionStatus={sessionStatus}
                  onStartSessionClick={onStartSessionClick as any}
                  onEndSessionClick={onEndSessionClick as any}
                  isStartDisabled={isStartDisabled || sessionStatus?.status === 'completed'}
                />
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-gray-500"
                variants={itemVariants}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <HelpCircle className="h-16 w-16 mb-4 opacity-50" />
                </motion.div>
                <p className="text-center text-gray-600 font-medium">
                  Select a case to view session data
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default LiveSessionData;