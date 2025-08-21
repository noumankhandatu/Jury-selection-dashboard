/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle, Edit, HelpCircle, Play, Square as StopIcon } from "lucide-react";
import { motion } from "framer-motion";

const LiveSessionData = ({ caseSelected }: any) => {
  const [sessionActive, setSessionActive] = useState(false);

  const handleStartSession = () => {
    setSessionActive(true);
    // You can add additional logic like API call here
  };

  const handleEndSession = () => {
    setSessionActive(false);
    // You can add additional logic like API call here
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
                    <div>
                      <Button
                        onClick={handleStartSession}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 w-full min-w-[200px]"
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <Play className="h-4 w-4" />
                        Start Session
                      </Button>
                    </div>
                  ) : (
                    <div>
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
