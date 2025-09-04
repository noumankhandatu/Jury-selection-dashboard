import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileText, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { DashboardAnalytics } from "@/api/types";

interface CardData {
  title: string;
  subtitle: string;
  value: number;
  icon: LucideIcon;
  change: string;
  changeValue: number;
  progress: number;
  color: string;
  bgColor: string;
  hoverBg: string;
  textColor: string;
}

interface DashboardCardsProps {
  analyticsData: DashboardAnalytics;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function DashboardCards({ analyticsData }: DashboardCardsProps) {
  // Transform API data to card format
  const cardData: CardData[] = [
    {
      title: "Total Cases",
      subtitle: "All time cases managed",
      value: analyticsData.totalCases.count,
      icon: FileText,
      change: `${analyticsData.totalCases.change > 0 ? '+' : ''}${analyticsData.totalCases.change} this month`,
      changeValue: analyticsData.totalCases.change,
      progress: analyticsData.totalCases.progress,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      hoverBg: "from-blue-100 to-indigo-100",
      textColor: "text-blue-600",
    },
    {
      title: "Completed Cases",
      subtitle: "Successfully closed cases",
      value: analyticsData.completedCases.count,
      icon: CheckCircle2,
      change: `${analyticsData.completedCases.change > 0 ? '+' : ''}${analyticsData.completedCases.change} this month`,
      changeValue: analyticsData.completedCases.change,
      progress: analyticsData.completedCases.progress,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      hoverBg: "from-green-100 to-emerald-100",
      textColor: "text-green-600",
    },
    {
      title: "Incomplete Cases",
      subtitle: "Active and pending cases",
      value: analyticsData.incompleteCases.count,
      icon: Clock,
      change: `${analyticsData.incompleteCases.change > 0 ? '+' : ''}${analyticsData.incompleteCases.change} this month`,
      changeValue: analyticsData.incompleteCases.change,
      progress: analyticsData.incompleteCases.progress,
      color: "from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-orange-50",
      hoverBg: "from-amber-100 to-orange-100",
      textColor: "text-amber-600",
    },
  ];

  return (
    <motion.div
      className="grid gap-8 md:grid-cols-3 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cardData.map(
        (
          { title, subtitle, value, icon: Icon, change, changeValue, progress, color, textColor },
          idx
        ) => (
          <motion.div key={idx} variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="overflow-hidden border-none shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/80 backdrop-blur-sm">
                {/* Gradient Header */}
                <div className={`h-3 bg-gradient-to-r ${color}`} />

                {/* Card Header */}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`p-3 bg-gradient-to-r ${color} rounded-xl shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-700">
                          {title}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Main Value */}
                    <div className="flex items-baseline justify-between">
                      <motion.div
                        className={`text-5xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.3 + idx * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                      >
                        {value}
                      </motion.div>
                      <motion.div
                        className={`flex items-center px-3 py-1 rounded-full ${
                          changeValue >= 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        {changeValue >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          changeValue >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change}
                        </span>
                      </motion.div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className={`font-medium ${textColor}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 bg-gradient-to-r ${color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            delay: 0.7 + idx * 0.1,
                            duration: 1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )
      )}
    </motion.div>
  );
}
