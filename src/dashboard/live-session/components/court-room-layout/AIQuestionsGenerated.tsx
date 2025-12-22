import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckSquare, Square, Check, Trash2, AlertCircle } from "lucide-react";
import { Question } from "@/types/questions";

interface AIQuestionsGeneratedProps {
  aiGeneratedQuestions: Question[]; 
  selectedAIQuestions: Set<number>;
  showAIQuestions: boolean;
  isGeneratingAI: boolean;
  onToggleSelectAll: () => void;
  onToggleQuestionSelection: (index: number) => void;
  onDeleteAIQuestion: (index: number, e: React.MouseEvent) => void;
  getPercentageLabel: (value: number) => string;
}

export function AIQuestionsGenerated({
  aiGeneratedQuestions,
  selectedAIQuestions,
  showAIQuestions,
  isGeneratingAI,
  onToggleSelectAll,
  onToggleQuestionSelection,
  onDeleteAIQuestion,
  getPercentageLabel
}: AIQuestionsGeneratedProps) {
  if (!showAIQuestions) return null;

  const allSelected = selectedAIQuestions.size === aiGeneratedQuestions.length && aiGeneratedQuestions.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-gray-700" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">AI-Generated Questions</h3>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
              {aiGeneratedQuestions.length} questions
            </Badge>
            {aiGeneratedQuestions.length > 0 && (
              <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs">
                {selectedAIQuestions.size} selected
              </Badge>
            )}
          </div>
          
          {aiGeneratedQuestions.length > 0 && !isGeneratingAI && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSelectAll}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs w-full sm:w-auto"
            >
              {allSelected ? (
                <>
                  <Square className="h-2 w-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-2 w-2" />
                  Select All
                </>
              )}
            </Button>
          )}
        </div>

        {aiGeneratedQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-8 w-8 text-gray-600 animate-spin mb-3" />
                <p className="text-gray-700 font-medium">Generating questions...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-600">No questions generated yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click "Generate by AI" to create questions
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {aiGeneratedQuestions.map((questionObj, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                  selectedAIQuestions.has(index)
                    ? "bg-gray-50 border-gray-300 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => onToggleQuestionSelection(index)}
              >
                <div className={`flex items-center justify-center h-5 w-5 rounded border flex-shrink-0 mt-0.5 ${
                  selectedAIQuestions.has(index) 
                    ? "bg-gray-700 border-gray-700" 
                    : "border-gray-300"
                }`}>
                  {selectedAIQuestions.has(index) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-900 leading-relaxed break-words">
                      {questionObj.question}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => onDeleteAIQuestion(index, e)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-gray-500">
                    {questionObj.questionType && (
                      <span className="whitespace-nowrap">Type: {questionObj.questionType}</span>
                    )}
                    
                    {questionObj.percentage !== undefined && (
                      <>
                        {questionObj.questionType && <span className="hidden sm:inline">•</span>}
                        <span className="whitespace-nowrap">
                          Relevance: {Math.round(questionObj.percentage / 10)}/10 
                          <span className="hidden sm:inline"> ({getPercentageLabel(Math.round(questionObj.percentage / 10))})</span>
                        </span>
                      </>
                    )}
                    
                    {questionObj.tags && questionObj.tags.length > 0 && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="break-words">
                          Tags: {questionObj.tags.slice(0, 2).join(", ")}
                          {questionObj.tags.length > 2 ? "..." : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}