import { CaseData } from "@/api/types";
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
  selectedCase: any;
  sessionId?: string;
  onRefreshSessionData?: () => void;
}

// case
export interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
}

// Update the AI case data interface
export interface AICaseData {
  caseName: string;
  caseType: string;
  description: string;
  jurorTraits: string;
}

export interface QuestionAnswerPanelProps {
  selectedQuestion: Question | null;
  selectedJurorCount: number;
  handleClearQuestion: ()=>void;
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
