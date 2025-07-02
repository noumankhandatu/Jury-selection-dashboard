import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  subtitle: string;
  value: number;
  icon: LucideIcon;
  change: string;
  color: string;
  bgColor: string;
  hoverBg: string;
  textColor: string;
  progress: string;
  index: number;
}

export default function StatCard({ title, subtitle, value, icon: Icon, change, color, bgColor, hoverBg, textColor, progress, index }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.5 }}>
      <motion.div whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }}>
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
                  <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
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
                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {value}
                </motion.div>
                <motion.div
                  className="flex items-center px-3 py-1 bg-green-100 rounded-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">{change}</span>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className={`font-medium ${textColor}`}>{progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 bg-gradient-to-r ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: progress }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <motion.div
                className={`flex items-center justify-center mt-6 p-3 bg-gradient-to-r ${bgColor} rounded-lg cursor-pointer group hover:${hoverBg} transition-all duration-300`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowUpRight className={`w-4 h-4 ${textColor} mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform`} />
                <span className={`text-sm font-medium ${textColor}`}>
                  {title === "Total Cases" ? "View All Cases" : title === "Completed Cases" ? "View Completed" : "View Active"}
                </span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
