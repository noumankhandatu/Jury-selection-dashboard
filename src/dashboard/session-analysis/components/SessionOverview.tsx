/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderTag from "@/components/shared/card-header";
import {
  Activity,
  Users,
  MessageSquare,
  Brain,
  Percent,
  Gauge,
  ThumbsDown,
  Circle,
  ThumbsUp,
} from "lucide-react";

export function SessionOverview({
  sessionStats,
  onBucketClick,
}: {
  sessionStats: any | null;
  onBucketClick?: (bucket: "low" | "mid" | "high") => void;
}) {
  if (!sessionStats) return null;

  const overview = sessionStats.overview || {};
  const performance = sessionStats.performance || {};

  const avg = Number(performance.averageScore ?? 0);

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-xl">
        <CardHeaderTag
          title="Session Analysis"
          description="Overview and performance for the selected session."
          Icon={Activity}
        />
        <CardContent className="p-5">
          {/* Row 1: 5 statistic cards with colorful icons and unified typography */}
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </span>
                <span>Total Jurors</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {overview.totalJurors ?? 0}
              </div>
            </div>
            <div className="rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-indigo-100 text-indigo-600">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <span>Responses</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {overview.totalResponses ?? 0}
              </div>
            </div>
            <div className="rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-emerald-100 text-emerald-600">
                  <Brain className="h-5 w-5" />
                </span>
                <span>Assessments</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {overview.totalAssessments ?? 0}
              </div>
            </div>
            <div className="rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-amber-100 text-amber-600">
                  <Percent className="h-5 w-5" />
                </span>
                <span>Completion Rate</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {Math.round(Number(overview.completionRate ?? 0))}%
              </div>
            </div>
            <div className="rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-violet-100 text-violet-600">
                  <Gauge className="h-5 w-5" />
                </span>
                <span>Overall</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {Math.round(avg)}%
              </div>
            </div>
          </div>

          {/* Row 2: distribution cards - reordered and relabeled */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            {/* Low first - Ideal for Strike */}
            <div
              className="cursor-pointer rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center"
              onClick={() => onBucketClick?.("low")}
            >
              <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-red-100 text-red-600">
                  <ThumbsDown className="h-5 w-5" />
                </span>
                <span>Ideal for Strike (&lt;60)</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-500">
                {performance.lowPerformers ?? 0}
              </div>
            </div>

            {/* Neutral second */}
            <div
              className="cursor-pointer rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center"
              onClick={() => onBucketClick?.("mid")}
            >
              <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-amber-100 text-amber-600">
                  <Circle className="h-5 w-5" />
                </span>
                <span>Neutral (60–79)</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-500">
                {performance.mediumPerformers ?? 0}
              </div>
            </div>

            {/* Recommended third */}
            <div
              className="cursor-pointer rounded-lg border p-5 bg-white shadow-lg hover:shadow-xl text-center"
              onClick={() => onBucketClick?.("high")}
            >
              <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-green-100 text-green-600">
                  <ThumbsUp className="h-5 w-5" />
                </span>
                <span>Recommended (≥80)</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-green-600">
                {performance.highPerformers ?? 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionOverview;
