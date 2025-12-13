import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  UserPlus,
  Loader2,
  CheckCircle2,
  Star
} from 'lucide-react';
import { QuestionAnswerPanelProps } from '@/types/court-room';
import { Label } from 'recharts';

const QuestionAnswerPanel = ({
  selectedQuestion,
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
    <div className="w-[30%] bg-white overflow-auto">
      <div className="sticky top-0 bg-white border-b p-4 shadow-sm z-10">
        <div className='flex gap-3'>
          <h3 className="font-semibold text-lg mb-1">Selected Question</h3>
          <Badge variant="outline" className="text-xs">
            {selectedQuestion?.questionType}
          </Badge>
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
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => {
                  const v = i + 1;
                  return (
                    <button
                      key={v}
                      onClick={() => onRatingChange(v.toString())}
                      disabled={isDisabled}
                    >
                      <Star
                        className={`h-7 w-7 ${Number(rating) >= v
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                          }`}
                      />
                    </button>
                  );
                })}
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
