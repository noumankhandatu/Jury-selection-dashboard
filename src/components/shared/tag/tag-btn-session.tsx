/* eslint-disable @typescript-eslint/no-explicit-any */
import { Download, Radio } from "lucide-react";
import { itemVariants } from "@/utils/fn";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
const TagBtnSession = ({ selectedCaseData, exportAnalysis }: any) => {
  return (
    <div className="flex items-center justify-center lg:justify-between  gap-4 space-y-2 flex-wrap">
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Session Analysis</h1>
      </motion.div>

      {selectedCaseData && (
        <Button onClick={exportAnalysis} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      )}
    </div>
  );
};

export default TagBtnSession;
