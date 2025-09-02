import { SelectCase } from "@/components/shared/select-case";
import { SelectSession, type SessionItem } from "@/components/shared/select-session";
import type { Case as UISelectCase } from "@/components/shared/select-case";

interface Props {
  cases: UISelectCase[];
  selectedCase: UISelectCase | null;
  onCaseSelect: (c: UISelectCase) => void;
  sessions: SessionItem[];
  selectedSession: SessionItem | null;
  onSessionSelect: (s: SessionItem) => void;
  isLoading: boolean;
  error: string;
}

export const Selectors = ({
  cases,
  selectedCase,
  onCaseSelect,
  sessions,
  selectedSession,
  onSessionSelect,
  isLoading,
  error,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <SelectCase
          cases={cases}
          selectedCase={selectedCase}
          onCaseSelect={onCaseSelect}
          title="Select Case for Session Analysis"
          description={isLoading ? "Loading cases..." : "Pick a case to view analysis"}
        />
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      {selectedCase && (
        <div>
          <SelectSession
            sessions={sessions}
            selectedSession={selectedSession}
            onSessionSelect={onSessionSelect}
            title="Select Session"
            description={sessions.length ? "Pick a session to analyze" : "No sessions found for this case"}
          />
        </div>
      )}
    </div>
  );
};


