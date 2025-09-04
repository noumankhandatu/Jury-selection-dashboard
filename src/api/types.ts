export interface CaseData {
  caseType: string;
  caseName: string;
  description: string;
  idealJurorTraits: string;
}
export interface Juror {
  id: string;
  name: string;
  jurorNumber: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  race: string;
  email: string;
  phone: string;
  workPhone: string;
  address: string;
  mailingAddress: string;
  county: string;
  location: string;
  occupation: string;
  employer: string;
  employmentDuration: string;
  education: string;
  maritalStatus: string;
  spouse: string;
  children: string;
  citizenship: string;
  tdl: string;
  panelPosition: string;
  criminalCase: string;
  accidentalInjury: string;
  civilJury: string;
  criminalJury: string;
  biasStatus: string;
  availability: string;
  experience: string;
  caseId: string;
  source: string;
  createdAt: string;
}

export interface CreateJurorsPayload {
  caseId: string;
  caseName: string;
  caseNumber: string;
  totalJurors: number;
  submissionDate: string;
  jurors: Juror[];
}

export interface SessionCount {
  assignments: number;
  responses: number;
  assessments: number;
}

export interface SessionData {
  id: string;
  name: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  caseId: string;
  case: {
    caseNumber: string;
    caseName: string;
    caseType: string;
  };
  _count: SessionCount;
}

export interface SessionsByCaseResponse {
  sessions: SessionData[];
}

export type SessionStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface SessionStatusResponse {
  status: SessionStatus;
}