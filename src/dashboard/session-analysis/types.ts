export interface ApiCase {
  id: string | number;
  caseNumber: string;
  caseName: string;
  caseType: string;
  createdAt: string;
  caseQuestions?: string[];
}

export interface ApiSessionCount {
  assignments: number;
  responses: number;
  assessments: number;
}

export interface ApiSession {
  id: string;
  name: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  caseId: string;
  _count?: ApiSessionCount;
}

export interface ApiSessionById extends ApiSession {
  case?: {
    caseNumber: string;
    caseName: string;
    caseType: string;
    idealJurorTraits?: string;
  };
  assignments?: any[];
  responses?: any[];
  scores?: any[];
}


