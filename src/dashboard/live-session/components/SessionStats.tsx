import { CheckCircle, Users, XCircle, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/utils/fn";

interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number | string;
  color: string;
}

const StatCard = ({ icon, bg, label, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  </div>
);

interface SessionStatsProps {
  assignments: number;
  totalJurors: number;
  responses: number;
  assessments: number;
  isLoading: boolean;
}

const SessionStats = ({
  assignments,
  totalJurors,
  responses,
  assessments,
  isLoading
}: SessionStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div variants={itemVariants}>
        <StatCard
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          bg="bg-green-100"
          label="Assignments"
          value={isLoading ? "..." : assignments}
          color="from-green-500 to-green-600"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          icon={<Users className="h-4 w-4 text-blue-600" />}
          bg="bg-blue-100"
          label="Total Jurors"
          value={totalJurors}
          color="from-blue-500 to-blue-600"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          bg="bg-red-100"
          label="Responses"
          value={isLoading ? "..." : responses}
          color="from-red-500 to-red-600"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          icon={<Edit className="h-4 w-4 text-purple-600" />}
          bg="bg-purple-100"
          label="Assessments"
          value={isLoading ? "..." : assessments}
          color="from-purple-500 to-purple-600"
        />
      </motion.div>
    </div>
  );
};

export default SessionStats;