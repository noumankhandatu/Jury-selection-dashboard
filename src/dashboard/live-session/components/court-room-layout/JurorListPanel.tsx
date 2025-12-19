import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Check,
  StickyNote,
} from "lucide-react";
import { CaseJuror } from "@/types/court-room";
import { Question } from "@/types/questions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OverallGauge from "@/components/shared/overall-gauge";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { addJurorNoteApi } from "@/api/api";
import { toast } from "sonner";
import JudgesBench from "../JudgesBench";

interface JurorListPanelProps {
  sessionId?: string;
  sessionJurors: CaseJuror[];
  selectedJurorIds: Set<string>;
  scoresByJurorId: Record<string, { overallScore?: number }>;
  jurorResponses: Record<
    string,
    { questionId: string; response: string; responseType: string }
  >;
  selectedQuestion: Question | null;
  onJurorToggle: (juror: CaseJuror) => void;
  onSelectAllJurors: () => void;
  onClearAllJurors: () => void;
}

const JurorListPanel = ({
  sessionId,
  sessionJurors = [],
  selectedJurorIds,
  scoresByJurorId,
  jurorResponses,
  selectedQuestion,
  onJurorToggle,
  onSelectAllJurors,
  onClearAllJurors,
}: JurorListPanelProps) => {
  /* -------------------- NOTE STATE -------------------- */
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeJuror, setActiveJuror] = useState<CaseJuror | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  /* -------------------- SORTED JURORS -------------------- */
  const sortedJurors = useMemo(() => {
    return [...sessionJurors].sort(
      (a, b) => (a.panelPosition ?? 0) - (b.panelPosition ?? 0)
    );
  }, [sessionJurors]);

  const openNoteDialog = (juror: CaseJuror, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveJuror(juror);
    setNoteText("");
    setNoteOpen(true);
  };

  const handleSaveNote = async () => {
    if (!activeJuror || !noteText.trim() || !sessionId) return;

    setSavingNote(true);
    try {
      await addJurorNoteApi({
        sessionId,
        jurorId: activeJuror.id,
        note: noteText.trim(),
      });

      toast.success("Note added successfully");
      setNoteOpen(false);
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  /* -------------------- EMPTY STATE -------------------- */
  if (sortedJurors.length === 0) {
    return (
      <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
          <UserPlus className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-400">No jurors available</p>
          <p className="text-sm text-gray-400 mt-2">
            Add jurors to get started
          </p>
        </div>
      </div>
    );
  }

  /* -------------------- MAIN RENDER -------------------- */
  return (
    <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Jurors</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sortedJurors.length} juror(s) • {selectedJurorIds.size} selected
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedJurorIds.size < sortedJurors.length && (
              <Button size="sm" variant="outline" onClick={onSelectAllJurors}>
                Select All
              </Button>
            )}

            {selectedJurorIds.size > 0 && (
              <Button size="sm" variant="ghost" onClick={onClearAllJurors}>
                Unselect All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid – 6 per row */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sortedJurors.map(juror => {
          const isSelected = selectedJurorIds.has(juror.id);
          const overallScore = scoresByJurorId[juror.id]?.overallScore ?? 0;

          const responseKey = selectedQuestion
            ? `${juror.id}-${selectedQuestion.id}`
            : "";

          const response = responseKey
            ? jurorResponses[responseKey]?.response
            : undefined;

          let cardBorder = "border-gray-300";

          if (isSelected) cardBorder = "border-blue-500";

          if (selectedQuestion?.questionType === "YES_NO") {
            if (response === "yes") cardBorder = "border-green-500";
            if (response === "no") cardBorder = "border-red-500";
          }

          const initials = juror.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={juror.id}
              onClick={() => onJurorToggle(juror)}
              className={`relative flex flex-col items-center p-3 rounded-xl border cursor-pointer transition
                ${cardBorder}
                ${isSelected ? "bg-blue-50 shadow-md" : "bg-white hover:shadow-md"}
              `}
            >
              {/* Note Button */}
              <button
                onClick={e => openNoteDialog(juror, e)}
                className="absolute top-2 left-2 p-1 rounded-full bg-white border shadow hover:bg-gray-50"
              >
                <StickyNote className="h-3 w-3 text-gray-600" />
              </button>

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Avatar */}
              <Avatar className="h-12 w-12 border-2 shadow-sm mb-2">
                <AvatarImage src={generateAvatar(juror.name, juror.gender)} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="text-center mb-3">
                <span className="block text-xl font-bold text-gray-900">
                  #{juror.panelPosition}
                </span>
                <span className="text-[9px] text-gray-400 truncate">
                  {juror.name}
                </span>
              </div>

              {/* Score */}
              <OverallGauge
                valuePercent={overallScore}
                size="sm"
                showLabel={false}
              />
              <div className="text-[10px] text-gray-600 -mt-2">
                {overallScore.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      <JudgesBench />

      {/* Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note for {activeJuror?.name}</DialogTitle>
          </DialogHeader>

          <Textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Write your note here..."
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={savingNote || !noteText.trim()}
            >
              {savingNote ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JurorListPanel;
