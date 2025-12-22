import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { CaseJuror, CourtroomLayoutProps } from '@/types/court-room';
import { Question, QuestionType } from '@/types/questions';
import {
  saveJurorResponseApi,
  assessResponseApi,
  getSessionScoresApi,
  createQuestionApi,
  updateQuestionApi,
  suggestAIQuestionsApi,
} from "@/api/api";
import QuestionAnswerPanel from './QuestionAnswerPanel';
import QuestionListPanel from './QuestionListPanel';
import JurorListPanel from './JurorListPanel';
import { toast } from 'sonner';
import { AddQuestionDialog } from '@/dashboard/create-case/components/add-question-dialog';

const CourtroomLayout = ({
  allJurors = [],
  selectedCase,
  selectedCaseId,
  sessionId,
  onRefreshSessionData
}: CourtroomLayoutProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedJurorIds, setSelectedJurorIds] = useState<Set<string>>(new Set());
  const [waitingJurorIds, setWaitingJurorIds] = useState<Set<string>>(new Set());
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<{ question: Question; index: number } | null>(null);

  // Answer states
  const [answer, setAnswer] = useState('');
  const [yesNoChoice, setYesNoChoice] = useState('');
  const [rating, setRating] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoresByJurorId, setScoresByJurorId] =
    useState<Record<string, { overallScore?: number }>>({});
  const [jurorResponses, setJurorResponses] = useState<Record<string, any>>({});
  const [isLayoutFlipped, setIsLayoutFlipped] = useState(false);

  /* -------------------- QUESTION MANAGEMENT -------------------- */

  // Handle adding a new question
  const handleAddQuestion = async (question: Question) => {
    if (!selectedCaseId) {
      toast.error('No case selected');
      return;
    }

    try {
      // Convert percentage from 1-10 to 10-100 for API
      const questionData = {
        question: question.question,
        questionType: question.questionType,
        tags: question.tags || [],
        percentage: (question.percentage || 5) * 10,
        order: questions.length + 1,
      };

      const response = await createQuestionApi(selectedCaseId, questionData);

      // Convert percentage back from 10-100 to 1-10 for display
      const newQuestion = {
        ...response.data,
        tags: response.data.tags || [],
        percentage: Math.round((response.data.percentage || 50) / 10),
      };

      setQuestions(prev => [newQuestion, ...prev]);
      setShowAddQuestionDialog(false);
      toast.success('Question(s) added successfully');

    } catch (error: any) {
      console.error('Failed to add question:', error);
      toast.error(error?.response?.data?.error || 'Failed to add question');
    }
  };


  const handleSelectAllJurors = () => {
    const allIds = allJurors.map(j => j.id);
    setSelectedJurorIds(new Set(allIds));
  };

  const handleUnselectAllJurors = () => {
    setSelectedJurorIds(new Set());
  };


  // Handle editing a question
  const handleEditQuestion = async (updatedQuestion: Question, index: number) => {
    if (!editingQuestion) return;

    try {
      // Convert percentage from 1-10 to 10-100 for API
      const questionData = {
        question: updatedQuestion.question,
        questionType: updatedQuestion.questionType,
        tags: updatedQuestion.tags || [],
        percentage: (updatedQuestion.percentage || 5) * 10,
        order: index + 1,
      };

      const response = await updateQuestionApi(editingQuestion.question.id, questionData);

      // Convert percentage back from 10-100 to 1-10 for display
      const updated = {
        ...response.data,
        tags: response.data.tags || [],
        percentage: Math.round((response.data.percentage || 50) / 10),
      };

      setQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = updated;
        return newQuestions;
      });

      setShowAddQuestionDialog(false);
      setEditingQuestion(null);
      toast.success('Question updated successfully');

    } catch (error: any) {
      console.error('Failed to update question:', error);
      toast.error(error?.response?.data?.error || 'Failed to update question');
    }
  };

  // Open edit dialog
  const handleOpenEditQuestion = (question: Question, index: number) => {
    setEditingQuestion({ question, index });
    setShowAddQuestionDialog(true);
  };

  // Close dialog and reset editing state
  const handleCloseDialog = () => {
    setShowAddQuestionDialog(false);
    setEditingQuestion(null);
  };

  const generateQuestionsByAI = async (): Promise<string[]> => {
    try {
      const aiPayload = {
        caseName: selectedCase.name,
        caseType: selectedCase.type,
        description: selectedCase.caseDescription,
        jurorTraits: selectedCase.jurorTraits
      };

      const data = await suggestAIQuestionsApi(aiPayload);
      return data.questions || [];
    } catch (error) {
      console.error("Failed to generate AI questions:", error);
      toast.error("Failed to generate AI questions");
      return [];
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
  };

  const handleSelectQuestion = async (question: Question) => {
    if (!sessionId) return;

    setSelectedQuestion(question);

    if (selectedJurorIds.size === 0) return;

    const jurorIds = Array.from(selectedJurorIds);
  };

  const handleClearQuestion = () => {
    setSelectedQuestion(null);
  };
  /* -------------------- SUBMIT ANSWER (MULTI) -------------------- */

  // Update handleSubmitAnswer
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

    // Set waiting state immediately when question is asked
    setWaitingJurorIds(new Set(selectedJurorIds));

    try {
      const responseIds: string[] = [];

      //  1. Save responses (blocking)
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

      // 2. UI cleanup immediately (no waiting)
      setSelectedJurorIds(new Set());
      resetAnswerFields();
      setIsSubmitting(false);
      setSelectedQuestion(null); // Auto-return to question list

      if (onRefreshSessionData) onRefreshSessionData();

      // 3. Background scoring (fire & forget)
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

          // Clear waiting jurors after scoring completes
          setWaitingJurorIds(new Set());
        } catch (err) {
          console.error("Background scoring failed:", err);
          // Clear waiting state even on error
          setWaitingJurorIds(new Set());
        }
      })();

    } catch (err: any) {
      console.error("Failed to submit answers:", err.response);
      toast.error(err?.response?.data?.error);
      setIsSubmitting(false);
      // Clear waiting state on error
      setWaitingJurorIds(new Set());
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Live Session</h2>
            <button
              onClick={() => setIsLayoutFlipped(!isLayoutFlipped)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Flip layout (Judge's Bench)"
              aria-label="Flip layout"
            >
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </button>
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
          waitingJurorIds={waitingJurorIds}
          onJurorToggle={handleJurorToggle}
          onSelectAllJurors={handleSelectAllJurors}
          onClearAllJurors={handleUnselectAllJurors}
          isLayoutFlipped={isLayoutFlipped}
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
              onEditQuestion={handleOpenEditQuestion}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Question Dialog */}
      <AddQuestionDialog
        isOpen={showAddQuestionDialog}
        onClose={handleCloseDialog}
        onEditQuestion={handleEditQuestion}
        onAddQuestion={handleAddQuestion}
        useGenerateQuestionByAI={true} // Enable AI generation
        generateQuestionsByAI={generateQuestionsByAI} // Pass AI function
        selectedCase={selectedCase} // Pass full case object
        caseDescription={selectedCase.caseDescription} // Optional
        jurorTraits={selectedCase.jurorTraits} // Optional
      />
    </div>
  );
};

export default CourtroomLayout;