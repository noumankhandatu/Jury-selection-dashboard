/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Square, Users, CheckCircle, XCircle, Edit, HelpCircle } from "lucide-react";

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

  return (
    <div>
      <Card className="bg-[#fcfdff] backdrop-blur-md border border-blue-100 shadow-md">
        <CardHeader className="pb-4 ">
          <CardTitle className="flex items-center text-center  justify-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            Live Session Data
          </CardTitle>
        </CardHeader>

        <CardContent>
          {caseSelected ? (
            <div className="space-y-6">
              {/* Live Session Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Questions */}
                <StatCard icon={<CheckCircle className="h-4 w-4 text-green-600" />} bg="bg-green-100" label="Total Questions" value="12" />

                {/* Total Jurors */}
                <StatCard icon={<Users className="h-4 w-4 text-blue-600" />} bg="bg-blue-100" label="Total Jurors" value="12" />

                {/* Didn't Answer */}
                <StatCard icon={<XCircle className="h-4 w-4 text-red-600" />} bg="bg-red-100" label="Didn't Answer" value="12" />

                {/* Answered */}
                <StatCard icon={<Edit className="h-4 w-4 text-purple-600" />} bg="bg-purple-100" label="Answered" value="12" />
              </div>

              {/* Session Controls */}
              <div className="flex flex-col gap-3 items-center">
                {!sessionActive ? (
                  <Button
                    onClick={handleStartSession}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Start Session
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndSession}
                    variant="destructive"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                  >
                    <Square className="h-4 w-4" />
                    End Session
                  </Button>
                )}

                {/* Session Status Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                  <Badge variant={sessionActive ? "default" : "secondary"} className="px-2 py-1 text-xs">
                    {sessionActive ? "Session Active" : "Session Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-center">Select a case to view session data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSessionData;

// 🧩 Mini component to reduce repeated code
const StatCard = ({ icon, bg, label, value }: any) => (
  <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 ${bg} rounded-lg`}>{icon}</div>
      <div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  </div>
);
