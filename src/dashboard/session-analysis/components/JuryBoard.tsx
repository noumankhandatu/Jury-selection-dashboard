/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Juror } from "@/dashboard/manage-jurors/components/types";
import { Gavel, XCircle } from "lucide-react";

type StrikeType = "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null;

export interface BoardJuror {
  id: string;
  juror: Juror;
  score: number | null;
  strikeRecommendation: StrikeType;
}

interface JuryBoardProps {
  jurors: BoardJuror[];
  onStrike: (juror: { id: string; name: string; jurorNumber?: string }) => void;
}

/**
 * Compact seating‑chart style view for all jurors.
 * Inspired by the physical jury sheet lawyers use in voir dire.
 */
const JuryBoard = ({ jurors, onStrike }: JuryBoardProps) => {
  if (!Array.isArray(jurors) || jurors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-8 text-center text-sm text-slate-500">
        No jurors to display on the board.
      </div>
    );
  }

  // Sort by panel position first, then by juror number / id
  const sorted = [...jurors].sort((a, b) => {
    const pa = a.juror.panelPosition ?? 999999;
    const pb = b.juror.panelPosition ?? 999999;
    if (pa !== pb) return pa - pb;

    const ja = String(a.juror.jurorNumber || a.juror.id || "");
    const jb = String(b.juror.jurorNumber || b.juror.id || "");
    return ja.localeCompare(jb);
  });

  // Chunk into rows to mimic a box / seating chart
  const seatsPerRow = 10;
  const rows: BoardJuror[][] = [];
  for (let i = 0; i < sorted.length; i += seatsPerRow) {
    rows.push(sorted.slice(i, i + seatsPerRow));
  }

  const renderStrikeBadge = (strike: StrikeType) => {
    if (!strike) return null;

    const isCause = strike === "STRIKE_FOR_CAUSE";
    const colorClasses = isCause
      ? "bg-red-600 text-white"
      : "bg-amber-500 text-white";

    return (
      <Badge
        variant="destructive"
        className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold ${colorClasses}`}
      >
        <Gavel className="h-3 w-3" />
        {isCause ? "Cause" : "Peremptory"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Judge's bench */}
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl bg-slate-900 text-slate-50 shadow-lg border-slate-800">
          <div className="px-6 py-3 flex items-center justify-center">
            <span className="text-sm font-semibold tracking-[0.15em] uppercase">
              Judge&apos;s Bench
            </span>
          </div>
        </Card>
      </div>

      {/* Jury rows */}
      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-2 md:gap-3 flex-wrap"
          >
            {row.map((item) => {
              const { juror, strikeRecommendation } = item;
              const isStruck = !!strikeRecommendation;
              const seatLabel =
                juror.panelPosition ??
                juror.jurorNumber ??
                (juror.id ? String(juror.id).slice(0, 4) : "?");

              const baseBorder =
                "border rounded-lg px-2.5 py-2 w-[96px] sm:w-[110px] cursor-pointer transition-transform";

              const borderClasses = isStruck
                ? "border-red-500 bg-red-50/70 shadow-sm"
                : "border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm";

              const name =
                juror.name && juror.name !== "Unknown Juror"
                  ? juror.name
                  : `Juror ${seatLabel}`;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${baseBorder} ${borderClasses} relative text-left`}
                  onClick={() =>
                    onStrike({
                      id: juror.id,
                      name,
                      jurorNumber:
                        typeof juror.jurorNumber === "string"
                          ? juror.jurorNumber
                          : juror.panelPosition
                          ? String(juror.panelPosition)
                          : undefined,
                    })
                  }
                >
                  {/* Seat label */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-700">
                        {seatLabel}
                      </span>
                      <span className="truncate max-w-[64px]">
                        {name.split(" ")[0]}
                      </span>
                    </span>
                    {isStruck && (
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    )}
                  </div>

                  {/* Score */}
                  {typeof item.score === "number" && (
                    <div className="text-[10px] text-slate-500">
                      Score:{" "}
                      <span className="font-semibold text-slate-700">
                        {Math.round(item.score)}%
                      </span>
                    </div>
                  )}

                  {/* Strike status */}
                  {renderStrikeBadge(strikeRecommendation)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 text-center">
        Click a juror to open strike options (Strike for Cause / Peremptory).
      </p>
    </div>
  );
};

export default JuryBoard;

