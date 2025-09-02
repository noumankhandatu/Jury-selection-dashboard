/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle, Edit, HelpCircle, Play, Square as StopIcon, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { createSessionApi } from "@/api/api";
import { toast } from "sonner";

const LiveSessionData = ({ caseSelected, onSessionCreated }: any) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSession = async () => {
    // Reset error state
    setError(null);

    // Validate case selection
    if (!caseSelected) {
      setError("Please select a case first");
      toast.error("Please select a case first");
      return;
    }

    // Validate case data
    if (!caseSelected.id || !caseSelected.name || !caseSelected.type) {
      setError("Invalid case data. Please select a valid case.");
      toast.error("Invalid case data. Please select a valid case.");
      return;
    }

    setIsCreatingSession(true);
    
    try {
      const currentTime = new Date().toISOString();
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
      
      const sessionPayload = {
        name: `${caseSelected.name} - Jury Selection Session`,
        description: `Live Q&A session for ${caseSelected.name} (${caseSelected.type} case)`,
        caseId: caseSelected.id,
        startTime: currentTime,
        endTime: endTime,
      };

      console.log("Creating session with payload:", sessionPayload);

      const response = await createSessionApi(sessionPayload);
      
      setSessionActive(true);
      setError(null);
      toast.success("Live session started successfully!");
      
      console.log("Session created successfully:", response);
      const createdId = response?.session?.id || response?.data?.session?.id;
      if (createdId && typeof onSessionCreated === "function") {
        onSessionCreated(createdId);
      }
    } catch (error: any) {
      console.error("Error starting session:", error);
      
      // Handle different types of errors
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
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleEndSession = () => {
    try {
      setSessionActive(false);
      setError(null);
      toast.success("Session ended");
      // You can add additional logic like API call here
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Error ending session");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div>
        <Card className="overflow-hidden border-none shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
          {/* Gradient Header */}
          <div className="h-3 bg-gradient-to-r from-primary-500 to-primary-600" />

          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-gray-700">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Live Session Data</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {caseSelected ? (
              <motion.div className="space-y-6" variants={itemVariants}>
                {/* Error Display */}
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

                {/* Live Session Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <StatCard 
                      icon={<CheckCircle className="h-4 w-4 text-green-600" />} 
                      bg="bg-green-100" 
                      label="Total Questions" 
                      value="12" 
                      color="from-green-500 to-green-600"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard 
                      icon={<Users className="h-4 w-4 text-blue-600" />} 
                      bg="bg-blue-100" 
                      label="Total Jurors" 
                      value="12" 
                      color="from-blue-500 to-blue-600"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard 
                      icon={<XCircle className="h-4 w-4 text-red-600" />} 
                      bg="bg-red-100" 
                      label="Didn't Answer" 
                      value="12" 
                      color="from-red-500 to-red-600"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard 
                      icon={<Edit className="h-4 w-4 text-purple-600" />} 
                      bg="bg-purple-100" 
                      label="Answered" 
                      value="12" 
                      color="from-purple-500 to-purple-600"
                    />
                  </motion.div>
                </div>

                {/* Session Controls */}
                <motion.div className="flex flex-col gap-4 items-center" variants={itemVariants}>
                  {!sessionActive ? (
                    <div className="w-full">
                      <Button
                        onClick={handleStartSession}
                        disabled={isCreatingSession || !caseSelected?.id}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 w-full min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingSession ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Starting Session...
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-white rounded-full" />
                            <Play className="h-4 w-4" />
                            Start Session
                          </>
                        )}
                      </Button>
                      {!caseSelected?.id && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Please select a valid case to start session
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      <Button
                        onClick={handleEndSession}
                        variant="destructive"
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 w-full min-w-[200px]"
                      >
                        <StopIcon className="h-4 w-4" />
                        End Session
                      </Button>
                    </div>
                  )}

                  {/* Session Status Indicator */}
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    variants={itemVariants}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full ${sessionActive ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <Badge 
                      variant={sessionActive ? "default" : "secondary"} 
                      className="px-3 py-1 text-sm font-medium"
                    >
                      {sessionActive ? "Session Active" : "Session Inactive"}
                    </Badge>
                  </motion.div>
                </motion.div>
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
                <p className="text-center text-gray-600 font-medium">Select a case to view session data</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default LiveSessionData;

// 🧩 Mini component to reduce repeated code
const StatCard = ({ icon, bg, label, value, color }: any) => (
  <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bg} rounded-lg`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  </div>
);
