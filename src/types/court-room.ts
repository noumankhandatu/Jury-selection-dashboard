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