import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckSquare, Square, Plus, Tag, Percent, Type } from "lucide-react";
import { toast } from "sonner";
import { generateAIQuestionsApi } from "@/api/api";
import { GeneratedQuestion, QuestionType } from "../../../types/questions";

interface AIQuestionGeneratorProps {
  caseData: {
    caseName: string;
    caseType: string;
    description: string;
    jurorTraits: string;
  };
  onAddQuestions: (questions: GeneratedQuestion[]) => void;
}

export default function AIQuestionGenerator({
  caseData,
  onAddQuestions,
}: AIQuestionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Only show the button if both description and juror traits are filled
  const shouldShowGenerator =
    caseData.description.trim() && caseData.jurorTraits.trim();

  const generateQuestions = async () => {
    setIsGenerating(true);
    setSuggestedQuestions([]);
    setSelectedQuestions(new Set());

    try {
      // Call backend API with token tracking
      const data = await generateAIQuestionsApi(caseData);

      const questions = data.questions || [];

      if (questions.length === 0) {
        throw new Error("No valid questions were generated");
      }

      setSuggestedQuestions(questions);
      toast.success(
        `Generated ${questions.length} AI-suggested questions!`
      );
    } catch (error: any) {
      console.error("Error generating questions:", error);

      if (error.response?.status === 429) {
        toast.error(
          "Insufficient AI tokens. Please upgrade your plan or wait for your tokens to reset."
        );
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error instanceof Error) {
        toast.error(`Failed to generate questions: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred while generating questions.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionSelection = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.size === suggestedQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(
        new Set(suggestedQuestions.map((_, index) => index))
      );
    }
  };

  const addSelectedQuestions = () => {
    const questionsToAdd = Array.from(selectedQuestions).map(
      (index) => suggestedQuestions[index]
    );
    if (questionsToAdd.length > 0) {
      onAddQuestions(questionsToAdd);
      toast.success(`Added ${questionsToAdd.length} questions to your case!`);
      setSuggestedQuestions([]);
      setSelectedQuestions(new Set());
    }
  };

  const getQuestionTypeDisplay = (type: QuestionType) => {
    switch (type) {
      case 'YES_NO': return 'Yes/No';
      case 'RATING': return 'Rating';
      case 'TEXT': return 'Text';
      default: return type;
    }
  };

  if (!shouldShowGenerator) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-purple-800">
          <Sparkles className="h-5 w-5" />
          <span>AI-Suggested Questions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedQuestions.length === 0 ? (
          <div className="text-center">
            <Button
              onClick={generateQuestions}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI-Suggested Questions
                </>
              )}
            </Button>
            <p className="text-sm text-purple-600 mt-2">
              AI will generate relevant voir dire questions based on your case details
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  {suggestedQuestions.length} questions generated
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-200 text-purple-600"
                >
                  {selectedQuestions.size} selected
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  {selectedQuestions.size === suggestedQuestions.length ? (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Select All
                    </>
                  )}
                </Button>
                <Button
                  onClick={addSelectedQuestions}
                  disabled={selectedQuestions.size === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected ({selectedQuestions.size})
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestedQuestions.map((question, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedQuestions.has(index)
                      ? "bg-purple-100 border-purple-300 shadow-sm"
                      : "bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => toggleQuestionSelection(index)}
                >
                  <Checkbox
                    checked={selectedQuestions.has(index)}
                    onChange={() => toggleQuestionSelection(index)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed mb-2">
                      {question.question}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Question Type */}
                      <div className="flex items-center space-x-1">
                        <Type className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {getQuestionTypeDisplay(question.questionType)}
                        </span>
                      </div>
                      
                      {/* Percentage */}
                      <div className="flex items-center space-x-1">
                        <Percent className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {question.percentage}% relevant
                        </span>
                      </div>
                      
                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {question.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="outline"
                                className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                              >
                                +{question.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={generateQuestions}
                disabled={isGenerating}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate New Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}