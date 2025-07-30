/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, CheckSquare, FileText, Plus, RotateCcw, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JurorPanelProps {
  selectedJurors: any[];
  handleSelectAllJurors: () => void;
  handleClearJurorSelection: () => void;
  getJurorAnswers: (jurorId: string) => any[];
  jurors: any[];
  handleJurorSelection: (juror: any, checked: boolean) => void;
  generateAvatar: (name: string) => string;
  handleOpenNoteDialog: (juror: any) => void;
  getJurorNotes: (jurorId: string) => any[];
  handleOpenStrikeDialog: (juror: any) => void;
}

export default function JurorPanel({
  selectedJurors,
  handleSelectAllJurors,
  handleClearJurorSelection,
  getJurorAnswers,
  jurors,
  handleJurorSelection,
  generateAvatar,
  handleOpenNoteDialog,
  getJurorNotes,
  handleOpenStrikeDialog,
}: JurorPanelProps) {
  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Available Jurors
          {selectedJurors.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {selectedJurors.length} selected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Select jurors to question (multiple selection)</CardDescription>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleSelectAllJurors}>
            <CheckSquare className="mr-1 h-3 w-3" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearJurorSelection}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {jurors
              .filter((juror) => juror.availability === "Available")
              .map((juror) => (
                <div
                  key={juror.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    juror.isStrikedOut
                      ? "border-red-300 bg-red-50 opacity-75"
                      : selectedJurors.some((j) => j.id === juror.id)
                      ? "border-[#5156be] bg-[#5156be]/5"
                      : "border-border hover:border-[#5156be]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedJurors.some((j) => j.id === juror.id)}
                      onCheckedChange={(checked) => handleJurorSelection(juror, checked as boolean)}
                      disabled={juror.isStrikedOut}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
                      <AvatarFallback>
                        {juror.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${juror.isStrikedOut ? "line-through text-gray-500" : ""}`}>{juror.name}</p>
                        {juror.isStrikedOut && (
                          <Badge variant="destructive" className="text-xs">
                            STRUCK
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{juror.occupation}</p>
                      <p className="text-xs text-muted-foreground">
                        Age {juror.age} • {juror.location}
                      </p>
                      {juror.isStrikedOut && juror.strikeReason && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Badge variant={juror.strikeType === "cause" ? "destructive" : "secondary"} className="text-xs">
                              {juror.strikeType === "cause" ? "Cause" : "Peremptory"}
                            </Badge>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Reason:</strong> {juror.strikeReason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenNoteDialog(juror)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                        title={getJurorNotes(juror.id).length > 0 ? "View/Edit notes" : "Add note"}
                      >
                        {getJurorNotes(juror.id).length > 0 ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-blue-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStrikeDialog(juror)}
                        className={`h-8 w-8 p-0 ${juror.isStrikedOut ? "hover:bg-green-100 text-green-600" : "hover:bg-red-100 text-red-600"}`}
                        title={juror.isStrikedOut ? "Restore juror" : "Strike juror"}
                      >
                        {juror.isStrikedOut ? <RotateCcw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t space-y-1">
                    {getJurorAnswers(juror.id).length > 0 && (
                      <p className="text-xs text-muted-foreground">{getJurorAnswers(juror.id).length} answer(s) recorded</p>
                    )}
                    {getJurorNotes(juror.id).length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-600" />
                        <p className="text-xs text-blue-600">{getJurorNotes(juror.id).length} note(s)</p>
                      </div>
                    )}
                    {juror.isStrikedOut && juror.strikeTimestamp && <p className="text-xs text-red-500">Struck: {juror.strikeTimestamp}</p>}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
