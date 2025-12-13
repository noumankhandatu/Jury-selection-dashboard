
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