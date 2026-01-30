/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OverallGauge from "@/components/shared/overall-gauge";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import type { BoardJuror } from "./JuryBoard";
import { Gavel } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SessionCourtroomGridProps {
  jurors: BoardJuror[];
  onStrike: (juror: { id: string; name: string; jurorNumber?: string }) => void;
}

/**
 * Courtroom-style juror grid for Session Analysis, mirroring the Live Session layout.
 */
const SessionCourtroomGrid = ({
  jurors,
  onStrike,
}: SessionCourtroomGridProps) => {
  if (!Array.isArray(jurors) || jurors.length === 0) {
    return (
      <div className="w-full border bg-white/80 rounded-xl px-6 py-10 text-center text-sm text-slate-500">
        No jurors available for this session.
      </div>
    );
  }

  // Sort by panel position, then juror number/id
  const sorted = [...jurors].sort((a, b) => {
    const pa = a.juror.panelPosition ?? 0;
    const pb = b.juror.panelPosition ?? 0;
    if (pa !== pb) return pa - pb;
    const ja = String(a.juror.jurorNumber || a.juror.id || "");
    const jb = String(b.juror.jurorNumber || b.juror.id || "");
    return ja.localeCompare(jb);
  });

  return (
    <div className="p-2 sm:p-4 space-y-3">
      {/* Cards Grid – 6 per row on xl, matching Live Session */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sorted.map((item) => {
          const { juror, score, strikeRecommendation } = item;
          const isStruck = !!strikeRecommendation;
          const overallScore =
            typeof score === "number" ? score : (juror as any)?.overallScore ?? 0;

          const initials = (juror.name || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          // Border style similar to Live Session JurorListPanel
          let cardBorder = "border-gray-300";
          if (isStruck) {
            cardBorder = "border-red-500";
          }

          const seatLabel =
            juror.panelPosition ??
            juror.jurorNumber ??
            (juror.id ? String(juror.id).slice(0, 4) : "?");

          const displayName =
            juror.name && juror.name !== "Unknown Juror"
              ? juror.name
              : `Juror ${seatLabel}`;

          return (
            <div
              key={item.id}
              className={`relative flex flex-col items-center p-3 rounded-xl border bg-white cursor-default transition
                ${cardBorder}
                ${
                  isStruck
                    ? "shadow-[0_0_15px_rgba(239,68,68,0.45)] ring-2 ring-red-400 ring-opacity-60"
                    : "shadow-[2px_0px_7px_#434] hover:shadow-[4px_0px_10px_#434]"
                }
              `}
            >
              {/* Strike Button - Top right edge of card */}
              <button
                type="button"
                onClick={() =>
                  onStrike({
                    id: juror.id,
                    name: displayName,
                    jurorNumber: juror.jurorNumber
                      ? String(juror.jurorNumber)
                      : juror.panelPosition
                      ? String(juror.panelPosition)
                      : undefined,
                  })
                }
                className={`absolute top-2 right-2 p-1 rounded-full bg-white border shadow hover:bg-gray-50 z-10 ${
                  strikeRecommendation
                    ? strikeRecommendation === "STRIKE_FOR_CAUSE"
                      ? "border-red-500 bg-red-50"
                      : "border-amber-500 bg-amber-50"
                    : ""
                }`}
                title="Strike / update strike"
              >
                <Gavel
                  className={`h-3 w-3 ${
                    strikeRecommendation
                      ? strikeRecommendation === "STRIKE_FOR_CAUSE"
                        ? "text-red-600"
                        : "text-amber-600"
                      : "text-red-600"
                  }`}
                />
              </button>

              {/* Avatar */}
              <div className="mb-2 relative">
                <Avatar className="h-12 w-12 border-2 shadow-sm">
                  <AvatarImage
                    src={generateAvatar(juror.name, juror.gender)}
                    alt={juror.name}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="text-center mb-3">
                <span className="block text-xl font-bold text-gray-900">
                  #{seatLabel}
                </span>
                <span className="text-[9px] text-gray-400 truncate max-w-[90px] inline-block">
                  {displayName}
                </span>
              </div>

              {/* Score */}
              <OverallGauge
                valuePercent={overallScore ?? 0}
                size="sm"
                showLabel={false}
              />
              <div className="text-sm font-bold text-gray-600 -mt-2">
                {Number(overallScore ?? 0).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Judge's Bench below grid */}
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl bg-slate-900 text-slate-50 shadow-lg border-slate-800">
          <div className="px-6 py-3 flex items-center justify-center">
            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
              Judge&apos;s Bench
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SessionCourtroomGrid;

