import TitleTag from "@/components/shared/tag/tag";
import { SelectCase } from "@/components/shared/select-case";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";
import { useLiveSession } from "./useLiveSession";
import LiveSessionData from "./components/live-session-data";
import CourtroomLayout from "./components/CourtroomLayout";
import { getJurorsApi } from "@/api/api";
import { Juror } from "./components/JurorCard";
import { useEffect, useState } from "react";

const LiveSession = () => {
  const { cases, selectedCase, handleCaseSelect } = useLiveSession();
  const [jurors, setJurors] = useState<Juror[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch jurors from API
  useEffect(() => {
    const fetchJurors = async () => {
      try {
        setLoading(true);
        const jurorsData = await getJurorsApi();
        setJurors(jurorsData || []);
      } catch (error) {
        console.error("Error fetching jurors:", error);
        setJurors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJurors();
  }, []);

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
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-lg text-gray-600">Loading jurors...</div>
                </div>
              ) : (
                <CourtroomLayout 
                  allJurors={jurors} 
                  selectedCaseId={selectedCase?.id}
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
