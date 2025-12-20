import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateStrikeRecommendationsApi } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardHeaderTag from "@/components/shared/card-header";
import { FileText, TriangleAlert, Gavel, CheckCircle2, StickyNote } from "lucide-react";

interface JurorNote {
  id: string;
  note: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface questionsAndAnswer {
  questionId:string;
  question: string;
  questionType: string;
  answer: string;
}

interface StrikeRecommendation {
  jurorId: string;
  jurorName: string;
  jurorNumber: string;
  recommendation: string;
  reason: string;
  jurorNotes: JurorNote[];
  questionsAndAnswers: questionsAndAnswer[];
}

export interface StrikeRecommendationsResponse {
  message: string;
  sessionId: string;
  recommendationsGenerated:number;
  totalRecommendationsReturned:number;
  summary: {
    strikeForCause: number;
    peremptoryStrike: number;
    total: number;
  };
  results: StrikeRecommendation[];
}

const StrikeRecommendationsSection = ({
  sessionId,
  onDataLoaded,
}: {
  sessionId: string;
  onDataLoaded?: (data: StrikeRecommendationsResponse) => void;
}) => {
  const [strikeRecommendations, setStrikeRecommendations] = useState<StrikeRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStrikeRecommendations = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await generateStrikeRecommendationsApi(sessionId);
      setStrikeRecommendations(data);
      onDataLoaded?.(data);
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
      value: strikeRecommendations.summary?.strikeForCause ?? 0,
      icon: TriangleAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Peremptory Strikes",
      value: strikeRecommendations.summary?.peremptoryStrike ?? 0,
      icon: Gavel,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Total",
      value: strikeRecommendations.summary?.total ?? 0,
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
              <Card key={card.label} className="p-4 flex items-center gap-4 shadow-sm border rounded-xl">
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
            {strikeRecommendations.results?.length > 0 ? (
              strikeRecommendations.results.map((evalItem) => (
                <Card key={evalItem.jurorId} className="border shadow-sm rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {evalItem.jurorName}{" "}
                        <span className="text-gray-500 text-sm">({evalItem.jurorNumber})</span>
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        Recommendation:{" "}
                        <span
                          className={
                            evalItem.recommendation === "STRIKE_FOR_CAUSE"
                              ? "text-red-600 font-bold"
                              : evalItem.recommendation === "PEREMPTORY_STRIKE"
                              ? "text-yellow-700 font-bold"
                              : "text-green-700 font-bold"
                          }
                        >
                          {evalItem.recommendation.replace(/_/g, " ")}
                        </span>
                      </p>

                      <p className="mt-2 text-gray-700 text-sm leading-relaxed"><strong>Strike Reason</strong>{evalItem.reason}</p>

                      {/* Juror Notes */}
                      {evalItem.jurorNotes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            <StickyNote className="h-4 w-4" /> Notes:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {evalItem.jurorNotes.map((note) => (
                              <li key={note.id}>
                                <strong>{note.user}:</strong> {note.note}{" "}
                                <span className="text-gray-400 text-xs">
                                  ({new Date(note.createdAt).toLocaleString()})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Influential Questions */}
                      {evalItem.questionsAndAnswers.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold">Influential Questions:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {evalItem.questionsAndAnswers.map((qId, idx) => (
                              <li key={idx}>{qId.question} <strong> {qId.answer}</strong></li>
          
                            ))}
                          </ul>
                        </div>
                      )}
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
