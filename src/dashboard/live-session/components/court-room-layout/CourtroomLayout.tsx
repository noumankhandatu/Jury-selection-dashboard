import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { CaseJuror, CourtroomLayoutProps } from '@/types/court-room';
import { Question, QuestionType } from '@/types/questions';
import {
  assignQuestionsToJurorsApi,
  saveJurorResponseApi,
  assessResponseApi,
  getSessionScoresApi,
} from "@/api/api";
import QuestionAnswerPanel from './QuestionAnswerPanel';
import QuestionListPanel from './QuestionListPanel';
import JurorListPanel from './JurorListPanel';
import { toast } from 'sonner';
import { AddQuestionDialog } from '@/dashboard/create-case/components/add-question-dialog';

const CourtroomLayout = ({
  allJurors = [],
  selectedCaseId,
  sessionId,
  onRefreshSessionData
}: CourtroomLayoutProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedJurorIds, setSelectedJurorIds] = useState<Set<string>>(new Set());
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]); // Add state for questions

  // Answer states
  const [answer, setAnswer] = useState('');
  const [yesNoChoice, setYesNoChoice] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoresByJurorId, setScoresByJurorId] =
    useState<Record<string, { overallScore?: number }>>({});
  const [jurorResponses, setJurorResponses] = useState<Record<string, any>>({});

  /* -------------------- QUESTION MANAGEMENT -------------------- */

  // Handle adding a new question
  const handleAddQuestion = async (question: Question) => {
    try {
      // TODO: Uncomment when API is ready
      // const newQuestion = await addQuestionByCaseId(selectedCaseId, question);

      // For now, add to local state with a temporary ID
      const newQuestion = {
        ...question,
        id: `temp-${Date.now()}`,
        caseId: selectedCaseId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQuestions(prev => [newQuestion, ...prev]);
      setShowAddQuestionDialog(false);
      toast.success('Question added successfully');

    } catch (error) {
      console.error('Failed to add question:', error);
      toast.error('Failed to add question');
    }
  };

  /* -------------------- HELPER FUNCTIONS -------------------- */

  const resetAnswerFields = () => {
    setAnswer('');
    setYesNoChoice('');
    setRating('');
  };

  /* -------------------- JUROR MULTI SELECT -------------------- */

  const handleJurorToggle = async (juror: CaseJuror) => {
    setSelectedJurorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(juror.id)) newSet.delete(juror.id);
      else newSet.add(juror.id);
      return newSet;
    });

    if (selectedQuestion && sessionId) {
      try {
        await assignQuestionsToJurorsApi({
          sessionId,
          assignments: [{
            questionId: selectedQuestion.id,
            jurorIds: Array.from(selectedJurorIds).concat(juror.id),
          }],
        });
      } catch (err) {
        console.error("Failed to assign question to jurors:", err);
      }
    }
  };

  const handleSelectQuestion = async (question: Question) => {
    if (!sessionId) return;

    setSelectedQuestion(question);

    if (selectedJurorIds.size === 0) return;

    const jurorIds = Array.from(selectedJurorIds);

    assignQuestionsToJurorsApi({
      sessionId,
      assignments: [
        {
          questionId: question.id,
          jurorIds,
        },
      ],
    }).catch(err => {
      console.error("Failed to assign question on select:", err);
    });
  };


  const handleClearQuestion = () => {
    setSelectedQuestion(null);
  };
  /* -------------------- SUBMIT ANSWER (MULTI) -------------------- */

  const handleSubmitAnswer = async () => {
    if (!sessionId || !selectedQuestion || selectedJurorIds.size === 0) return;

    let responseValue = '';
    let responseType: QuestionType = 'TEXT';

    if (selectedQuestion.questionType === 'TEXT') {
      if (!answer.trim()) return;
      responseValue = answer.trim();
    } else if (selectedQuestion.questionType === 'YES_NO') {
      if (!yesNoChoice) return;
      responseValue = yesNoChoice;
      responseType = 'YES_NO';
    } else if (selectedQuestion.questionType === 'RATING') {
      if (!rating) return;
      responseValue = rating;
      responseType = 'RATING';
    }

    setIsSubmitting(true);

    try {
      const responseIds: string[] = [];

      // ✅ 1. Save responses (blocking)
      for (const jurorId of selectedJurorIds) {
        const saved = await saveJurorResponseApi({
          sessionId,
          questionId: selectedQuestion.id,
          jurorId,
          response: responseValue,
          responseType,
        });

        const responseKey = `${jurorId}-${selectedQuestion.id}`;
        setJurorResponses(prev => ({
          ...prev,
          [responseKey]: {
            questionId: selectedQuestion.id,
            response: responseValue,
            responseType,
          },
        }));

        if (saved?.response?.id) {
          responseIds.push(saved.response.id);
        }
      }

      // ✅ 2. UI cleanup immediately (no waiting)
      setSelectedJurorIds(new Set());
      resetAnswerFields();
      setIsSubmitting(false);

      if (onRefreshSessionData) onRefreshSessionData();

      // ✅ 3. Background scoring (fire & forget)
      (async () => {
        try {
          await Promise.all(
            responseIds.map(id => assessResponseApi(id))
          );

          const scores = await getSessionScoresApi(sessionId);

          const mapped: Record<string, any> = {};
          scores?.scores?.forEach((s: any) => {
            if (s?.jurorId) {
              mapped[s.jurorId] = { overallScore: s.overallScore };
            }
          });

          setScoresByJurorId(mapped);
        } catch (err) {
          console.error("Background scoring failed:", err);
        }
      })();

    } catch (err: any) {
      console.error("Failed to submit answers:", err.response);
      toast.error(err?.response?.data?.error);
      setIsSubmitting(false);
    }
  };

  const hasAnswered =
    selectedQuestion &&
    selectedJurorIds.size > 0 &&
    Array.from(selectedJurorIds).every(
      jurorId => `${jurorId}-${selectedQuestion.id}` in jurorResponses
    );

  useEffect(() => {
    if (!selectedQuestion || selectedJurorIds.size !== 1) return;

    const jurorId = Array.from(selectedJurorIds)[0];
    const responseKey = `${jurorId}-${selectedQuestion.id}`;
    const existingResponse = jurorResponses[responseKey];

    if (existingResponse) {
      if (existingResponse.responseType === 'TEXT') {
        setAnswer(existingResponse.response);
        setYesNoChoice('');
        setRating('');
      } else if (existingResponse.responseType === 'YES_NO') {
        setYesNoChoice(existingResponse.response);
        setAnswer('');
        setRating('');
      } else if (existingResponse.responseType === 'RATING') {
        setRating(existingResponse.response);
        setAnswer('');
        setYesNoChoice('');
      }
    } else {
      resetAnswerFields();
    }
  }, [selectedJurorIds, selectedQuestion, jurorResponses]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Live Session</h2>
            <p className="text-sm text-gray-600">
              {selectedJurorIds.size} juror(s) selected • {questions.length} question(s) available
            </p>
          </div>

          <Button onClick={() => setShowAddQuestionDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <JurorListPanel
          sessionId={sessionId}
          sessionJurors={allJurors}
          selectedJurorIds={selectedJurorIds}
          scoresByJurorId={scoresByJurorId}
          jurorResponses={jurorResponses}
          selectedQuestion={selectedQuestion}
          onJurorToggle={handleJurorToggle}
        />

        <div className="flex-1 overflow-hidden border-l">
          {selectedQuestion ? (
            <QuestionAnswerPanel
              handleClearQuestion={handleClearQuestion}
              selectedQuestion={selectedQuestion}
              selectedJurorCount={selectedJurorIds.size}
              answer={answer}
              yesNoChoice={yesNoChoice}
              rating={rating}
              isSubmitting={isSubmitting}
              hasAnswered={!!hasAnswered}
              onAnswerChange={setAnswer}
              onYesNoChange={setYesNoChoice}
              onRatingChange={setRating}
              onSubmit={handleSubmitAnswer}
            />
          ) : (
            <QuestionListPanel
              selectedCaseId={selectedCaseId}
              onSelectQuestion={handleSelectQuestion}
              questions={questions}
              setQuestions={setQuestions}
            />
          )}
        </div>
      </div>

      {/* Add Question Dialog */}
      <AddQuestionDialog
        isOpen={showAddQuestionDialog}
        onClose={() => setShowAddQuestionDialog(false)}
        onAddQuestion={handleAddQuestion}
      />
    </div>
  );
};

export default CourtroomLayout;