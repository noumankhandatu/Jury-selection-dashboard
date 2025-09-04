import { Badge } from "@/components/ui/badge";
import JurorCard, { CaseJuror } from "./JurorCard";

interface JuryBoxProps {
  jurors: CaseJuror[];
  boxNumber: number;
  selectedJurors: CaseJuror[];
  onJurorClick: (juror: CaseJuror) => void;
  scoresByJurorId?: Record<string, {
    overallScore?: number;
  }>;
  waitingJurors?: Set<string>;
}

const JuryBox = ({ jurors, boxNumber, selectedJurors, onJurorClick, scoresByJurorId, waitingJurors }: JuryBoxProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow p-4 group">
      <div className="text-center mb-3">
        <Badge variant="outline" className="text-xs font-medium">
          Box {boxNumber}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {jurors.map((juror) => (
          <JurorCard
            key={juror.id}
            juror={juror}
            isSelected={selectedJurors.some(j => j.id === juror.id)}
            onClick={onJurorClick}
            overallScore={scoresByJurorId?.[juror.id]?.overallScore}
            isWaiting={waitingJurors?.has(juror.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default JuryBox;
