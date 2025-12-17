import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Juror } from "@/dashboard/manage-jurors/components/types";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { BiasGauge } from "@/components/shared/bias-gauge";
import { Eye } from "lucide-react";

interface JurorMiniCardProps {
  juror: Juror;
  score?: number | null;
  isHighlighted?: boolean;
  onDetails: () => void;
}

export function JurorMiniCard({
  juror,
  score,
  isHighlighted = false,
  onDetails,
}: JurorMiniCardProps) {
  const effectiveBiasStatus = juror.isStrikedOut ? "high" : juror.biasStatus;
  const displayId = juror.jurorNumber || juror.id;

  // Determine border color from suitability score (preferred) or bias status
  const normalizedScore =
    typeof score === "number"
      ? score > 1
        ? Math.min(100, Math.max(0, score))
        : Math.min(100, Math.max(0, score * 100))
      : null;
  let borderColorClass = "border-gray-200";
  if (typeof normalizedScore === "number") {
    if (normalizedScore < 60) borderColorClass = "border-red-300"; // <60 red
    else if (normalizedScore <= 79)
      borderColorClass = "border-yellow-300"; // 60–79 amber
    else borderColorClass = "border-green-300"; // ≥80 green
  } else {
    borderColorClass =
      effectiveBiasStatus === "high"
        ? "border-red-300"
        : effectiveBiasStatus === "moderate"
          ? "border-yellow-300"
          : "border-green-300";
  }
  return (
    <Card
      className={`relative h-full bg-white shadow-sm border ${borderColorClass} ${isHighlighted ? "ring-2 ring-blue-500" : ""
        } transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-opacity-80`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarImage src={generateAvatar(juror.name, juror.gender)} alt={juror.name} />
            <AvatarFallback>
              {juror.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="font-semibold text-gray-900 truncate max-w-full">
            {displayId ? `#${displayId}` : null}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {juror.name}
          </div>

          <div className="mt-3 flex flex-col items-center gap-1 w-full">
            <BiasGauge
              biasStatus={effectiveBiasStatus}
              size="md"
              isHighlighted={isHighlighted}
              scorePercent={typeof score === "number" ? score : undefined}
            />
          </div>

          <div className="mt-4 w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-300 text-blue-700 hover:text-blue-800 hover:border-blue-400 hover:bg-blue-50"
              onClick={onDetails}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JurorMiniCard;
