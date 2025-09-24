import { useState, useEffect } from "react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardCards from "./components/DashboardCards";
import DashboardChart from "./components/DashboardChart";
import LastCaseCard from "./components/LastCaseCard";
import { getDashboardAnalyticsApi } from "@/api/api";
import { DashboardAnalytics } from "@/api/types";

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardAnalyticsApi();
        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          setError("Failed to fetch analytics data");
        }
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 py-20 px-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex-1 py-20 px-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-2">Error Loading Dashboard</p>
            <p className="text-gray-600">
              {error || "Unable to load dashboard data"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-20 px-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="space-y-8">
        <DashboardHeader />
        <DashboardCards analyticsData={analyticsData} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
          <div className="xl:col-span-2">
            <DashboardChart data={analyticsData.analyticsData} />
          </div>
          <div className="xl:col-span-1">
            <LastCaseCard />
          </div>
        </div>
      </div>
    </div>
  );
}
