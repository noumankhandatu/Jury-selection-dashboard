/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Radio, StopCircle, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";

const TagWithBtn = ({ isSessionActive, startSession, endSession, exportSessionData, sessionStartTime, answers, selectedCase }: any) => {
  return (
    <div className="flex items-center justify-center lg:justify-between  gap-4 space-y-2 flex-wrap">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center space-x-4"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Radio className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Live Session</h1>
        </motion.div>

        {isSessionActive && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        )}
      </div>

      {/* Session Controls */}
      <div className="flex items-center gap-2">
        {!isSessionActive ? (
          <Button onClick={startSession} disabled={!selectedCase} className="text-white" style={{ backgroundColor: "#5156be" }}>
            <Radio className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={exportSessionData}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <StopCircle className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    End Live Session
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end this live session? This will save all recorded answers and stop the session.
                    <br />
                    <br />
                    <strong>Session Summary:</strong>
                    <br />• Total Answers: {answers.length}
                    <br />• Participating Jurors: {new Set(answers.map((a: { jurorId: any }) => a.jurorId)).size}
                    <br />• Session Duration: {sessionStartTime ? "Started at " + sessionStartTime : "Not started"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Session</AlertDialogCancel>
                  <AlertDialogAction onClick={endSession} className="bg-red-600 hover:bg-red-700">
                    End Session
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default TagWithBtn;
