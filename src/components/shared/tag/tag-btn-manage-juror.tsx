/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { itemVariants } from "@/utils/fn";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react"; // Or rep

const TagBtnJuror = ({ setIsAddJurorOpen }: any) => {
  return (
    <div>
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
            <UserPlus className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manage Jurors</h1>
        </motion.div>

        <Button
          onClick={() => setIsAddJurorOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 "
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Juror Manually
        </Button>
      </div>
    </div>
  );
};

export default TagBtnJuror;
