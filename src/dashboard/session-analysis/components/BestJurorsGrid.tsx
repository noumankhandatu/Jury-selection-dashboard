/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderTag from "@/components/shared/card-header";
import { Users } from "lucide-react";
import JurorMiniCard from "./JurorMiniCard";
import type { Juror } from "@/dashboard/manage-jurors/components/types";

// Local mapper: map API bestJuror item to JurorMiniCard-friendly shape
const mapBestJurorToDisplay = (
  item: any,
  session: any
): { juror: Juror; score: number | null; id: string } => {
  const j = item?.juror || {};
  const scoreVal =
    typeof item?.overallScore === "number" ? item.overallScore : null;

  // Derive bias status from score (same heuristic used elsewhere)
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
    panelPosition: j.panelPosition ?? "",
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

export const BestJurorsGrid = ({
  session,
  bestJurors,
}: {
  session: any;
  bestJurors: any[] | null;
}) => {
  if (!Array.isArray(bestJurors)) return null;

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow rounded-xl">
      <CardHeaderTag
        title={" Jurors from Selection"}
        description={" Jurors fetched based on the selected bucket."}
        Icon={Users}
      />
      <CardContent className="p-4">
        {bestJurors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestJurors
              .filter((bj: any) => {
                // Filter out struck jurors from Top Jurors - they should only appear in strike categories
                return !(bj.strikeRecommendation === "STRIKE_FOR_CAUSE" || bj.strikeRecommendation === "PEREMPTORY_STRIKE");
              })
              .map((bj: any) => {
              const mapped = mapBestJurorToDisplay(bj, session);
              return (
                <JurorMiniCard
                  key={mapped.id}
                  juror={mapped.juror}
                  score={typeof mapped.score === "number" ? mapped.score : null}
                  strikeRecommendation={bj.strikeRecommendation || null}
                  onDetails={() => {
                    // TODO: Navigate to juror details or open modal
                    console.log("View details for juror:", mapped.juror.id);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            No jurors found for this selection.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestJurorsGrid;
