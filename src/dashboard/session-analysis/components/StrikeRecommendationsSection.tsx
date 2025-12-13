import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateStrikeRecommendationsApi } from "@/api/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CardHeaderTag from "@/components/shared/card-header";

import {
  FileText,
  TriangleAlert,
  Gavel,
  CheckCircle2,
} from "lucide-react";

interface StrikeRecommendation {
  jurorId: string;
  jurorName: string;
  jurorNumber: string;
  strikeRecommendation: "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | "NONE";
  strikeReason: string;
}

export interface StrikeRecommendationsResponse {
  message: string;
  sessionId: string;
  summary: {
    cause: number;
    peremptory: number;
    none: number;
  };
  evaluations: StrikeRecommendation[];
}

const StrikeRecommendationsSection =  ({
  sessionId,
  onDataLoaded,
}: {
  sessionId: string;
  onDataLoaded?: (data: StrikeRecommendationsResponse) => void;
}) => {
  const [strikeRecommendations, setStrikeRecommendations] =
    useState<StrikeRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const fetchStrikeRecommendations = async () => {
  if (!sessionId) return;
  setLoading(true);
  setError(null);

  try {
    const data = await generateStrikeRecommendationsApi(sessionId);
    setStrikeRecommendations(data);
    onDataLoaded?.(data); // 🔥 important
  } catch (err: any) {
    setError(err.message || "Failed to fetch strike recommendations");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchStrikeRecommendations();
  }, [sessionId]);

  if (loading) return <p>Loading strike recommendations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!strikeRecommendations) return null;

  const summaryCards = [
    {
      label: "Strike for Cause",
      value: strikeRecommendations.summary?.cause ?? 0,
      icon: TriangleAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Peremptory Strikes",
      value: strikeRecommendations.summary?.peremptory ?? 0,
      icon: Gavel,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "No Strike Needed",
      value: strikeRecommendations.summary?.none ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 gap-6">
      <Card className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-gray-200">
        <CardHeaderTag
          title="Strike Recommendations"
          description="AI-generated strike recommendations for all jurors in this session"
          Icon={FileText}
        />

        <CardContent className="p-6 space-y-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <Card
                key={card.label}
                className="p-4 flex items-center gap-4 shadow-sm border rounded-xl"
              >
                <div className={`p-3 rounded-full ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-semibold">{card.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Evaluations */}
          <div className="space-y-4">
            {strikeRecommendations.evaluations?.length > 0 ? (
              strikeRecommendations.evaluations.map((evalItem) => (
                <Card
                  key={evalItem.jurorId}
                  className="border shadow-sm rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {evalItem.jurorName}{" "}
                        <span className="text-gray-500 text-sm">
                          ({evalItem.jurorNumber})
                        </span>
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        Recommendation:{" "}
                        <span
                          className={
                            evalItem.strikeRecommendation === "STRIKE_FOR_CAUSE"
                              ? "text-red-600 font-bold"
                              : evalItem.strikeRecommendation ===
                                "PEREMPTORY_STRIKE"
                              ? "text-yellow-700 font-bold"
                              : "text-green-700 font-bold"
                          }
                        >
                          {evalItem.strikeRecommendation.replace(/_/g, " ")}
                        </span>
                      </p>

                      <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                        {evalItem.strikeReason}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p>No evaluations found for this session.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default StrikeRecommendationsSection;
