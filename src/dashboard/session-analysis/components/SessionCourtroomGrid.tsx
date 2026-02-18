/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OverallGauge from "@/components/shared/overall-gauge";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import type { BoardJuror } from "./JuryBoard";
import { Gavel, Filter, ArrowUpDown, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionCourtroomGridProps {
  jurors: BoardJuror[];
  onStrike: (juror: { id: string; name: string; jurorNumber?: string }) => void;
  onSelectForFinal?: (juror: {
    id: string;
    name: string;
    jurorNumber?: string;
  }) => void;
  onUnselectForFinal?: (jurorId: string) => void;
}

/**
 * Courtroom-style juror grid for Session Analysis, mirroring the Live Session layout.
 */
const SessionCourtroomGrid = ({
  jurors,
  onStrike,
  onSelectForFinal,
  onUnselectForFinal,
}: SessionCourtroomGridProps) => {
  const [strikeFilter, setStrikeFilter] = useState<
    "all" | "struck" | "unstruck"
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [confirmSelectJuror, setConfirmSelectJuror] = useState<{
    id: string;
    name: string;
    jurorNumber?: string;
  } | null>(null);

  if (!Array.isArray(jurors) || jurors.length === 0) {
    return (
      <div className="w-full border bg-white/80 rounded-xl px-6 py-10 text-center text-sm text-slate-500">
        No jurors available for this session.
      </div>
    );
  }

  // Basic counts for summary
  const totalJurors = jurors.length;
  const totalStruck = jurors.filter((j) => !!j.strikeRecommendation).length;
  const totalAvailable = totalJurors - totalStruck;

  // Filter by strike status
  const filtered = jurors.filter((item) => {
    const isStruck = !!item.strikeRecommendation;
    if (strikeFilter === "struck") return isStruck;
    if (strikeFilter === "unstruck") return !isStruck;
    return true; // "all"
  });

  // Sort by panel position, then juror number/id
  const sorted = [...filtered].sort((a, b) => {
    const pa = a.juror.panelPosition ?? 0;
    const pb = b.juror.panelPosition ?? 0;
    if (pa !== pb) {
      return sortOrder === "asc" ? pa - pb : pb - pa;
    }
    const ja = String(a.juror.jurorNumber || a.juror.id || "");
    const jb = String(b.juror.jurorNumber || b.juror.id || "");
    return sortOrder === "asc" ? ja.localeCompare(jb) : jb.localeCompare(ja);
  });

  return (
    <div className="p-2 sm:p-3 space-y-2">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <Select
            value={strikeFilter}
            onValueChange={(value: "all" | "struck" | "unstruck") =>
              setStrikeFilter(value)
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jurors</SelectItem>
              <SelectItem value="struck">Struck Only</SelectItem>
              <SelectItem value="unstruck">Unstruck Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Sort:</span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
        </div>
        <div className="ml-auto text-[11px] text-gray-500 flex flex-col items-end leading-tight">
          <span>
            Total: <span className="font-semibold">{totalJurors}</span> |
            Struck:{" "}
            <span className="font-semibold text-red-600">{totalStruck}</span> |
            Available:{" "}
            <span className="font-semibold text-emerald-600">
              {totalAvailable}
            </span>
          </span>
          <span className="text-[10px]">
            Showing {sorted.length} jurors with current filter
          </span>
        </div>
      </div>

      {/* Cards Grid – 6 per row on xl, matching Live Session, tighter gaps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {sorted.map((item) => {
          const { juror, score, strikeRecommendation, selectedForFinal } = item;
          const isStruck = !!strikeRecommendation;
          const isSelected = !!selectedForFinal;
          const overallScore =
            typeof score === "number"
              ? score
              : (juror as any)?.overallScore ?? 0;

          const initials = (juror.name || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          // Border style: red for struck, blue accent for selected, green for unstruck
          let cardBorder = isStruck
            ? "border-red-500"
            : isSelected
            ? "border-emerald-500 border-[4px]"
            : "border-green-400 border-[4px]";

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
              className={`relative flex flex-col items-center gap-1.5 px-2 py-2 rounded-md border bg-white cursor-default transition w-full max-w-[140px] justify-self-center
                ${cardBorder}
                ${
                  isStruck
                    ? "shadow-[0_0_10px_rgba(239,68,68,0.45)] ring-2 ring-red-400 ring-opacity-60"
                    : isSelected
                    ? "shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400 ring-opacity-60"
                    : "shadow-[1px_0px_4px_#434] hover:shadow-[2px_0px_6px_#434]"
                }
              `}
            >
              {/* Strike / edit button (top-right) - also allows unstrike */}
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
                className={`absolute -top-1 -right-1 p-1 rounded-full bg-white border shadow hover:bg-gray-50 z-10 ${
                  isStruck
                    ? "border-red-500 bg-red-50 hover:bg-red-100"
                    : "border-amber-500 bg-amber-50"
                }`}
                title={isStruck ? "Update / remove strike" : "Strike / update strike"}
              >
                <Gavel
                  className={`h-3 w-3 ${
                    isStruck ? "text-red-700" : "text-amber-600"
                  }`}
                />
              </button>
              {/* Check button (top-left) - add to final jury, only on unstruck jurors */}
              {!isStruck && (onSelectForFinal || onUnselectForFinal) && (
                <button
                  type="button"
                  onClick={() =>
                    isSelected
                      ? onUnselectForFinal?.(juror.id)
                      : setConfirmSelectJuror({
                          id: juror.id,
                          name: displayName,
                          jurorNumber: juror.jurorNumber
                            ? String(juror.jurorNumber)
                            : juror.panelPosition
                            ? String(juror.panelPosition)
                            : undefined,
                        })
                  }
                  className={`absolute -top-1 -left-1 p-1 rounded-full border shadow z-10 ${
                    isSelected
                      ? "bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200"
                      : "bg-white border-emerald-500 bg-emerald-50 hover:bg-gray-50"
                  }`}
                  title={
                    isSelected
                      ? "Selected for final jury (click to remove)"
                      : "Add to final jury selection"
                  }
                >
                  <Check className="h-3 w-3 text-emerald-600" />
                </button>
              )}
              {/* Cross sign on struck jurors - centered in middle of card */}
              {isStruck && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-md"
                  title="Struck"
                >
                  <X
                    className="h-10 w-10 text-red-600 drop-shadow-md"
                    strokeWidth={2.5}
                  />
                </div>
              )}
              {/* Tick sign on selected-for-final jurors */}
              {isSelected && !isStruck && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-md bg-emerald-500/10"
                  title="Selected for final jury"
                >
                  <div className="rounded-full bg-emerald-500/90 p-1.5">
                    <Check
                      className="h-10 w-10 text-white drop-shadow-md"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              )}

              {/* Top: avatar + seat label */}
              <div className="flex flex-col items-center gap-1 pt-1">
                <Avatar className="h-8 w-8 border shadow-sm">
                  <AvatarImage
                    src={generateAvatar(juror.name, juror.gender)}
                    alt={juror.name}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-xs font-bold text-gray-900 leading-none">
                  #{seatLabel}
                </div>
              </div>

              {/* Bottom: compact gauge + percent */}
              <div className="flex flex-col items-center gap-0.5 pb-1">
                <OverallGauge
                  valuePercent={overallScore ?? 0}
                  size="xs"
                  showLabel={false}
                />
                <div className="text-[9px] font-bold text-gray-600 leading-none">
                  {Number(overallScore ?? 0).toFixed(1)}%
                </div>
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

      {/* Confirm add to final jury selection */}
      <AlertDialog
        open={!!confirmSelectJuror}
        onOpenChange={(open) => {
          if (!open) setConfirmSelectJuror(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to final jury selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add
              {confirmSelectJuror?.name ? (
                <span className="font-semibold">
                  {" "}
                  {confirmSelectJuror.name}
                </span>
              ) : (
                " this juror"
              )}{" "}
              to the final jury selection? They will appear in the export PDF as
              a selected juror from the board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmSelectJuror && onSelectForFinal) {
                  onSelectForFinal(confirmSelectJuror);
                }
                setConfirmSelectJuror(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Yes, add to final jury
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SessionCourtroomGrid;
