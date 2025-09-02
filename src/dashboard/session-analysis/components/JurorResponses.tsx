/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ThumbsDown, ThumbsUp, Circle } from "lucide-react";
import { useMemo, useState } from "react";
import { ResponseDetailsDialog } from "./ResponseDetailsDialog";
import JurorMiniCard from "./JurorMiniCard";
import type { Juror } from "@/dashboard/manage-jurors/components/types";

// Map session juror shape to manage-jurors Juror type for display
const toDisplayJuror = (item: any, session: any): Juror => {
  const j = item.juror || {};
  let bias: "low" | "moderate" | "high" = "low";
  const score = item.assessment?.score ?? item.assessment?.suitabilityScore;
  if (typeof score === "number") {
    if (score < 0.4) bias = "high";
    else if (score < 0.7) bias = "moderate";
    else bias = "low";
  }
  return {
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
    panelPosition: j.panelPosition ?? "",
    jurorNumber: j.jurorNumber ?? "",
    criminalCase: j.criminalCase ?? "",
    accidentalInjury: j.accidentalInjury ?? "",
    civilJury: j.civilJury ?? "",
    criminalJury: j.criminalJury ?? "",
    spouse: j.spouse ?? "",
    mailingAddress: j.mailingAddress ?? "",
  } as Juror;
};

export const JurorResponses = ({
  session,
  sessionStats,
  onSelectResponse,
  selectedResponseId,
}: {
  session: any;
  sessionStats?: any | null;
  onSelectResponse: (responseId: string) => void;
  selectedResponseId: string;
}) => {
  const [filter, setFilter] = useState<"all" | "unfavorable" | "moderate" | "favorable">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [manualResponse, setManualResponse] = useState<any | null>(null);

  // Always call hooks at the top level, before any early return
  const responses = useMemo(() => (Array.isArray(session?.responses) && session?.responses?.length > 0 ? session.responses : []), [session]);
  const assignments = useMemo(() => (Array.isArray(session?.assignments) ? session.assignments : []), [session]);

  // Normalize items so click/selection logic is consistent
  const jurorItems = useMemo(() => {
    if (responses.length) {
      return responses.map((r: any) => ({
        kind: "response",
        id: r.id as string,
        juror: r.juror,
        question: r.question,
        responseText: r.response,
        assessment: r.assessment,
      }));
    }

    if (Array.isArray(sessionStats?.topJurors) && sessionStats.topJurors.length > 0) {
      return sessionStats.topJurors.map((tj: any) => ({
        kind: "statistics",
        id: tj.juror?.id || String(tj.rank),
        juror: {
          id: tj.juror?.id,
          name: tj.juror?.name,
          jurorNumber: tj.juror?.jurorNumber,
        },
        question: undefined,
        responseText: undefined,
        // Put score under suitabilityScore so existing UI picks it up
        assessment: { suitabilityScore: tj.overallScore },
      }));
    }

    return assignments.map((a: any) => ({
      kind: "assignment",
      id: `assignment-${a.id}`,
      juror: a.juror,
      question: a.question,
      responseText: undefined,
      assessment: undefined,
    }));
  }, [responses, assignments, sessionStats]);

  const getPercent = (item: any): number | null => {
    const raw = item?.assessment?.suitabilityScore ?? item?.assessment?.score;
    if (typeof raw !== "number") return null;
    if (raw <= 1) return Math.max(0, Math.min(100, Math.round(raw * 100)));
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const filteredByScore = useMemo(() => {
    if (filter === "all") return jurorItems;
    return jurorItems.filter((item: any) => {
      const p = getPercent(item);
      if (p === null) return false;
      if (filter === "unfavorable") return p <= 25;
      if (filter === "moderate") return p >= 26 && p <= 75;
      return p >= 76; // favorable
    });
  }, [jurorItems, filter]);

  const finalItems = useMemo(() => {
    const base = filter === "all" ? jurorItems : filteredByScore;
    const query = searchTerm.trim().toLowerCase();
    if (!query) return base;
    return base.filter((item: any) => {
      const juror = toDisplayJuror(item, session);
      const name = String(juror.name || "").toLowerCase();
      const jnum = String(juror.jurorNumber || "").toLowerCase();
      const jid = String(juror.id || "").toLowerCase();
      return name.includes(query) || jnum.includes(query) || jid.includes(query);
    });
  }, [searchTerm, filter, jurorItems, filteredByScore, session]);

  // Compute activeResponse after hooks (from selectedResponseId or manual selection for stats/assignments)
  const activeResponse = (session && responses.find((x: any) => x.id === selectedResponseId)) || manualResponse || null;

  const filterDescription = {
    unfavorable:
      "Jurors who scored very low → strong biases, poor engagement, or lack of suitability. Likely not a good fit.",
    moderate:
      "Jurors in the middle range. They may have some weaknesses or mild biases, but could still be considered depending on case needs.",
    favorable:
      "High-scoring jurors with strong impartiality and suitability. Best candidates for selection.",
  } as const;

  if (!session) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
      <Card className="bg-white/80 backdrop-blur-md shadow rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 w-full">
              <div className="relative w-full max-w-[22rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID"
                  className="pl-9 bg-white/60"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
              <div className="w-56">
                <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <SelectTrigger className="bg-white/60">
                    <SelectValue placeholder="Select filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unfavorable">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span>Unfavorable (≤ 25%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-yellow-500" />
                        <span>Moderate (26%–75%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="favorable">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span>Favorable (76%–100%)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filter !== "all" && (
            <div className="text-xs text-gray-600 mb-4">
              {filterDescription[filter]}
            </div>
          )}

          {finalItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalItems.map((item: any) => {
                const juror = toDisplayJuror(item, session);
                const score = item.assessment?.suitabilityScore ?? item.assessment?.score ?? null;
                return (
                  <JurorMiniCard
                    key={item.id}
                    juror={juror}
                    score={typeof score === "number" ? score : null}
                    isHighlighted={selectedResponseId === item.id}
                    onDetails={() => {
                      if (item.kind === "response") {
                        onSelectResponse(item.id);
                      } else {
                        const sid = session?.id || sessionStats?.session?.id;
                        setManualResponse({
                          id: item.id,
                          sessionId: sid,
                          juror: { id: juror.id, name: juror.name, jurorNumber: juror.jurorNumber },
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No jurors found.</div>
          )}
        </CardContent>
      </Card>

      <ResponseDetailsDialog
        open={Boolean(activeResponse)}
        onOpenChange={(open) => {
          if (!open) {
            setManualResponse(null);
            onSelectResponse("");
          }
        }}
        response={activeResponse}
      />
    </div>
  );
};
