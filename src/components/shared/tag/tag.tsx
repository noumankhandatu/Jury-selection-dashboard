import { containerVariants, itemVariants } from "@/utils/fn";
import { motion } from "framer-motion";
import { Scale } from "lucide-react"; // Or replace this with any icon you want

type TitleTagProps = {
  title: string;
};

const TitleTag = ({ title }: TitleTagProps) => {
  return (
    <motion.div className="w-full mx-auto space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
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
          <Scale className="h-6 w-6 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{title}</h1>
      </motion.div>
    </motion.div>
  );
};

export default TitleTag;
