import DashboardHeader from "./components/DashboardHeader";
import DashboardCards from "./components/DashboardCards";
import DashboardChart from "./components/DashboardChart";
import { cardData, casesTrendData } from "@/raw/static-data";

export default function Dashboard() {
  return (
    <div className="flex-1 py-20 px-4 lg:p-8  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="space-y-8">
        <DashboardHeader />
        <DashboardCards cardData={cardData} />
        <DashboardChart data={casesTrendData} />
      </div>
    </div>
  );
}
