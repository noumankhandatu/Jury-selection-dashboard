import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { AnalyticsData } from "@/api/types";

interface DashboardChartProps {
  data: AnalyticsData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Cases Performance</CardTitle>
              <p className="text-sm text-gray-500">Monthly breakdown of total, completed, and incomplete cases</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorIncomplete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                  backdropFilter: "blur(10px)",
                }}
                labelStyle={{ color: "#374151", fontWeight: "600" }}
              />
              <Area
                type="monotone"
                dataKey="cases"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTotal)"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#ffffff" }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2, fill: "#ffffff" }}
              />
              <Area
                type="monotone"
                dataKey="incomplete"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorIncomplete)"
                strokeWidth={3}
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 2, fill: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-8 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Total Cases</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Completed Cases</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Incomplete Cases</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
