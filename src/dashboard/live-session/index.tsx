import TitleTag from "@/components/shared/tag/tag";
import { SelectCase } from "@/components/shared/select-case";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";
import { useLiveSession } from "./useLiveSession";
import LiveSessionData from "./components/live-session-data";
import QuestionAnswer from "./components/question-answer";
import CourtroomLayout from "./components/CourtroomLayout";

const LiveSession = () => {
  const { cases, selectedCase, handleCaseSelect } = useLiveSession();

  const fakeJurors = Array.from({ length: 36 }, (_, i) => ({
    id: i + 1,
    name: `Juror ${i + 1}`,
  }));

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
            <LiveSessionData caseSelected={selectedCase} />
          </div>
        </div>
        {selectedCase && (
          <div className="grid grid-cols-1  gap-6">
            <div className="">
              <CourtroomLayout allJurors={fakeJurors} />{" "}
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
