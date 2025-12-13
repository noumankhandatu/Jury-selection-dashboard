import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Question, QuestionType } from '@/types/questions';
import { getCaseQuestionsApi } from '@/api/api';
import { QuestionRowShimmer } from '@/components/shimmer/question-row';

interface SelectQuestionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCaseId?: string;
  onSelectQuestion: (question: Question) => void;
}

const SelectQuestionDialog = ({
  isOpen,
  onOpenChange,
  selectedCaseId,
  onSelectQuestion
}: SelectQuestionDialogProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedCaseId) {
      fetchQuestions();
    }
  }, [isOpen, selectedCaseId]);

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

  const handleSelect = (question: Question) => {
    onSelectQuestion(question);
    onOpenChange(false);
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'TEXT': return '📝';
      case 'YES_NO': return '✓';
      case 'RATING': return '⭐';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select Question</DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-auto space-y-3 py-4">
          {loading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuestionRowShimmer key={i} />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No questions available</div>
          ) : (
            questions.map(question => (
              <div
                key={question.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition group"
                onClick={() => handleSelect(question)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getQuestionTypeIcon(question.questionType)}</div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed font-medium text-gray-900 group-hover:text-blue-600">
                      {question.question}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {question.questionType.replace('_', ' ')}
                      </Badge>
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectQuestionDialog;