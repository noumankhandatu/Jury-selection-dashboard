// types/sessions.ts

export interface LiveSessionDataProps {
  jurors: any[];
  caseSelected: any;
  onSessionCreated: (id: string, status: SessionStatus) => void;
  refreshSessionData: number;
  setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  sessionId: string | null;
  sessionStatus?: SessionStatus | null;
  onSessionStatusUpdate?: (status: SessionStatus) => void;
  onStartSessionClick?: () => void;
  onEndSessionClick?: () => void;
  isStartDisabled?: boolean;
}

export interface SessionStatus {
  status: 'active' | 'pending' | 'completed';
}

export interface StatusStyling {
  dotColor: string;
  badgeVariant: "default" | "secondary" | "destructive";
  badgeText: string;
  badgeClass: string;
}

export interface SessionStats {
  assignments: number;
  totalJurors: number;
  responses: number;
  assessments: number;
}

export interface SessionControlsProps {
  sessionActive: boolean;
  caseSelected: any;
  sessionStatus: SessionStatus | null;
  onStartSessionClick: () => void;
  onEndSessionClick: () => void;
  isStartDisabled?: boolean;
}

// Props for SessionStats component
export interface SessionStatsProps {
  assignments: number;
  totalJurors: number;
  responses: number;
  assessments: number;
  isLoading: boolean;
}

// Props for SessionStatusComponent
export interface SessionStatusProps {
  sessionId: string | null;
  sessionStatus: SessionStatus | null;
  onStatusChange: (status: SessionStatus) => void;
}

// For API response handling
export interface CreateSessionResponse {
  success?: boolean;
  data?: {
    session?: {
      id: string;
      status: string;
    };
    id?: string;
    status?: string;
  };
  session?: {
    id: string;
    status: string;
  };
  isExisting?: boolean;
  message?: string;
}