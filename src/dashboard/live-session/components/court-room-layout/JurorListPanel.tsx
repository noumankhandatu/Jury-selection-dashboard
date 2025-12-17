import { useState } from "react";
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
  Hash,
  UserPlus,
  Check,
  User,
  UserRound,
  StickyNote,
} from "lucide-react";
import { CaseJuror } from "@/types/court-room";
import { Question } from "@/types/questions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OverallGauge from "@/components/shared/overall-gauge";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";
import { addJurorNoteApi } from "@/api/api";
import { toast } from "sonner";

interface JurorListPanelProps {
  sessionId?: string;
  sessionJurors: CaseJuror[];
  selectedJurorIds: Set<string>;
  scoresByJurorId: Record<string, { overallScore?: number }>;
  jurorResponses: Record<string, { questionId: string; response: string; responseType: string }>;
  selectedQuestion: Question | null;
  onJurorToggle: (juror: CaseJuror) => void;
}

const JurorListPanel = ({
  sessionId,
  sessionJurors = [],
  selectedJurorIds,
  scoresByJurorId,
  jurorResponses,
  selectedQuestion,
  onJurorToggle,
}: JurorListPanelProps) => {
  /* -------------------- NOTE STATE -------------------- */
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeJuror, setActiveJuror] = useState<CaseJuror | null>(null);
  const [savingNote, setSavingNote] = useState(false);

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

  if (sessionJurors?.length === 0) {
    return (
      <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
          <UserPlus className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-400">No jurors available</p>
          <p className="text-sm text-gray-400 mt-2">Add jurors to get started</p>
        </div>
      </div>
    );
  }

  /* -------------------- MAIN RENDER -------------------- */

  return (
    <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Jurors</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sessionJurors.length} juror(s) • {selectedJurorIds.size} selected
            </p>
          </div>
          {selectedJurorIds.size > 0 && (
            <Badge className="bg-blue-100 text-blue-700">
              {selectedJurorIds.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sessionJurors.map(juror => {
          const isSelected = selectedJurorIds.has(juror.id);
          const overallScore = scoresByJurorId[juror.id]?.overallScore || 0;

          const responseKey = selectedQuestion
            ? `${juror.id}-${selectedQuestion.id}`
            : "";

          const response = responseKey
            ? jurorResponses[responseKey]?.response
            : undefined;

          let cardBorder = "border-gray-300";

          if (isSelected) {
            cardBorder = "border-blue-500";
          }

          if (selectedQuestion?.questionType === "YES_NO") {
            if (response === "yes") {
              cardBorder = "border-green-500";
            } else if (response === "no") {
              cardBorder = "border-red-500";
            }
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
              className={`relative flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${cardBorder}
                ${isSelected ? "bg-blue-50 shadow-md" : "bg-white hover:shadow-md"}
              `}
            >
              {/* Add Note Button */}
              <button
                onClick={(e) => openNoteDialog(juror, e)}
                className="absolute top-2 left-2 p-1 rounded-full bg-white border shadow hover:bg-gray-50"
                title="Add note"
              >
                <StickyNote className="h-4 w-4 text-gray-600" />
              </button>

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Avatar */}
              <Avatar className="h-14 w-14 border-4 shadow-sm mb-3">
                <AvatarImage src={generateAvatar(juror.name, juror.gender)} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="text-center mb-4">
                <span className="block text-sm font-semibold">
                  #{juror.jurorNumber}
                </span>
                <span className="text-sm">{juror.name}</span>
              </div>

              {/* Score */}
              <OverallGauge valuePercent={overallScore} size="sm" showLabel={false} />
              <div className="text-xs text-gray-600 -mt-3">
                {overallScore.toFixed(1)}%
              </div>

              {/* Panel */}
              {juror.panelPosition != null && (
                <Badge variant="outline" className="mt-2 text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Panel {juror.panelPosition}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

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