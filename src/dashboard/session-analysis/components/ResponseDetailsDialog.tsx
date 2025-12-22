/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquareText,
  User,
  Hash,
  Gauge,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  Scale,
} from "lucide-react";
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
      const sessionId =
        response.sessionId ||
        response.question?.sessionId ||
        response?.sessionId;
      const jurorId = response.juror?.id;
      if (!sessionId || !jurorId) return;
      try {
        setJurorDetailLoading(true);
        setJurorDetailError("");
        const { data } = await BaseUrl.get(
          `/scores/session/${sessionId}/juror/${jurorId}/details`
        );
        setJurorDetail(data);
      } catch (e: any) {
        setJurorDetailError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load juror analysis"
        );
      } finally {
        setJurorDetailLoading(false);
      }
    };
    fetchDetails();
  }, [open, response]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[92vw] max-h-[85vh] overflow-y-auto text-[0.95rem] leading-relaxed">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-blue-600" />
            Juror Response Details
          </DialogTitle>
          <DialogDescription>
            Full response, question, and AI assessment
          </DialogDescription>
        </DialogHeader>

        {response ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage
                  src={generateAvatar(
                    jurorDetail?.score?.juror?.name || "",
                    jurorDetail?.score?.juror?.gender
                  )}
                  alt={jurorDetail?.score?.juror?.name}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {initials(jurorDetail?.score?.juror?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="block text-sm font-semibold">
                  #{jurorDetail?.score?.juror?.jurorNumber}
                </span>
                <span className="text-sm ml-1">
                  {jurorDetail?.score?.juror?.name || "—"}
                </span>
              </div>
            </div>

            {/* Scores */}
            {jurorDetail?.score && (
              <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Gauge className="h-4 w-4 text-indigo-600" /> Scores
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
                    <div className="text-emerald-700 text-sm">Overall</div>
                    <div className="mt-1 text-lg font-bold text-emerald-700">
                      {jurorDetail.score.overallScore?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
                    <div className="text-blue-700 text-sm">Average</div>
                    <div className="mt-1 text-lg font-bold text-blue-700">
                      {jurorDetail.score.averageScore?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
                    <div className="text-amber-700 text-sm">Bias</div>
                    <div className="mt-1 text-lg font-bold text-amber-700">
                      {jurorDetail.score.biasScore?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-violet-100 bg-violet-50 p-3 text-center">
                    <div className="text-violet-700 text-sm">
                      Suitability Rank
                    </div>
                    <div className="mt-1 text-lg font-bold text-violet-700">
                      {jurorDetail.score.suitabilityRank?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-slate-700 text-sm">Questions</div>
                    <div className="mt-1 text-lg font-bold text-slate-800">
                      {jurorDetail?.scoreAnalysis?.totalQuestions?.toFixed(2) ??
                        "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center">
                    <div className="text-emerald-700 text-sm">High</div>
                    <div className="mt-1 text-lg font-bold text-emerald-700">
                      {jurorDetail?.scoreAnalysis?.highScores?.toFixed(2) ??
                        "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-center">
                    <div className="text-amber-700 text-sm">Medium</div>
                    <div className="mt-1 text-lg font-bold text-amber-700">
                      {jurorDetail?.scoreAnalysis?.mediumScores?.toFixed(2) ??
                        "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-center">
                    <div className="text-rose-700 text-sm">Low</div>
                    <div className="mt-1 text-lg font-bold text-rose-700">
                      {jurorDetail?.scoreAnalysis?.lowScores?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-center">
                    <div className="text-indigo-700 text-sm">Avg Score</div>
                    <div className="mt-1 text-lg font-bold text-indigo-700">
                      {jurorDetail?.scoreAnalysis?.averageScore?.toFixed(2) ??
                        "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API-provided assessments list */}
            {jurorDetail?.assessments &&
              Array.isArray(jurorDetail.assessments) &&
              jurorDetail.assessments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquareText className="h-4 w-4 text-indigo-600" />
                    Individual Assessments
                  </div>
                  <div className="space-y-3">
                    {jurorDetail.assessments.map((a: any) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
                      >
                        <div className="text-sm text-slate-600 mb-1">
                          <span className="font-bold">Question : </span>{" "}
                          {a.response?.question?.question}
                        </div>
                        <div className="text-base text-slate-800 bg-slate-50 rounded-md p-2 mb-2 border border-slate-100">
                          <span className="font-semibold">
                            Juror Response :{" "}
                          </span>{" "}
                          {a.response?.response}
                        </div>
                        <div className="text-sm text-slate-700 flex items-start gap-2">
                          <LineChart className="h-10 w-10 text-emerald-600 mt-0.5" />{" "}
                          <span>
                            {" "}
                            <span className="font-bold">
                              AI Assessment:
                            </span>{" "}
                            {a.assessment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Score Analysis */}
            {/* Score Analysis merged into Scores section to avoid repetition */}

            {/* Strengths */}
            {Array.isArray(jurorDetail?.strengths) && (
              <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Strengths
                </div>
                {jurorDetail.strengths.length > 0 ? (
                  <div className="space-y-2">
                    {jurorDetail.strengths.map((s: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-800">
                        {s.question && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {s.question}
                          </div>
                        )}
                        {s.reasoning && <div>{s.reasoning}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No strengths listed.
                  </div>
                )}
              </div>
            )}

            {/* Weaknesses */}
            {Array.isArray(jurorDetail?.weaknesses) && (
              <div className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" /> Weaknesses
                </div>
                {jurorDetail.weaknesses.length > 0 ? (
                  <div className="space-y-2">
                    {jurorDetail.weaknesses.map((w: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-800">
                        {w.question && (
                          <div className="text-sm text-muted-foreground mb-1">
                            {w.question}
                          </div>
                        )}
                        {w.reasoning && (
                          <div className="text-base">{w.reasoning}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No weaknesses listed.
                  </div>
                )}
              </div>
            )}

            {/* Bias Analysis */}
            {Array.isArray(jurorDetail?.biasAnalysis) && (
              <div className="rounded-xl border border-amber-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-50">
                  <Scale className="h-4 w-4 text-amber-600" />
                  <span className="text-base font-semibold text-slate-900">
                    Bias Analysis
                  </span>
                </div>
                {jurorDetail.biasAnalysis.length > 0 ? (
                  <ul className="divide-y divide-amber-50">
                    {jurorDetail.biasAnalysis.map((b: any, idx: number) => (
                      <li key={idx} className="px-4 py-3 space-y-1">
                        {b.question && (
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            {b.question}
                          </p>
                        )}
                        {b.biasAnalysis && (
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {b.biasAnalysis}
                          </p>
                        )}
                        {!b.biasAnalysis && !b.question && (
                          <p className="text-sm text-muted-foreground">
                            No details provided.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No bias analysis listed.
                  </div>
                )}
              </div>
            )}
            {!jurorDetailLoading &&
              !jurorDetailError &&
              (!jurorDetail ||
                (!jurorDetail.assessments && !jurorDetail.score)) && (
                <div className="text-sm text-muted-foreground">
                  No analysis available.
                </div>
              )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No response selected.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
