import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from "lucide-react";
import type { Juror } from "./types";
import { generateAvatar } from "./utils";
import { useState, useEffect, useMemo } from "react";
import { getJurorDetailsAnalysisApi } from "@/api/api";

interface JurorDetailsDialogProps {
  juror: Juror | null;
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

interface JurorAnalysisResponse {
  score: {
    overallScore?: number;
    averageScore?: number;
    biasScore?: number;
    suitabilityRank?: number | string;
    [key: string]: unknown;
  };
  juror: Partial<Juror> & {
    status?: string;
  };
  assessments: Array<{
    assessment?: string;
    score?: number;
    reasoning?: string;
    biasAnalysis?: string | Record<string, unknown>;
    suitabilityScore?: number;
    question?: { id?: string; text?: string; questionType?: string };
    response?: { id?: string; text?: string; responseType?: string; createdAt?: string };
  }>;
  scoreAnalysis?: {
    totalQuestions?: number;
    high?: number;
    medium?: number;
    low?: number;
    [key: string]: unknown;
  };
  strengths?: Array<{ questionId?: string; text?: string; reason?: string }> | string[];
  weaknesses?: Array<{ questionId?: string; text?: string; reason?: string }> | string[];
  biasAnalysis?: Array<{ questionId?: string; bias?: string; details?: string }> | Record<string, unknown>;
}

type JurorProfile = Partial<Juror> & { status?: string };

export function JurorDetailsDialog({ juror, isOpen, onClose, sessionId }: JurorDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JurorAnalysisResponse | null>(null);

  const jurorInitials = useMemo(() => {
    const name = analysis?.juror?.name || juror?.name || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  }, [analysis?.juror?.name, juror?.name]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !juror?.id || !sessionId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getJurorDetailsAnalysisApi(sessionId, juror.id);
        setAnalysis(res?.data || res);
      } catch (e: unknown) {
        const message = e && typeof e === "object" && "message" in e ? String((e as { message?: unknown }).message) : null;
        setError(message || "Failed to load juror details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, juror?.id, sessionId]);

  const strengthsList: string[] = useMemo(() => {
    const s = analysis?.strengths;
    if (!s) return [];
    if (Array.isArray(s)) {
      return s.map((item) => (typeof item === "string" ? item : item?.text || item?.reason || "-"));
    }
    return [];
  }, [analysis?.strengths]);

  const weaknessesList: string[] = useMemo(() => {
    const w = analysis?.weaknesses;
    if (!w) return [];
    if (Array.isArray(w)) {
      return w.map((item) => (typeof item === "string" ? item : item?.text || item?.reason || "-"));
    }
    return [];
  }, [analysis?.weaknesses]);

  if (!juror) return null;

  const jurorProfile: JurorProfile = (analysis?.juror as JurorProfile) || (juror as JurorProfile);
  const overall = analysis?.score;
  const scoreBreakdown = analysis?.scoreAnalysis;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white mx-4" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Juror Details
            </DialogTitle>
          </div>
          <DialogDescription>Detailed juror analysis and profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          {/* Header with juror basic info */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
                <AvatarImage src={generateAvatar(jurorProfile?.name || "", jurorProfile?.gender) || "/placeholder.svg"} alt={jurorProfile?.name || "Juror"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-lg font-semibold">
                  {jurorInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{jurorProfile?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {jurorProfile?.jurorNumber && (
                  <Badge variant="outline" className="font-medium text-xs">Juror #{jurorProfile.jurorNumber}</Badge>
                )}
                {jurorProfile && jurorProfile.status && (
                  <Badge variant="secondary" className="text-xs">{jurorProfile.status}</Badge>
                )}
                {juror.isStrikedOut && (
                  <Badge variant="destructive" className="text-xs">STRUCK</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Loading / Error states */}
          {loading && (
            <Card>
              <CardContent className="py-6 text-center text-gray-600">Loading juror analysis...</CardContent>
            </Card>
          )}
          {error && (
            <Card>
              <CardContent className="py-6 text-center text-red-600">{error}</CardContent>
            </Card>
          )}

          {/* Overall scores */}
          {overall && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Overall Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-gray-500">Overall Score</p>
                    <p className="text-lg font-semibold">{overall.overallScore ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-gray-500">Average Score</p>
                    <p className="text-lg font-semibold">{overall.averageScore ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-gray-500">Bias Score</p>
                    <p className="text-lg font-semibold">{overall.biasScore ?? "-"}</p>
                  </div>
                  <div className="p-3 rounded-md bg-slate-50">
                    <p className="text-xs text-gray-500">Suitability Rank</p>
                    <p className="text-lg font-semibold">{overall.suitabilityRank ?? "-"}</p>
                  </div>
                </div>
                {scoreBreakdown && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-3 rounded-md bg-green-50">
                      <p className="text-xs text-gray-600">High</p>
                      <p className="text-base font-semibold">{scoreBreakdown.high ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-md bg-amber-50">
                      <p className="text-xs text-gray-600">Medium</p>
                      <p className="text-base font-semibold">{scoreBreakdown.medium ?? 0}</p>
                    </div>
                    <div className="p-3 rounded-md bg-red-50">
                      <p className="text-xs text-gray-600">Low</p>
                      <p className="text-base font-semibold">{scoreBreakdown.low ?? 0}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Juror #</p>
                    <p className="text-base">{jurorProfile?.jurorNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Gender</p>
                    <p className="text-base">{jurorProfile?.gender || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Race</p>
                    <p className="text-base">{jurorProfile?.race || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Age</p>
                    <p className="text-base">{jurorProfile?.age ?? "-"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Occupation</p>
                    <p className="text-base">{jurorProfile?.occupation || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Education</p>
                    <p className="text-base">{jurorProfile?.education || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Marital Status</p>
                    <p className="text-base">{jurorProfile?.maritalStatus || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Children</p>
                    <p className="text-base">{jurorProfile?.children || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessments */}
          {analysis?.assessments && analysis.assessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.assessments.map((a, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-white space-y-2">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Question:</span> {a.question?.text || "-"}
                      </div>
                      <div className="flex gap-2 text-xs">
                        {typeof a.score !== "undefined" && <Badge variant="outline">Score: {a.score}</Badge>}
                        {typeof a.suitabilityScore !== "undefined" && <Badge variant="secondary">Suitability: {a.suitabilityScore}</Badge>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Response:</span> {a.response?.text || "-"}
                    </div>
                    {a.assessment && (
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Assessment:</span> {a.assessment}
                      </div>
                    )}
                    {a.reasoning && (
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Reasoning:</span> {a.reasoning}
                      </div>
                    )}
                    {a.biasAnalysis && (
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Bias Analysis:</span> {typeof a.biasAnalysis === "string" ? a.biasAnalysis : JSON.stringify(a.biasAnalysis)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Strengths & Weaknesses */}
          {(strengthsList.length > 0 || weaknessesList.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {strengthsList.length > 0 ? (
                    strengthsList.map((s, i) => (
                      <div key={i} className="text-sm text-gray-700">{s}</div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No strengths listed.</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weaknesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {weaknessesList.length > 0 ? (
                    weaknessesList.map((w, i) => (
                      <div key={i} className="text-sm text-gray-700">{w}</div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No weaknesses listed.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bias Analysis */}
          {analysis?.biasAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Bias Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.isArray(analysis.biasAnalysis) ? (
                  (analysis.biasAnalysis as Array<{ bias?: string; details?: string; text?: string }>).map((b, i) => (
                    <div key={i} className="text-sm text-gray-700">
                      {b?.bias || b?.details ? (
                        <>
                          {b?.bias && <span className="font-semibold">{b.bias}: </span>}
                          <span>{b?.details || b?.text || "-"}</span>
                        </>
                      ) : (
                        JSON.stringify(b)
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-700">{JSON.stringify(analysis.biasAnalysis)}</div>
                )}
              </CardContent>
            </Card>
          )}

          {!sessionId && (
            <Card>
              <CardContent className="py-4 text-sm text-gray-600">No session selected. Pass a sessionId to load analysis.</CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
