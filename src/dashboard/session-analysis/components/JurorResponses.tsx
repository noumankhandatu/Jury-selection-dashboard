/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
// Removed search input
import { useMemo, useState } from "react";
import { ResponseDetailsDialog } from "./ResponseDetailsDialog";
import JurorMiniCard from "./JurorMiniCard";
import type { Juror } from "@/dashboard/manage-jurors/components/types";
import CardHeaderTag from "@/components/shared/card-header";
import { FileText } from "lucide-react";

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
  // Filter UI removed; always show all
  // Search removed
  const [manualResponse, setManualResponse] = useState<any | null>(null);

  // Always call hooks at the top level, before any early return
  const responses = useMemo(
    () =>
      Array.isArray(session?.responses) && session?.responses?.length > 0
        ? session.responses
        : [],
    [session]
  );
  const assignments = useMemo(
    () => (Array.isArray(session?.assignments) ? session.assignments : []),
    [session]
  );

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

    if (
      Array.isArray(sessionStats?.topJurors) &&
      sessionStats.topJurors.length > 0
    ) {
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

  // Percentage helper removed with filter UI

  const filteredByScore = jurorItems;

  const finalItems = useMemo(() => {
    return filteredByScore;
  }, [filteredByScore]);

  // Compute activeResponse after hooks (from selectedResponseId or manual selection for stats/assignments)
  const activeResponse =
    (session && responses.find((x: any) => x.id === selectedResponseId)) ||
    manualResponse ||
    null;

  // No filter description when filter UI is removed

  if (!session) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
      <Card className="bg-white/80 backdrop-blur-md shadow rounded-xl">
        <CardHeaderTag
          title={" Top Jurors"}
          description={" Highest overall scores for the selected session."}
          Icon={FileText}
        />
        <CardContent className="p-4">
          {finalItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalItems.map((item: any) => {
                const juror = toDisplayJuror(item, session);
                const score =
                  item.assessment?.suitabilityScore ??
                  item.assessment?.score ??
                  null;
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
                          juror: {
                            id: juror.id,
                            name: juror.name,
                            jurorNumber: juror.jurorNumber,
                          },
                        });
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No jurors found.
            </div>
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
