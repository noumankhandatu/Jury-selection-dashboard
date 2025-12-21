/* eslint-disable @typescript-eslint/no-unused-vars */
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
import {
  LayoutGrid,
  List,
  Search,
  User,
  Hash,
  Gauge as GaugeIcon,
} from "lucide-react";
import JurorMiniCard from "./JurorMiniCard";
import { ResponseDetailsDialog } from "./ResponseDetailsDialog";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { BiasGauge } from "@/components/shared/bias-gauge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getJurorsByStrikeTypeApi } from "@/api/api";
import { toast } from "sonner";
import { AlertCircle, Scale, X } from "lucide-react";
// no Badge used here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Juror } from "@/dashboard/manage-jurors/components/types";

// helper to map bestJurors API item to display juror
const mapBestJurorToDisplay = (
  item: any,
  session: any
): { juror: Juror; score: number | null; id: string } => {
  const j = item?.juror || {};
  const scoreVal =
    typeof item?.overallScore === "number" ? item.overallScore : null;
  let bias: "low" | "moderate" | "high" = "low";
  if (typeof scoreVal === "number") {
    if (scoreVal < 60) bias = "high";
    else if (scoreVal < 80) bias = "moderate";
    else bias = "low";
  }
  const juror: Juror = {
    id: String(j.id ?? item.id ?? ""),
    name: j.name ?? "Unknown Juror",
    age: Number(j.age ?? 0),
    occupation: j.occupation ?? "Not Specified",
    education: j.education ?? "Not Specified",
    experience: j.experience ?? "Not Specified",
    location: j.location ?? j.county ?? "",
    availability: j.availability ?? "Available",
    email: j.email ?? "",
    phone: j.phone ?? "",
    address: j.address ?? "",
    biasStatus: bias,
    caseId: String(j.caseId ?? session?.caseId ?? ""),
    isStrikedOut: Boolean(j.isStrikedOut),
    dateOfBirth: j.dateOfBirth ?? "",
    race: j.race ?? "",
    gender: j.gender ?? "",
    employer: j.employer ?? "",
    maritalStatus: j.maritalStatus ?? "",
    citizenship: j.citizenship ?? "",
    county: j.county ?? "",
    tdl: j.tdl ?? "",
    workPhone: j.workPhone ?? "",
    employmentDuration: j.employmentDuration ?? "",
    children: j.children ?? "",
    panelPosition: j.panelPosition ?? null,
    jurorNumber: j.jurorNumber ?? "",
    criminalCase: j.criminalCase ?? "",
    accidentalInjury: j.accidentalInjury ?? "",
    civilJury: j.civilJury ?? "",
    criminalJury: j.criminalJury ?? "",
    spouse: j.spouse ?? "",
    mailingAddress: j.mailingAddress ?? "",
  } as Juror;
  return {
    juror,
    score: scoreVal,
    id: String(item.id ?? j.id ?? Math.random()),
  };
};

export function SessionOverview({
  sessionStats,
  session,
  bestJurors,
  onBucketClick,
  selectedBucket,
}: {
  sessionStats: any | null;
  session?: any | null;
  bestJurors?: any[] | null;
  onBucketClick?: (bucket: "low" | "mid" | "high") => void;
  selectedBucket?: "low" | "mid" | "high" | null;
}) {
  const [activeResponse, setActiveResponse] = useState<any | null>(null);
  const effectiveSessionId = session?.id || sessionStats?.session?.id;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedStrikeType, setSelectedStrikeType] = useState<"STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null>(null);
  const [strikeJurors, setStrikeJurors] = useState<any[] | null>(null);
  const [strikeCounts, setStrikeCounts] = useState<{ strikeForCause: number; peremptoryStrike: number } | null>(null);
  
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
              className={`cursor-pointer rounded-lg border p-5 text-center shadow-lg hover:shadow-xl ${
                selectedBucket === "low"
                  ? "bg-red-50 border-red-200 ring-2 ring-red-300"
                  : "bg-white"
              }`}
              onClick={async () => {
                onBucketClick?.("low");
                setSelectedStrikeType(null);
                setStrikeJurors(null);
                // Load existing strike counts when opening the "low" bucket
                if (effectiveSessionId) {
                  try {
                    const [causeResult, peremptoryResult] = await Promise.all([
                      getJurorsByStrikeTypeApi(effectiveSessionId, "STRIKE_FOR_CAUSE").catch(() => ({ performanceData: { lowPerformers: [] } })),
                      getJurorsByStrikeTypeApi(effectiveSessionId, "PEREMPTORY_STRIKE").catch(() => ({ performanceData: { lowPerformers: [] } }))
                    ]);
                    setStrikeCounts({
                      strikeForCause: causeResult?.performanceData?.lowPerformers?.length || 0,
                      peremptoryStrike: peremptoryResult?.performanceData?.lowPerformers?.length || 0
                    });
                  } catch (error) {
                    // Silently fail - counts will show "-" until user clicks a category
                  }
                }
              }}
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
              className={`cursor-pointer rounded-lg border p-5 text-center shadow-lg hover:shadow-xl ${
                selectedBucket === "mid"
                  ? "bg-amber-50 border-amber-200 ring-2 ring-amber-300"
                  : "bg-white"
              }`}
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
              className={`cursor-pointer rounded-lg border p-5 text-center shadow-lg hover:shadow-xl ${
                selectedBucket === "high"
                  ? "bg-green-50 border-green-200 ring-2 ring-green-300"
                  : "bg-white"
              }`}
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

          {/* Strike Categories - Show when "low" bucket is selected */}
          {selectedBucket === "low" && (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Strike Categories</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Strike for Cause */}
                <div
                  className={`cursor-pointer rounded-lg border p-5 text-center shadow-lg hover:shadow-xl transition-all ${
                    selectedStrikeType === "STRIKE_FOR_CAUSE"
                      ? "bg-orange-50 border-orange-300 ring-2 ring-orange-400"
                      : "bg-white border-gray-200"
                  }`}
                  onClick={async () => {
                    if (!effectiveSessionId) return;
                    setSelectedStrikeType("STRIKE_FOR_CAUSE");
                    try {
                      const result = await getJurorsByStrikeTypeApi(effectiveSessionId, "STRIKE_FOR_CAUSE");
                      const jurors = result?.performanceData?.lowPerformers || [];
                      setStrikeJurors(jurors);
                      setStrikeCounts(prev => ({ ...prev, strikeForCause: jurors.length } as any));
                    } catch (error: any) {
                      toast.error("Failed to fetch strike for cause jurors");
                      setStrikeJurors([]);
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2 text-gray-700 font-medium mb-2">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-orange-100 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">Strike for Cause</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Clear bias, conflict of interest, or legal grounds
                  </p>
                  <div className="mt-2 text-2xl font-bold text-orange-600">
                    {strikeCounts?.strikeForCause !== undefined
                      ? strikeCounts.strikeForCause
                      : selectedStrikeType === "STRIKE_FOR_CAUSE" && strikeJurors
                      ? strikeJurors.length
                      : "-"}
                  </div>
                </div>

                {/* Peremptory Strike */}
                <div
                  className={`cursor-pointer rounded-lg border p-5 text-center shadow-lg hover:shadow-xl transition-all ${
                    selectedStrikeType === "PEREMPTORY_STRIKE"
                      ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400"
                      : "bg-white border-gray-200"
                  }`}
                  onClick={async () => {
                    if (!effectiveSessionId) return;
                    setSelectedStrikeType("PEREMPTORY_STRIKE");
                    try {
                      const result = await getJurorsByStrikeTypeApi(effectiveSessionId, "PEREMPTORY_STRIKE");
                      const jurors = result?.performanceData?.lowPerformers || [];
                      setStrikeJurors(jurors);
                      setStrikeCounts(prev => ({ ...prev, peremptoryStrike: jurors.length } as any));
                    } catch (error: any) {
                      toast.error("Failed to fetch peremptory strike jurors");
                      setStrikeJurors([]);
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2 text-gray-700 font-medium mb-2">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-purple-100 text-purple-600">
                      <Scale className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">Peremptory Strike</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Strategic strike without legal cause required
                  </p>
                  <div className="mt-2 text-2xl font-bold text-purple-600">
                    {strikeCounts?.peremptoryStrike !== undefined
                      ? strikeCounts.peremptoryStrike
                      : selectedStrikeType === "PEREMPTORY_STRIKE" && strikeJurors
                      ? strikeJurors.length
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display strike jurors when a strike type is selected */}
          {selectedBucket === "low" && selectedStrikeType && Array.isArray(strikeJurors) && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-semibold text-gray-900">
                    {selectedStrikeType === "STRIKE_FOR_CAUSE" ? "Strike for Cause" : "Peremptory Strike"} Jurors
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedStrikeType(null);
                      setStrikeJurors(null);
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className="h-9"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="h-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative w-full max-w-sm mb-3">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or juror ID"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {strikeJurors.length > 0 ? (
                (() => {
                  const filtered = strikeJurors.filter((bj: any) => {
                    const mapped = mapBestJurorToDisplay(bj, session);
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    const name = (mapped.juror.name || "").toLowerCase();
                    const jn = String(
                      mapped.juror.jurorNumber || mapped.juror.id || ""
                    ).toLowerCase();
                    return name.includes(q) || jn.includes(q);
                  });

                  if (viewMode === "list") {
                    return (
                      <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                              <TableHead className="text-slate-700 font-semibold">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" /> Name
                                </div>
                              </TableHead>
                              <TableHead className="text-slate-700 font-semibold">
                                <div className="flex items-center gap-2">
                                  <Hash className="h-4 w-4 text-indigo-600" />{" "}
                                  Panel Position
                                </div>
                              </TableHead>
                              <TableHead className="text-right text-slate-700 font-semibold">
                                <div className="flex items-center gap-2 justify-end">
                                  <GaugeIcon className="h-4 w-4 text-emerald-600" />{" "}
                                  Score
                                </div>
                              </TableHead>
                              <TableHead className="text-right text-slate-700 font-semibold">
                                Action
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filtered.map((bj: any, idx: number) => {
                              const mapped = mapBestJurorToDisplay(bj, session);
                              const scoreNum =
                                typeof mapped.score === "number"
                                  ? Math.round(mapped.score)
                                  : null;
                              const scoreColor =
                                scoreNum === null
                                  ? "bg-slate-100 text-slate-700"
                                  : scoreNum < 60
                                  ? "bg-red-100 text-red-700"
                                  : scoreNum <= 79
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800";
                              return (
                                <TableRow
                                  key={mapped.id}
                                  className={
                                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                  }
                                >
                                  <TableCell className="font-medium text-slate-900">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                                        <AvatarImage
                                          src={generateAvatar(mapped.juror.name, mapped.juror.gender)}
                                          alt={mapped.juror.name}
                                        />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                          {String(mapped.juror.name || "?")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex items-center gap-2">
                                        {mapped.juror.name}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-slate-700">
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-indigo-500" />
                                      {mapped.juror.panelPosition !== null && mapped.juror.panelPosition !== undefined
                                        ? `#${mapped.juror.panelPosition}`
                                        : mapped.juror.jurorNumber
                                        ? `#${mapped.juror.jurorNumber}`
                                        : mapped.juror.id}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                      <div className="scale-75 origin-right">
                                        <BiasGauge
                                          biasStatus={mapped.juror.biasStatus}
                                          size="md"
                                          scorePercent={
                                            typeof mapped.score === "number"
                                              ? mapped.score
                                              : undefined
                                          }
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                      onClick={() => {
                                        setActiveResponse({
                                          id: mapped.id,
                                          sessionId: effectiveSessionId,
                                          juror: {
                                            id: mapped.juror.id,
                                            name: mapped.juror.name,
                                            jurorNumber: mapped.juror.jurorNumber,
                                          },
                                        });
                                      }}
                                    >
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  }

                  // grid view
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((bj: any) => {
                        const mapped = mapBestJurorToDisplay(bj, session);
                        return (
                          <JurorMiniCard
                            key={mapped.id}
                            juror={mapped.juror}
                            score={
                              typeof mapped.score === "number"
                                ? mapped.score
                                : null
                            }
                            strikeRecommendation={bj.strikeRecommendation || null}
                            onDetails={() => {
                              setActiveResponse({
                                id: mapped.id,
                                sessionId: effectiveSessionId,
                                juror: {
                                  id: mapped.juror.id,
                                  name: mapped.juror.name,
                                  jurorNumber: mapped.juror.jurorNumber,
                                },
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-600">
                    No jurors found for {selectedStrikeType === "STRIKE_FOR_CAUSE" ? "Strike for Cause" : "Peremptory Strike"}.
                  </p>
                </div>
              )}
            </div>
          )}

          {Array.isArray(bestJurors) && bestJurors.length > 0 && selectedBucket !== "low" && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or juror ID"
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className="h-9"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="h-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {(() => {
                // Use strikeJurors if viewing strike categories, otherwise use bestJurors
                const jurorsToDisplay = selectedBucket === "low" && selectedStrikeType && strikeJurors
                  ? strikeJurors
                  : bestJurors || [];

                const filtered = jurorsToDisplay.filter((bj: any) => {
                  // Filter out struck jurors from Top Jurors (high/mid buckets)
                  // They should only appear in the "low" bucket
                  if (selectedBucket !== "low" && (bj.strikeRecommendation === "STRIKE_FOR_CAUSE" || bj.strikeRecommendation === "PEREMPTORY_STRIKE")) {
                    return false;
                  }
                  
                  const mapped = mapBestJurorToDisplay(bj, session);
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  const name = (mapped.juror.name || "").toLowerCase();
                  const jn = String(
                    mapped.juror.jurorNumber || mapped.juror.id || ""
                  ).toLowerCase();
                  return name.includes(q) || jn.includes(q);
                });

                if (viewMode === "list") {
                  return (
                    <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <TableHead className="text-slate-700 font-semibold">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" /> Name
                              </div>
                            </TableHead>
                            <TableHead className="text-slate-700 font-semibold">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-indigo-600" />{" "}
                                Panel Position
                              </div>
                            </TableHead>
                            <TableHead className="text-right text-slate-700 font-semibold">
                              <div className="flex items-center gap-2 justify-end">
                                <GaugeIcon className="h-4 w-4 text-emerald-600" />{" "}
                                Score
                              </div>
                            </TableHead>
                            <TableHead className="text-right text-slate-700 font-semibold">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((bj: any, idx: number) => {
                            const mapped = mapBestJurorToDisplay(bj, session);
                            const scoreNum =
                              typeof mapped.score === "number"
                                ? Math.round(mapped.score)
                                : null;
                            const scoreColor =
                              scoreNum === null
                                ? "bg-slate-100 text-slate-700"
                                : scoreNum < 60
                                ? "bg-red-100 text-red-700"
                                : scoreNum <= 79
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800";
                            return (
                              <TableRow
                                key={mapped.id}
                                className={
                                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                }
                              >
                                <TableCell className="font-medium text-slate-900">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                                      <AvatarImage
                                        src={generateAvatar(mapped.juror.name, mapped.juror.gender)}
                                        alt={mapped.juror.name}
                                      />
                                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                        {String(mapped.juror.name || "?")
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2">
                                      {mapped.juror.name}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-700">
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-indigo-500" />
                                    {mapped.juror.panelPosition !== null && mapped.juror.panelPosition !== undefined
                                      ? `#${mapped.juror.panelPosition}`
                                      : mapped.juror.jurorNumber
                                      ? `#${mapped.juror.jurorNumber}`
                                      : mapped.juror.id}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    <div className="scale-75 origin-right">
                                      <BiasGauge
                                        biasStatus={mapped.juror.biasStatus}
                                        size="md"
                                        scorePercent={
                                          typeof mapped.score === "number"
                                            ? mapped.score
                                            : undefined
                                        }
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                    onClick={() => {
                                      setActiveResponse({
                                        id: mapped.id,
                                        sessionId: effectiveSessionId,
                                        juror: {
                                          id: mapped.juror.id,
                                          name: mapped.juror.name,
                                          jurorNumber: mapped.juror.jurorNumber,
                                        },
                                      });
                                    }}
                                  >
                                    Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                }

                // grid view
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((bj: any) => {
                      const mapped = mapBestJurorToDisplay(bj, session);
                      return (
                        <JurorMiniCard
                          key={mapped.id}
                          juror={mapped.juror}
                          score={
                            typeof mapped.score === "number"
                              ? mapped.score
                              : null
                          }
                          strikeRecommendation={bj.strikeRecommendation || null}
                          onDetails={() => {
                            setActiveResponse({
                              id: mapped.id,
                              sessionId: effectiveSessionId,
                              juror: {
                                id: mapped.juror.id,
                                name: mapped.juror.name,
                                jurorNumber: mapped.juror.jurorNumber,
                              },
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
      <ResponseDetailsDialog
        open={Boolean(activeResponse)}
        onOpenChange={(open) => {
          if (!open) setActiveResponse(null);
        }}
        response={activeResponse}
      />
    </div>
  );
}

export default SessionOverview;
