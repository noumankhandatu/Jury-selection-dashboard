import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  UserPlus,
  Loader2,
  CheckCircle2,
  Star,
  ArrowLeft
} from 'lucide-react';
import { QuestionAnswerPanelProps } from '@/types/court-room';
import { Label } from 'recharts';

const QuestionAnswerPanel = ({
  selectedQuestion,
  handleClearQuestion,
  selectedJurorCount,
  answer,
  yesNoChoice,
  rating,
  isSubmitting,
  hasAnswered,
  onAnswerChange,
  onYesNoChange,
  onRatingChange,
  onSubmit
}: QuestionAnswerPanelProps) => {
  const isDisabled = isSubmitting || hasAnswered;

  return (
    <div className="bg-white overflow-auto">
      <div className="sticky top-0 bg-white border-b p-4 shadow-sm z-10">
        <div className='flex gap-2 items-center'>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearQuestion}
          >
            <ArrowLeft className='size-5 ' />
          </Button>
          <h3 className="font-semibold text-lg mb-1 -ml-1 mr-1">Selected Question</h3>
          {selectedQuestion?.questionType &&
            <Badge variant="outline" className="text-[10px] h-6">
              {selectedQuestion.questionType}
            </Badge>}
        </div>

        {!selectedQuestion ? (
          <p className="text-sm text-gray-500">No question selected</p>
        ) : (
          <div className="mt-2 space-y-2">
            <div className="p-3 bg-blue-50 border rounded-lg">
              {selectedQuestion.question}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {!selectedQuestion ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-10 w-10 mx-auto mb-3" />
            Select a question
          </div>
        ) : selectedJurorCount === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="h-10 w-10 mx-auto mb-3" />
            Select jurors from the list
          </div>
        ) : (
          <div className="space-y-4">
            {hasAnswered && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Answer saved for selected jurors
              </div>
            )}

            {selectedQuestion.questionType === 'TEXT' && (
              <Textarea
                value={answer}
                onChange={e => onAnswerChange(e.target.value)}
                disabled={isDisabled}
                rows={4}
              />
            )}

            {selectedQuestion.questionType === 'YES_NO' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Response
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => onYesNoChange('yes')}
                    disabled={isDisabled}
                    className={`h-12 text-lg border font-semibold ${yesNoChoice === 'yes'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white hover:bg-green-50 text-gray-900'
                      }`}
                  >
                    ✓ Yes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onYesNoChange('no')}
                    disabled={isDisabled}
                    className={`h-12 border text-lg font-semibold ${yesNoChoice === 'no'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white hover:bg-red-50 text-gray-900'
                      }`}
                  >
                    ✗ No
                  </Button>
                </div>
              </div>
            )}

            {selectedQuestion.questionType === 'RATING' && (
              <div className="space-y-6">
                {/* Likelihood Scale Section (1-5) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Rate Likelihood (1-5 Scale)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "1", label: "Very Unlikely" },
                      { value: "2", label: "Unlikely" },
                      { value: "3", label: "Neutral" },
                      { value: "4", label: "Likely" },
                      { value: "5", label: "Very Likely" }
                    ].map(({ value, label }) => (
                      <Button
                        key={value}
                        type="button"
                        onClick={() => onRatingChange(value)}
                        disabled={isDisabled}
                        variant="outline"
                        className={`h-auto py-4 px-3 flex-1 min-w-[140px] border rounded-md transition-all text-left
                          ${rating === value
                            ? 'border-blue-600 bg-blue-50 ring-0.5 ring-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className=' border-gray-300 text-gray-700'
                          >
                            <span className="font-semibold">{value}.</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800">{label}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Alternative Compact View for Mobile */}
                <div className="sm:hidden">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Quick Selection
                  </Label>
                  <div className="flex justify-between gap-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const v = (i + 1).toString();
                      return (
                        <button
                          key={v}
                          onClick={() => onRatingChange(v)}
                          disabled={isDisabled}
                          className={`flex-1 h-12 flex items-center justify-center border rounded transition-colors
                ${rating === v
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          <span className="font-semibold">{v}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Selection Display */}
                {rating && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">Selected Rating:</div>
                        <div className="text-gray-800 font-semibold mt-1">
                          {rating === "1" ? "Very Unlikely" :
                            rating === "2" ? "Unlikely" :
                              rating === "3" ? "Neutral" :
                                rating === "4" ? "Likely" : "Very Likely"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {rating === "1" ? "Strongly unlikely to agree with the position" :
                            rating === "2" ? "Tends to disagree with the position" :
                              rating === "3" ? "No clear inclination either way" :
                                rating === "4" ? "Tends to agree with the position" :
                                  "Strongly likely to agree with the position"}
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-2 sm:mt-0">
                        <div className="text-2xl font-bold text-gray-900">{rating}/5</div>
                        <div className="text-xs text-gray-500 text-center">Rating</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={onSubmit}
              className="w-full"
              disabled={
                isDisabled ||
                (selectedQuestion.questionType === 'TEXT' && !answer.trim()) ||
                (selectedQuestion.questionType === 'YES_NO' && !yesNoChoice) ||
                (selectedQuestion.questionType === 'RATING' && !rating)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                `Submit Answer (${selectedJurorCount})`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswerPanel;
