export type QuestionType = 'YES_NO' | 'TEXT' | 'RATING';

export interface QuestionTag {
  name: string;
  category: string;
  description?: string;
}

export interface Question {
  id:string;
  question: string;
  tags: string[];
  percentage: number;
  questionType: QuestionType;
}

export interface AIQuestionsResponse {
  questions: Question[];
  total?: number;
  generatedAt?: string;
}

// For the form/component state
export interface QuestionWithSelection extends Question {
  selected: boolean;
}

// For the form data
export interface CaseFormData {
  caseName: string;
  caseType: string;
  description: string;
  jurorTraits: string;
}