export interface CaseData {
  caseType: string;
  caseName: string;
  description: string;
  idealJurorTraits: string;
  caseQuestions: string[];
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
