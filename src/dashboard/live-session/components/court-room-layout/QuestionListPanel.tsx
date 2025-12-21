import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Question, QuestionType } from '@/types/questions';
import { QuestionRowShimmer } from '@/components/shimmer/question-row';
import { Pencil } from 'lucide-react';

interface QuestionListPanelProps {
  onSelectQuestion: (question: Question) => void;
  onEditQuestion?: (question: Question, index: number) => void;
  questions: Question[];
  isQuestionLoading: boolean;
}

const QuestionListPanel = ({
  onSelectQuestion,
  onEditQuestion,
  questions,
  isQuestionLoading,
}: QuestionListPanelProps) => {


  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'TEXT': return '📝';
      case 'YES_NO': return '✓';
      case 'RATING': return '⭐';
    }
  };

  const handleEditClick = (e: React.MouseEvent, question: Question, index: number) => {
    e.stopPropagation(); // Prevent triggering onSelectQuestion
    if (onEditQuestion) {
      onEditQuestion(question, index);
    }
  };

  return (
    <div className="flex-1 h-full bg-white overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Select Question</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a question to answer for selected jurors
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-3">
        {isQuestionLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <QuestionRowShimmer key={i} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No questions available for this case
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="group p-3 sm:p-4 border rounded-lg cursor-pointer transition relative"
              onClick={() => onSelectQuestion(question)}
            >
              {/* Top row: Icon and question type on left, edit button on right */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">
                    {getQuestionTypeIcon(question.questionType)}
                  </span>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {question.questionType.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {question.asked && (
                    <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">
                      Asked
                    </Badge>
                  )}

                  {onEditQuestion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(e, question, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      title="Edit question"
                    >
                      <Pencil className="h-3.5 w-3.5 text-blue-600" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Question text */}
              <p className="text-sm font-medium text-gray-900 break-words mb-2">
                {question.question}
              </p>

              {/* Tags and percentage */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Percentage badge */}
                {question.percentage && (
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                    {question.percentage}% relevant
                  </Badge>
                )}

                {/* Tags */}
                {question.tags && question.tags.length > 0 && question.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs truncate max-w-[120px]"
                    title={tag}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <p className="text-sm text-gray-600">
          {questions.length} question{questions.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
};

export default QuestionListPanel;