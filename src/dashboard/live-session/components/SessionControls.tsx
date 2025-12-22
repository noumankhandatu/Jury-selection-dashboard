import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Square as StopIcon } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";
import { SessionControlsProps } from "@/types/sessions";

const SessionControls = ({
  sessionActive,
  caseSelected,
  sessionStatus,
  onStartSessionClick,
  onEndSessionClick,
  isStartDisabled = false
}: SessionControlsProps) => {
  // If session is completed, show a message instead of buttons
  if (sessionStatus?.status === 'completed') {
    return (
      <motion.div className="w-full" variants={itemVariants}>
        <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Session Completed</span>
          </div>
          <p className="text-sm text-blue-600 text-center">
            This session has been completed. You can view the session history or start a new session with a different case.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex flex-col gap-4 items-center" variants={itemVariants}>
      {!sessionActive ? (
        <div className="w-full">
          <Button
            onClick={onStartSessionClick}
            disabled={!caseSelected?.id || isStartDisabled}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 w-full min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            <Play className="h-4 w-4" />
            Start Session
          </Button>
          {!caseSelected?.id && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Please select a valid case to start session
            </p>
          )}
          {isStartDisabled && (sessionStatus?.status !== 'completed' as string) && (
            <p className="text-xs text-yellow-600 mt-2 text-center">
              Cannot start session while another session is active
            </p>
          )}
        </div>
      ) : (
        <div className="w-full">
          <Button
            onClick={onEndSessionClick}
            variant="destructive"
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 w-full min-w-[200px]"
            disabled={sessionStatus?.status === 'completed' as string}
          >
            <StopIcon className="h-4 w-4" />
            End Session
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SessionControls;