import { Badge } from "@/components/ui/badge";
import JurorCard, { Juror } from "./JurorCard";

interface JuryBoxProps {
  jurors: Juror[];
  boxNumber: number;
  selectedJurors: Juror[];
  onJurorClick: (juror: Juror) => void;
  scoresByJurorId?: Record<string, {
    overallScore?: number;
  }>;
}

const JuryBox = ({ jurors, boxNumber, selectedJurors, onJurorClick, scoresByJurorId }: JuryBoxProps) => {
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
          />
        ))}
      </div>
    </div>
  );
};

export default JuryBox;
