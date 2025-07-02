import { Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHeader() {
  return (
    <motion.div
      className="flex items-center space-x-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <Scale className="h-6 w-6 text-white" />
      </motion.div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard Overview</h1>
    </motion.div>
  );
}
