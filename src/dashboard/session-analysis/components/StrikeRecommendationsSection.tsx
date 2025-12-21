import { useEffect, useState, useMemo } from "react";
import { generateStrikeRecommendationsApi } from "@/api/api";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderTag from "@/components/shared/card-header";
import {
  FileText,
  TriangleAlert,
  Gavel,
  CheckCircle2,
  StickyNote,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface JurorNote {
  id: string;
  note: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface questionsAndAnswer {
  questionId: string;
  question: string;
  questionType: string;
  answer: string;
}

interface StrikeRecommendation {
  jurorId: string;
  jurorName: string;
  jurorNumber: string;
  panelPosition?: number | null;
  recommendation: string;
  reason: string;
  jurorNotes: JurorNote[];
  questionsAndAnswers: questionsAndAnswer[];
}

export interface StrikeRecommendationsResponse {
  message: string;
  sessionId: string;
  recommendationsGenerated: number;
  totalRecommendationsReturned: number;
  summary: {
    strikeForCause: number;
    peremptoryStrike: number;
    total: number;
  };
  results: StrikeRecommendation[];
}

interface TokenErrorResponse {
  error?: string;
  message?: string;
  tokensRemaining?: number;
  tokensRequired?: number;
  resetDate?: string;
  feature?: string;
}

const StrikeRecommendationsSection = ({
  sessionId,
  sessionStatus,
  onDataLoaded,
}: {
  sessionId: string;
  sessionStatus?: string;
  onDataLoaded?: (data: StrikeRecommendationsResponse) => void;
}) => {
  const [strikeRecommendations, setStrikeRecommendations] =
    useState<StrikeRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<TokenErrorResponse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null
  >(null);

  // Check if session is completed (case-insensitive)
  const isSessionCompleted = useMemo(() => {
    return sessionStatus?.toUpperCase() === "COMPLETED";
  }, [sessionStatus]);

  const fetchStrikeRecommendations = async () => {
    if (!sessionId) return;

    // Only fetch if session is completed
    if (!isSessionCompleted) {
      return;
    }

    setLoading(true);
    setError(null);
    setTokenError(null);

    try {
      const data = await generateStrikeRecommendationsApi(sessionId);
      setStrikeRecommendations(data);
      onDataLoaded?.(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Check if it's a token error (429 status or "Insufficient AI tokens" error)
      const responseData = err?.response?.data || {};
      const isTokenError =
        err?.response?.status === 429 ||
        responseData?.error === "Insufficient AI tokens" ||
        err?.message?.includes("429") ||
        err?.message?.includes("Insufficient AI tokens");

      if (isTokenError) {
        // It's a token expiration error - use response data or create from error message
        setTokenError({
          error: responseData.error || "Insufficient AI tokens",
          message:
            responseData.message ||
            "Your organization has run out of AI tokens for this billing period.",
          tokensRemaining: responseData.tokensRemaining ?? 0,
          tokensRequired: responseData.tokensRequired,
          resetDate: responseData.resetDate,
          feature: responseData.feature,
        });
      } else {
        // Check if it's a "session not completed" error
        if (
          responseData?.error === "Session not completed" ||
          err?.response?.status === 400
        ) {
          setError(
            responseData?.message ||
              "Strike recommendations can only be generated for completed sessions."
          );
        } else {
          // It's a regular error
          setError(err.message || "Failed to fetch strike recommendations");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if session is completed and sessionId exists
    if (sessionId && isSessionCompleted) {
      fetchStrikeRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isSessionCompleted]);

  // Show message if session is not completed
  if (!isSessionCompleted) {
    return (
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Strike Recommendations
                </h3>
                <p className="text-blue-800">
                  Strike recommendations will be automatically generated when
                  the session is completed. Please complete the session first to
                  view AI-generated strike recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-8">
        <Card className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
              <p className="text-gray-600">Loading strike recommendations...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show token expired card instead of error
  if (tokenError) {
    const resetDate = tokenError.resetDate
      ? new Date(tokenError.resetDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return (
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  AI Tokens Expired
                </h3>
                <p className="text-amber-800 mb-4">
                  Your organization has run out of AI tokens for this billing
                  period. Strike recommendations require AI tokens to generate.
                </p>
                {resetDate && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <RefreshCw className="h-4 w-4" />
                    <span>
                      Tokens will reset on <strong>{resetDate}</strong>
                    </span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-sm text-amber-700">
                    <strong>Tokens Required:</strong>{" "}
                    {tokenError.tokensRequired?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-sm text-amber-700">
                    <strong>Tokens Remaining:</strong>{" "}
                    {tokenError.tokensRemaining?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 shadow-lg rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Loading Strike Recommendations
                </h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if no recommendations and no errors (still loading or no data)
  if (!strikeRecommendations && !loading && !error && !tokenError) {
    return null;
  }

  if (!strikeRecommendations) return null;

  const summaryCards = [
    {
      label: "Strike for Cause",
      value: strikeRecommendations.summary?.strikeForCause ?? 0,
      icon: TriangleAlert,
      color: "text-red-600",
      bg: "bg-red-100",
      filterType: "STRIKE_FOR_CAUSE" as const,
    },
    {
      label: "Peremptory Strikes",
      value: strikeRecommendations.summary?.peremptoryStrike ?? 0,
      icon: Gavel,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      filterType: "PEREMPTORY_STRIKE" as const,
    },
    {
      label: "Total",
      value: strikeRecommendations.summary?.total ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
      filterType: null,
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
            {summaryCards.map((card) => {
              const isSelected = selectedFilter === card.filterType;
              return (
                <Card
                  key={card.label}
                  onClick={() => setSelectedFilter(card.filterType)}
                  className={`p-4 flex items-center gap-4 shadow-sm border rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-blue-500 border-blue-500 shadow-md"
                      : "hover:shadow-md hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`p-3 rounded-full ${card.bg} ${
                      isSelected ? "ring-2 ring-blue-300" : ""
                    }`}
                  >
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p
                      className={`text-xl font-semibold ${
                        isSelected ? "text-blue-700" : ""
                      }`}
                    >
                      {card.value}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Evaluations */}
          <div className="space-y-4">
            {(() => {
              const filteredResults =
                strikeRecommendations.results?.filter((evalItem) => {
                  // Filter based on selected filter type
                  if (selectedFilter === null) return true; // Show all
                  return evalItem.recommendation === selectedFilter;
                }) || [];

              return filteredResults.length > 0 ? (
                filteredResults.map((evalItem) => (
                  <Card
                    key={evalItem.jurorId}
                    className="border shadow-sm rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          {evalItem.jurorName}{" "}
                          <span className="text-gray-500 text-sm">
                            (
                            {evalItem.panelPosition !== null &&
                            evalItem.panelPosition !== undefined
                              ? `Panel #${evalItem.panelPosition}`
                              : evalItem.jurorNumber
                              ? `#${evalItem.jurorNumber}`
                              : "—"}
                            )
                          </span>
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          Recommendation:{" "}
                          <span
                            className={
                              evalItem.recommendation === "STRIKE_FOR_CAUSE"
                                ? "text-red-600 font-bold"
                                : evalItem.recommendation ===
                                  "PEREMPTORY_STRIKE"
                                ? "text-yellow-700 font-bold"
                                : "text-green-700 font-bold"
                            }
                          >
                            {evalItem.recommendation.replace(/_/g, " ")}
                          </span>
                        </p>

                        <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                          <strong>Strike Reason</strong>
                          {evalItem.reason}
                        </p>

                        {/* Juror Notes */}
                        {evalItem.jurorNotes.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <StickyNote className="h-4 w-4" /> Notes:
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 ml-2">
                              {evalItem.jurorNotes.map((note) => {
                                const noteDate = new Date(note.createdAt);
                                const formattedDate =
                                  noteDate.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  });
                                return (
                                  <li key={note.id} className="pl-2">
                                    <strong>{note.user}</strong> {note.note}{" "}
                                    <span className="text-gray-400 text-xs">
                                      ({formattedDate})
                                    </span>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        )}

                        {/* Influential Questions */}
                        {evalItem.questionsAndAnswers.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold mb-3">
                              Influential Questions:
                            </p>
                            <div className="space-y-3">
                              {evalItem.questionsAndAnswers.map((qId, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r-md"
                                >
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    {idx + 1}. {qId.question}
                                  </div>
                                  <div className="text-sm text-gray-700 font-semibold">
                                    Answer:{" "}
                                    <span className="text-blue-700">
                                      {qId.answer}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="bg-white border shadow-sm rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-gray-400" />
                      <p className="text-gray-600">
                        {selectedFilter === "STRIKE_FOR_CAUSE"
                          ? "No Strike for Cause recommendations found."
                          : selectedFilter === "PEREMPTORY_STRIKE"
                          ? "No Peremptory Strike recommendations found."
                          : "No strike recommendations available for this session."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrikeRecommendationsSection;
