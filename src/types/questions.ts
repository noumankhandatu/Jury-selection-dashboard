// types/question.ts (or types.ts)
export type QuestionType = 'YES_NO' | 'TEXT' | 'RATING';

export interface QuestionTag {
  name: string;
  category: string;
  description?: string;
}

export interface GeneratedQuestion {
  question: string;
  tags: string[];
  percentage: number;
  questionType: QuestionType;
}

export interface AIQuestionsResponse {
  questions: GeneratedQuestion[];
  total?: number;
  generatedAt?: string;
}

// For the form/component state
export interface QuestionWithSelection extends GeneratedQuestion {
  selected: boolean;
}

// For the form data
export interface CaseFormData {
  caseName: string;
  caseType: string;
  description: string;
  jurorTraits: string;
}