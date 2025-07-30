/* eslint-disable @typescript-eslint/no-explicit-any */

import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AnswerPanelProps {
  selectedJurors: any[];
  selectedQuestions: string[];
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
  isFormValid: boolean;
  handleSendAnswers: () => void;
}

export default function AnswerPanel({
  selectedJurors,
  selectedQuestions,
  currentAnswer,
  setCurrentAnswer,
  isFormValid,
  handleSendAnswers,
}: AnswerPanelProps) {
  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Record Answers
        </CardTitle>
        <CardDescription>
          {selectedJurors.length > 0 && selectedQuestions.length > 0
            ? `Recording for ${selectedJurors.length} juror(s) and ${selectedQuestions.length} question(s)`
            : "Select jurors and questions to begin"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedJurors.length > 0 && selectedQuestions.length > 0 ? (
          <>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Selected Jurors ({selectedJurors.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {selectedJurors.map((juror) => (
                    <Badge key={juror.id} variant="outline" className="text-xs">
                      {juror.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Selected Questions ({selectedQuestions.length}):</p>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {selectedQuestions.map((question, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {index + 1}. {question}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Response</Label>
              <Textarea
                id="answer"
                placeholder="e.g., 'Yes', 'No', 'Raised hand', etc..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">This answer will be recorded for all selected jurors and questions</p>
            </div>

            <Button onClick={handleSendAnswers} disabled={!isFormValid} className="w-full text-white" style={{ backgroundColor: "#5156be" }}>
              <Send className="mr-2 h-4 w-4" />
              Record Answers ({selectedJurors.length} × {selectedQuestions.length} = {selectedJurors.length * selectedQuestions.length} entries)
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select jurors and questions to start recording answers</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
