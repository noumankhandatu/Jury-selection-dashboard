/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckSquare, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionPanelProps {
  selectedCase: any;
  selectedQuestions: string[];
  handleSelectAllQuestions: () => void;
  handleClearQuestionSelection: () => void;
  handleQuestionSelection: (question: string, checked: boolean) => void;
  onAddQuestion: () => void;
}

export default function QuestionPanel({
  selectedCase,
  selectedQuestions,
  handleSelectAllQuestions,
  handleClearQuestionSelection,
  handleQuestionSelection,
  onAddQuestion,
}: QuestionPanelProps) {
  return (
    <Card className="bg-white text-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Case Questions
          {selectedQuestions.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {selectedQuestions.length} selected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Select questions to ask (multiple selection)</CardDescription>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleSelectAllQuestions}>
            <CheckSquare className="mr-1 h-3 w-3" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearQuestionSelection}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={onAddQuestion} className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {selectedCase.questions.map((question: string, index: number) => (
              <div
                key={index}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedQuestions.includes(question) ? "border-[#5156be] bg-[#5156be]/5" : "border-border hover:border-[#5156be]/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedQuestions.includes(question)}
                    onCheckedChange={(checked) => handleQuestionSelection(question, checked as boolean)}
                  />
                  <div
                    className="flex-shrink-0 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: "#5156be" }}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm">{question}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
