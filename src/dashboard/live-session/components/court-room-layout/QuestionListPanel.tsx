import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Question, QuestionType } from '@/types/questions';
import { getCaseQuestionsApi } from '@/api/api';
import { QuestionRowShimmer } from '@/components/shimmer/question-row';

interface QuestionListPanelProps {
  selectedCaseId?: string;
  onSelectQuestion: (question: Question) => void;
  questions:Question[],
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}

const QuestionListPanel = ({
  selectedCaseId,
  onSelectQuestion,
  setQuestions,
  questions
}: QuestionListPanelProps) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCaseId) {
      fetchQuestions();
    }
  }, [selectedCaseId]);

  const fetchQuestions = async () => {
    if (!selectedCaseId) return;
    try {
      setLoading(true);
      const response = await getCaseQuestionsApi(selectedCaseId);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'TEXT': return '📝';
      case 'YES_NO': return '✓';
      case 'RATING': return '⭐';
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
        {loading ? (
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
          questions.map(question => (
            <div
              key={question.id}
              className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition group"
              onClick={() => onSelectQuestion(question)}
            >
              {/* Top row: Icon and question type on left */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">
                    {getQuestionTypeIcon(question.questionType)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs whitespace-nowrap"
                  >
                    {question.questionType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Question text */}
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 break-words mb-2">
                {question.question}
              </p>

              {/* Tags - can wrap to multiple lines */}
              <div className="flex flex-wrap gap-1">
                {question.tags.map(tag => (
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