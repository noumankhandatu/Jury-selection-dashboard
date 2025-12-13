import { Question } from "./questions";

export interface CaseJuror {
  id: string;
  jurorNumber: string;
  name: string;
  age: number;
  gender: string;
  race: string;
  occupation: string;
  status: string;
  panelPosition?: number | null;
  createdAt: string;
  updatedAt: string;
}


export interface CourtroomLayoutProps {
  allJurors?: CaseJuror[];
  selectedCaseId?: string;
  sessionId?: string;
  onRefreshSessionData?: () => void;
}


export interface QuestionAnswerPanelProps {
  selectedQuestion: Question | null;
  selectedJurorCount: number;
  answer: string;
  yesNoChoice: string;
  rating: string;
  isSubmitting: boolean;
  hasAnswered: boolean;
  onAnswerChange: (v: string) => void;
  onYesNoChange: (v: string) => void;
  onRatingChange: (v: string) => void;
  onSubmit: () => void;
}
