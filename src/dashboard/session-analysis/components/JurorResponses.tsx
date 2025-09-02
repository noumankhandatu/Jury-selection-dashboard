/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { ResponseDetailsDialog } from "./ResponseDetailsDialog";
import JurorMiniCard from "./JurorMiniCard";
import type { Juror } from "@/dashboard/manage-jurors/components/types";

export const JurorResponses = ({
  session,
  onSelectResponse,
  selectedResponseId,
}: {
  session: any;
  onSelectResponse: (responseId: string) => void;
  selectedResponseId: string;
  assessment: any | null;
  isAssessLoading: boolean;
  assessError: string;
}) => {
  if (!session) return null;

  const responses = Array.isArray(session.responses) && session.responses.length > 0 ? session.responses : [];
  const assignments = Array.isArray(session.assignments) ? session.assignments : [];

  // Normalize items so click/selection logic is consistent
  const jurorItems = responses.length
    ? responses.map((r: any) => ({
        kind: "response",
        id: r.id as string,
        juror: r.juror,
        question: r.question,
        responseText: r.response,
        assessment: r.assessment,
      }))
    : assignments.map((a: any) => ({
        kind: "assignment",
        id: `assignment-${a.id}`,
        juror: a.juror,
        question: a.question,
        responseText: undefined,
        assessment: undefined,
      }));

  const activeResponse = responses.find((x: any) => x.id === selectedResponseId) || null;

  // Map session juror shape to manage-jurors Juror type for display
  const toDisplayJuror = (item: any): Juror => {
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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
      <Card className="bg-white/80 backdrop-blur-md shadow rounded-xl">
        <CardContent className="p-4">
          {jurorItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jurorItems.map((item: any) => {
                const juror = toDisplayJuror(item);
                const score = item.assessment?.suitabilityScore ?? item.assessment?.score ?? null;
                return (
                  <JurorMiniCard
                    key={item.id}
                    juror={juror}
                    score={typeof score === "number" ? score : null}
                    isHighlighted={selectedResponseId === item.id}
                    onDetails={() => {
                      if (item.kind === "response") onSelectResponse(item.id);
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
        onOpenChange={() => onSelectResponse("")}
        response={activeResponse}
      />
    </div>
  );
};


