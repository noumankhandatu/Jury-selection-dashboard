import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageSquare } from 'lucide-react';
import { CaseJuror, CourtroomLayoutProps } from '@/types/court-room';
import { Question, QuestionType } from '@/types/questions';
import {
  assignQuestionsToJurorsApi,
  saveJurorResponseApi,
  assessResponseApi,
  getSessionScoresApi,
} from "@/api/api";
import SelectJurorsDialog from './SelectJurorsDialog';
import QuestionAnswerPanel from './QuestionAnswerPanel';
import SelectQuestionDialog from './SelectQuestionDialog';
import JurorListPanel from './JurorListPanel';

interface JurorResponse {
  questionId: string;
  response: string;
  responseType: QuestionType;
}

// Main LiveSessionLayout Component
const CourtroomLayout = ({
  allJurors = [],
  selectedCaseId,
  sessionId,
  onRefreshSessionData
}: CourtroomLayoutProps) => {
  // Session State
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedJuror, setSelectedJuror] = useState<CaseJuror | null>(null);
  
  // Answer States
  const [answer, setAnswer] = useState('');
  const [yesNoChoice, setYesNoChoice] = useState('');
  const [rating, setRating] = useState('');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showJurorDialog, setShowJurorDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  
  // Data States
  const [scoresByJurorId, setScoresByJurorId] = useState<Record<string, { overallScore?: number }>>({});
  const [jurorResponses, setJurorResponses] = useState<Record<string, JurorResponse>>({});

  // Handlers
  const handleSelectQuestion = async (question: Question) => {
    setSelectedQuestion(question);
    resetAnswerFields();

    // IMPORTANT: Assign question to all session jurors
    if (sessionId && allJurors.length > 0) {
      try {
        await assignQuestionsToJurorsApi({
          sessionId,
          assignments: [{
            questionId: question.id,
            jurorIds: allJurors.map(j => j.id),
          }],
        });
      } catch (err) {
        console.error("Failed to assign question to jurors:", err);
      }
    }
  };

  const handleJurorClick = (juror: CaseJuror) => {
    setSelectedJuror(juror);
    
    // Load existing answer if available
    const responseKey = `${juror.id}-${selectedQuestion?.id}`;
    const existingResponse = jurorResponses[responseKey];
    
    if (existingResponse) {
      // Pre-fill the answer fields based on question type
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
  };

  const resetAnswerFields = () => {
    setAnswer('');
    setYesNoChoice('');
    setRating('');
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !selectedQuestion || !selectedJuror) return;

    let responseValue = '';
    let responseType = 'TEXT' as QuestionType;

    // Determine response value and type based on question type
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
      const saved = await saveJurorResponseApi({
        sessionId,
        questionId: selectedQuestion.id,
        jurorId: selectedJuror.id,
        response: responseValue,
        responseType
      });

      // Store the response locally
      const responseKey = `${selectedJuror.id}-${selectedQuestion.id}`;
      setJurorResponses(prev => ({
        ...prev,
        [responseKey]: {
          questionId: selectedQuestion.id,
          response: responseValue,
          responseType
        }
      }));

      const responseId = saved?.response?.id;
      if (responseId) {
        await assessResponseApi(responseId);
        const scores = await getSessionScoresApi(sessionId);
        const arr = scores?.scores || [];
        const mapped: Record<string, any> = {};
        arr.forEach((s: any) => {
          if (s?.jurorId) {
            mapped[s.jurorId] = { overallScore: s.overallScore };
          }
        });
        setScoresByJurorId(mapped);
      }

      if (onRefreshSessionData) {
        onRefreshSessionData();
      }

      // Don't reset fields - keep them filled to show the answer was saved
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current juror has already answered current question
  const hasAnswered = selectedJuror && selectedQuestion 
    ? `${selectedJuror.id}-${selectedQuestion.id}` in jurorResponses
    : false;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Session</h2>
            <p className="text-sm text-gray-600">
              {allJurors.length} Juror{allJurors.length !== 1 ? 's' : ''} in session
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowQuestionDialog(true)}
              className="flex items-center gap-2"
              disabled={!selectedCaseId}
            >
              <MessageSquare className="h-4 w-4" />
              Ask Question
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 70/30 Split */}
      <div className="flex flex-1 overflow-hidden">
        <JurorListPanel
          sessionJurors={allJurors}
          selectedJuror={selectedJuror}
          scoresByJurorId={scoresByJurorId}
          onJurorClick={handleJurorClick}
        />

        <QuestionAnswerPanel
          selectedQuestion={selectedQuestion}
          selectedJuror={selectedJuror}
          answer={answer}
          yesNoChoice={yesNoChoice}
          rating={rating}
          isSubmitting={isSubmitting}
          hasAnswered={hasAnswered}
          onAnswerChange={setAnswer}
          onYesNoChange={setYesNoChoice}
          onRatingChange={setRating}
          onSubmit={handleSubmitAnswer}
        />
      </div>

      {/* Dialogs */}
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