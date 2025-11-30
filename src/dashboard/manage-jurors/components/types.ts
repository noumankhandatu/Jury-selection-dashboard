import type { Case } from "@/components/shared/select-case";

export interface Juror {
  id: string;
  name: string;
  age: number;
  occupation: string;
  education: string;
  experience: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  address: string;
  biasStatus: "low" | "moderate" | "high";
  caseId: string;
  isStrikedOut?: boolean;
  // Additional fields from PDF
  dateOfBirth: string;
  race: string;
  gender: "male" | "female" | null; // Normalized to lowercase or null
  employer: string;
  maritalStatus: string;
  citizenship: string;
  county: string;
  tdl: string;
  workPhone: string;
  employmentDuration: string;
  children: string;
  panelPosition: number | null; // Panel position number (null if not specified)
  jurorNumber: string;
  criminalCase: string;
  accidentalInjury: string;
  civilJury: string;
  criminalJury: string;
  spouse: string;
  mailingAddress: string;
}

export interface CaseSelectorProps {
  cases: Case[];
  selectedCase: Case | null;
  onCaseSelect: (case_: Case) => void;
  jurorsByCase: Record<string, Juror[]>;
}

export interface PDFUploaderProps {
  selectedCase: Case;
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadError: string;
  uploadSuccess: string;
}

export interface JurorDisplayProps {
  selectedCase: Case;
  jurors: Juror[];
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onViewDetails: (juror: Juror) => void;
}

export interface JurorCardProps {
  juror: Juror;
  onViewDetails: (juror: Juror) => void;
  isHighlighted?: boolean;
}

export interface JurorDetailsDialogProps {
  juror: Juror | null;
  isOpen: boolean;
  onClose: () => void;
}
