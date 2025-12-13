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
import SelectQuestionDialog from './SelectQuestionDialog';
import JurorListPanel from './JurorListPanel';
import { toast } from 'sonner';

interface JurorResponse {
  questionId: string;
  response: string;
  responseType: QuestionType;
}

const CourtroomLayout = ({
  allJurors = [],
  selectedCaseId,
  sessionId,
  onRefreshSessionData
}: CourtroomLayoutProps) => {

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedJurorIds, setSelectedJurorIds] = useState<Set<string>>(new Set());

  // Answer states
  const [answer, setAnswer] = useState('');
  const [yesNoChoice, setYesNoChoice] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [scoresByJurorId, setScoresByJurorId] =
    useState<Record<string, { overallScore?: number }>>({});
  const [jurorResponses, setJurorResponses] = useState<Record<string, JurorResponse>>({});


  /* -------------------- HELPERS -------------------- */

  const resetAnswerFields = () => {
    setAnswer('');
    setYesNoChoice('');
    setRating('');
  };

  /* -------------------- QUESTION -------------------- */

  const handleSelectQuestion = async (question: Question) => {
    setSelectedQuestion(question);
    resetAnswerFields();

    if (!sessionId || selectedJurorIds.size === 0) return;

    await assignQuestionsToJurorsApi({
      sessionId,
      assignments: [{
        questionId: question.id,
        jurorIds: Array.from(selectedJurorIds),
      }],
    });
  };

  /* -------------------- JUROR MULTI SELECT -------------------- */

  const handleJurorToggle = async (juror: CaseJuror) => {
    setSelectedJurorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(juror.id)) newSet.delete(juror.id);
      else newSet.add(juror.id);
      return newSet;
    });

    //  Assign question to newly selected jurors if a question is selected
    if (selectedQuestion && sessionId) {
      try {
        await assignQuestionsToJurorsApi({
          sessionId,
          assignments: [{
            questionId: selectedQuestion.id,
            jurorIds: Array.from(selectedJurorIds).concat(juror.id), // include newly toggled juror
          }],
        });
      } catch (err) {
        console.error("Failed to assign question to jurors:", err);
      }
    }
  };


  /* -------------------- SUBMIT ANSWER (MULTI) -------------------- */

  const handleSubmitAnswer = async () => {
    if (!sessionId || !selectedQuestion || selectedJurorIds.size === 0) return;

    let responseValue = '';
    let responseType: QuestionType = 'TEXT';

    if (selectedQuestion.questionType === 'TEXT') {
      if (!answer.trim()) return;
      responseValue = answer.trim();
      responseType = 'TEXT';
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
      // Save responses for all selected jurors
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

        const responseId = saved?.response?.id;
        if (responseId) {
          await assessResponseApi(responseId);
        }
      }

      const scores = await getSessionScoresApi(sessionId);
      const mapped: Record<string, any> = {};
      scores?.scores?.forEach((s: any) => {
        if (s?.jurorId) mapped[s.jurorId] = { overallScore: s.overallScore };
      });
      setScoresByJurorId(mapped);

      if (onRefreshSessionData) onRefreshSessionData();

      // Unselect jurors after submission
      setSelectedJurorIds(new Set());
      resetAnswerFields();
    } catch (err: any) {
      console.error("Failed to submit answers:", err.response);
      toast.error(err?.response?.data?.error)
    } finally {
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
              {selectedJurorIds.size} juror(s) selected
            </p>
          </div>

          <Button onClick={() => setShowQuestionDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <JurorListPanel
          sessionJurors={allJurors}
          selectedJurorIds={selectedJurorIds}
          scoresByJurorId={scoresByJurorId}
          jurorResponses={jurorResponses}
          selectedQuestion={selectedQuestion}
          onJurorToggle={handleJurorToggle}
        />

        <QuestionAnswerPanel
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
      </div>

      <SelectQuestionDialog
        isOpen={showQuestionDialog}
        onOpenChange={setShowQuestionDialog}
        selectedCaseId={selectedCaseId}
        onSelectQuestion={handleSelectQuestion}
      />
    </div>
  );
};

export default CourtroomLayout;
