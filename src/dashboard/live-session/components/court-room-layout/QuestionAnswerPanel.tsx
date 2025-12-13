import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { CaseJuror } from '@/types/court-room';
import { Question } from '@/types/questions';

// Utility: Generate avatar
const generateAvatar = (name: string, gender: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/${gender === 'Male' ? 'avataaars' : 'avataaars-neutral'}/svg?seed=${seed}`;
};

interface QuestionAnswerPanelProps {
  selectedQuestion: Question | null;
  selectedJuror: CaseJuror | null;
  answer: string;
  yesNoChoice: string;
  rating: string;
  isSubmitting: boolean;
  hasAnswered: boolean;
  onAnswerChange: (value: string) => void;
  onYesNoChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onSubmit: () => void;
}

const QuestionAnswerPanel = ({
  selectedQuestion,
  selectedJuror,
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
      {/* Sticky Header - Selected Question */}
      <div className="sticky top-0 bg-white border-b p-4 shadow-sm z-10">
        <h3 className="font-semibold text-gray-900 mb-1">Selected Question</h3>
        {!selectedQuestion ? (
          <p className="text-sm text-gray-500">No question selected</p>
        ) : (
          <div className="mt-2 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-900 leading-relaxed">{selectedQuestion.question}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {selectedQuestion.questionType === 'TEXT' ? '📝 Text' : 
                 selectedQuestion.questionType === 'YES_NO' ? '✓ Yes/No' : 
                 '⭐ Rating'}
              </Badge>
              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                selectedQuestion.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Answer Section */}
      <div className="p-4">
        {!selectedQuestion ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Select a question to begin</p>
          </div>
        ) : !selectedJuror ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Select a juror from the list to answer on their behalf</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Juror Info */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Answering for: #{selectedJuror.jurorNumber}
              </Label>
              <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={generateAvatar(selectedJuror.name, selectedJuror.gender)} />
                    <AvatarFallback>{selectedJuror.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{selectedJuror.name}</div>
                    <div className="text-xs text-gray-600">{selectedJuror.occupation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Already Answered Badge */}
            {hasAnswered && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Answer submitted successfully</span>
              </div>
            )}

            {/* Dynamic Response Input based on Question Type */}
            {selectedQuestion.questionType === 'TEXT' && (
              <div>
                <Label htmlFor="answer-input" className="text-sm font-medium text-gray-700">
                  Answer
                </Label>
                <Textarea
                  id="answer-input"
                  placeholder="Type the juror's response..."
                  value={answer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="mt-2"
                  disabled={isDisabled}
                  rows={4}
                />
              </div>
            )}

            {selectedQuestion.questionType === 'YES_NO' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Response
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={yesNoChoice === 'yes' ? 'default' : 'outline'}
                    onClick={() => onYesNoChange('yes')}
                    disabled={isDisabled}
                    className={`h-14 text-lg font-semibold ${
                      yesNoChoice === 'yes' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'hover:bg-green-50'
                    }`}
                  >
                    ✓ Yes
                  </Button>
                  <Button
                    type="button"
                    variant={yesNoChoice === 'no' ? 'default' : 'outline'}
                    onClick={() => onYesNoChange('no')}
                    disabled={isDisabled}
                    className={`h-14 text-lg font-semibold ${
                      yesNoChoice === 'no' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'hover:bg-red-50'
                    }`}
                  >
                    ✗ No
                  </Button>
                </div>
              </div>
            )}

            {selectedQuestion.questionType === 'RATING' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select Rating
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={rating === value.toString() ? 'default' : 'outline'}
                      onClick={() => onRatingChange(value.toString())}
                      disabled={isDisabled}
                      className={`h-16 flex flex-col items-center justify-center ${
                        rating === value.toString()
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'hover:bg-amber-50'
                      }`}
                    >
                      <span className="text-2xl mb-1">⭐</span>
                      <span className="text-xs font-bold">{value}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={onSubmit}
              disabled={
                isDisabled ||
                (selectedQuestion.questionType === 'TEXT' && !answer.trim()) ||
                (selectedQuestion.questionType === 'YES_NO' && !yesNoChoice) ||
                (selectedQuestion.questionType === 'RATING' && !rating)
              }
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : hasAnswered ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Answer Saved
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswerPanel;