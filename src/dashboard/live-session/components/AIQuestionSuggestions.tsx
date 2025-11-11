/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckSquare, Square, Plus } from "lucide-react";
import { toast } from "sonner";
import { createQuestionApi, suggestAIQuestionsApi } from "@/api/api";

interface AIQuestionSuggestionsProps {
  caseData: {
    caseName: string;
    caseType: string;
    description: string;
    jurorTraits: string;
  };
  selectedCaseId?: string;
  onQuestionsAdded?: () => void;
}

export default function AIQuestionSuggestions({
  caseData,
  selectedCaseId,
  onQuestionsAdded,
}: AIQuestionSuggestionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateQuestions = async () => {
    setIsGenerating(true);
    setSuggestedQuestions([]);
    setSelectedQuestions(new Set());

    try {
      // Call backend API with token tracking
      const data = await suggestAIQuestionsApi(caseData);

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

  const parseQuestionsFromResponse = (content: string): string[] => {
    try {
      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (parsedData && Array.isArray(parsedData.questions)) {
          return parsedData.questions
            .filter(
              (q: any) => q && typeof q === "string" && q.trim().length > 0
            )
            .map((q: string) => q.trim());
        }
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
    }

    // Fallback: extract questions manually
    const lines = content.split(/[\n\r]+/);
    const questions: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and headers
      if (!trimmedLine || trimmedLine.length < 10) continue;

      // Remove numbering and clean up
      const cleanedLine = trimmedLine
        .replace(/^\d+\.\s*/, "") // Remove "1. " style numbering
        .replace(/^[-*]\s*/, "") // Remove "- " or "* " bullets
        .replace(/^["']|["']$/g, "") // Remove surrounding quotes
        .trim();

      // Check if it looks like a question
      if (
        cleanedLine.length > 10 &&
        (cleanedLine.includes("?") || cleanedLine.toLowerCase().includes("you"))
      ) {
        questions.push(cleanedLine);
      }
    }

    return questions.slice(0, 5); // Limit to 5 questions
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

  const submitSelectedQuestions = async () => {
    if (!selectedCaseId || selectedQuestions.size === 0) {
      toast.error("No questions selected or case ID missing");
      return;
    }

    setIsSubmitting(true);
    const questionsToSubmit = Array.from(selectedQuestions).map(
      (index) => suggestedQuestions[index]
    );

    try {
      // Submit each question to the API
      const submitPromises = questionsToSubmit.map((question, index) =>
        createQuestionApi(selectedCaseId, {
          question: question.trim(),
          questionType: "TEXT",
          isRequired: false,
          order: index + 1,
        })
      );

      await Promise.all(submitPromises);

      toast.success(
        `Successfully added ${questionsToSubmit.length} questions to the case!`
      );

      // Reset state
      setSuggestedQuestions([]);
      setSelectedQuestions(new Set());

      // Notify parent component
      if (onQuestionsAdded) {
        onQuestionsAdded();
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Failed to submit questions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Suggest Questions by AI
                </>
              )}
            </Button>
            <p className="text-sm text-purple-600 mt-2">
              AI will generate relevant voir dire questions based on your case
              details
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
                  onClick={submitSelectedQuestions}
                  disabled={selectedQuestions.size === 0 || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Submit ({selectedQuestions.size})
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {suggestedQuestions.map((question, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedQuestions.has(index)
                      ? "bg-purple-100 border-purple-300 shadow-sm"
                      : "bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => toggleQuestionSelection(index)}
                >
                  <Checkbox
                    checked={selectedQuestions.has(index)}
                    onChange={() => toggleQuestionSelection(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {question}
                    </p>
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
