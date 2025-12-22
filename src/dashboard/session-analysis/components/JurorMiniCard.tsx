import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Juror } from "@/dashboard/manage-jurors/components/types";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { BiasGauge } from "@/components/shared/bias-gauge";
import { Eye, Gavel, XCircle } from "lucide-react";

interface JurorMiniCardProps {
  juror: Juror;
  score?: number | null;
  isHighlighted?: boolean;
  onDetails: () => void;
  strikeRecommendation?: "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null;
}

export function JurorMiniCard({
  juror,
  score,
  isHighlighted = false,
  onDetails,
  strikeRecommendation,
}: JurorMiniCardProps) {
  const effectiveBiasStatus = juror.isStrikedOut ? "high" : juror.biasStatus;
  // Prioritize panelPosition, then jurorNumber, then id
  const displayId = juror.panelPosition !== null && juror.panelPosition !== undefined 
    ? juror.panelPosition 
    : juror.jurorNumber || juror.id;
  const isStruck = !!strikeRecommendation;

  // Determine border color from suitability score (preferred) or bias status
  // If struck, always use red border regardless of score
  const normalizedScore =
    typeof score === "number"
      ? score > 1
        ? Math.min(100, Math.max(0, score))
        : Math.min(100, Math.max(0, score * 100))
      : null;
  let borderColorClass = "border-gray-200";
  if (isStruck) {
    // Struck jurors always get red border
    borderColorClass = "border-red-500 ring-2 ring-red-200";
  } else if (typeof normalizedScore === "number") {
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
            {juror.panelPosition !== null && juror.panelPosition !== undefined && juror.panelPosition !== ""
              ? `#${juror.panelPosition}`
              : displayId
              ? `#${displayId}`
              : null}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {juror.name}
          </div>

          {/* Strike Badge - Show when struck */}
          {isStruck && (
            <div className="mt-2">
              <Badge
                variant="destructive"
                className="flex items-center gap-1 bg-red-600 text-white font-semibold px-3 py-1"
              >
                <Gavel className="h-3 w-3" />
                {strikeRecommendation === "STRIKE_FOR_CAUSE"
                  ? "Strike for Cause"
                  : "Peremptory Strike"}
              </Badge>
            </div>
          )}

          <div className="mt-3 flex flex-col items-center gap-1 w-full">
            {isStruck ? (
              // Show "STRUCK" indicator instead of suitability gauge for struck jurors
              <div className="flex flex-col items-center gap-2 py-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <span className="text-sm font-semibold text-red-600">STRUCK</span>
                {typeof normalizedScore === "number" && (
                  <span className="text-xs text-gray-400 line-through">
                    Original Score: {normalizedScore.toFixed(1)}%
                  </span>
                )}
              </div>
            ) : (
              <BiasGauge
                biasStatus={effectiveBiasStatus}
                size="md"
                isHighlighted={isHighlighted}
                scorePercent={typeof score === "number" ? score : undefined}
              />
            )}
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
