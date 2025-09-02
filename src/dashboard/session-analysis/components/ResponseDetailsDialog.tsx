/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareText, User, Hash } from "lucide-react";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { useEffect, useState } from "react";
import BaseUrl from "@/utils/config/baseUrl";

export function ResponseDetailsDialog({
  open,
  onOpenChange,
  response,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  response: any | null;
}) {
  const initials = (name?: string) =>
    (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const [jurorDetailLoading, setJurorDetailLoading] = useState(false);
  const [jurorDetailError, setJurorDetailError] = useState("");
  const [jurorDetail, setJurorDetail] = useState<any | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !response) return;
      const sessionId = response.sessionId || response.question?.sessionId || response?.sessionId;
      const jurorId = response.juror?.id;
      if (!sessionId || !jurorId) return;
      try {
        setJurorDetailLoading(true);
        setJurorDetailError("");
        const { data } = await BaseUrl.get(`/scores/session/${sessionId}/juror/${jurorId}/details`);
        setJurorDetail(data);
      } catch (e: any) {
        setJurorDetailError(e?.response?.data?.message || e?.message || "Failed to load juror analysis");
      } finally {
        setJurorDetailLoading(false);
      }
    };
    fetchDetails();
  }, [open, response]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[92vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-blue-600" />
            Juror Response Details
          </DialogTitle>
          <DialogDescription>Full response, question, and AI assessment</DialogDescription>
        </DialogHeader>

        {response ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage src={generateAvatar(jurorDetail?.score?.juror?.name || "")} alt={jurorDetail?.score?.juror?.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{initials(jurorDetail?.score?.juror?.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="font-semibold truncate">{jurorDetail?.score?.juror?.name || "—"}</div>
                </div>
                {jurorDetail?.score?.juror?.jurorNumber && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Hash className="h-3 w-3" />
                    {jurorDetail?.score?.juror?.jurorNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Score (plain values, API-only) */}
            {jurorDetail?.score && (
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="text-sm font-semibold mb-2">Scores</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Overall</div>
                    <div className="font-medium">{jurorDetail.score.overallScore}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Average</div>
                    <div className="font-medium">{jurorDetail.score.averageScore}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Bias</div>
                    <div className="font-medium">{jurorDetail.score.biasScore}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground">Suitability Rank</div>
                    <div className="font-medium">{jurorDetail.score.suitabilityRank}</div>
                  </div>
                  {jurorDetail.scoreAnalysis && (
                    <>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Total Questions</div>
                        <div className="font-medium">{jurorDetail.scoreAnalysis.totalQuestions}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">High Scores</div>
                        <div className="font-medium">{jurorDetail.scoreAnalysis.highScores}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Medium Scores</div>
                        <div className="font-medium">{jurorDetail.scoreAnalysis.mediumScores}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Low Scores</div>
                        <div className="font-medium">{jurorDetail.scoreAnalysis.lowScores}</div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                        <div className="font-medium">{jurorDetail.scoreAnalysis.averageScore}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* API-provided assessments list */}
            {jurorDetail?.assessments && Array.isArray(jurorDetail.assessments) && jurorDetail.assessments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquareText className="h-4 w-4 text-slate-700" />
                  Individual Assessments
                </div>
                <div className="space-y-3">
                  {jurorDetail.assessments.map((a: any) => (
                    <div key={a.id} className="rounded-lg border border-slate-100 bg-white p-3">
                      <div className="text-xs text-muted-foreground mb-1">{a.response?.question?.question}</div>
                      <div className="text-sm text-slate-700 bg-slate-50 rounded p-2 mb-2">{a.response?.response}</div>
                      <div className="text-xs text-slate-600">Assessment: {a.assessment}</div>
                      {/* Removed repeated numeric scores to avoid duplication with the Scores section */}
                      {a.biasAnalysis && <div className="text-[11px] text-muted-foreground">Bias: {a.biasAnalysis}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score Analysis */}
            {/* Score Analysis merged into Scores section to avoid repetition */}

            {/* Strengths */}
            {Array.isArray(jurorDetail?.strengths) && (
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="text-sm font-semibold mb-2">Strengths</div>
                {jurorDetail.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {jurorDetail.strengths.map((s: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700">
                        {s.question && <div className="text-xs text-muted-foreground mb-1">{s.question}</div>}
                        {s.reasoning && <div>{s.reasoning}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No strengths listed.</div>
                )}
              </div>
            )}

            {/* Weaknesses */}
            {Array.isArray(jurorDetail?.weaknesses) && (
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="text-sm font-semibold mb-2">Weaknesses</div>
                {jurorDetail.weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {jurorDetail.weaknesses.map((w: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700">
                        {w.question && <div className="text-xs text-muted-foreground mb-1">{w.question}</div>}
                        {w.reasoning && <div>{w.reasoning}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No weaknesses listed.</div>
                )}
              </div>
            )}

            {/* Bias Analysis */}
            {Array.isArray(jurorDetail?.biasAnalysis) && (
              <div className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="text-sm font-semibold mb-2">Bias Analysis</div>
                {jurorDetail.biasAnalysis.length > 0 ? (
                  <div className="space-y-2">
                    {jurorDetail.biasAnalysis.map((b: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700">
                        {b.question && <div className="text-xs text-muted-foreground mb-1">{b.question}</div>}
                        {b.biasAnalysis && <div>{b.biasAnalysis}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No bias analysis listed.</div>
                )}
              </div>
            )}
            {!jurorDetailLoading && !jurorDetailError && (!jurorDetail || (!jurorDetail.assessments && !jurorDetail.score)) && (
              <div className="text-sm text-muted-foreground">No analysis available.</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No response selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


