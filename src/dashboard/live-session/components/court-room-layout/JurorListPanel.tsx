import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Hash, UserPlus } from 'lucide-react';
import { CaseJuror } from '@/types/court-room';

// Utility: Generate avatar
const generateAvatar = (name: string, gender: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/${gender === 'Male' ? 'avataaars' : 'avataaars-neutral'}/svg?seed=${seed}`;
};

interface JurorListPanelProps {
  sessionJurors: CaseJuror[];
  selectedJuror: CaseJuror | null;
  scoresByJurorId: Record<string, { overallScore?: number }>;
  onJurorClick: (juror: CaseJuror) => void;
}

const JurorListPanel = ({
  sessionJurors,
  selectedJuror,
  scoresByJurorId,
  onJurorClick
}: JurorListPanelProps) => {
  if (sessionJurors.length === 0) {
    return (
      <div className="w-[70%] border-r bg-white overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <UserPlus className="h-12 w-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No jurors selected</p>
          <p className="text-sm">Click "Add Juror" to add jurors to this session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[70%] border-r bg-white overflow-auto">
      <div className="p-4 space-y-2">
        {sessionJurors.map(juror => {
          const isSelected = selectedJuror?.id === juror.id;
          const score = scoresByJurorId[juror.id]?.overallScore;
          
          return (
            <div
              key={juror.id}
              onClick={() => onJurorClick(juror)}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Avatar className="h-12 w-12 border-2 border-white shadow">
                <AvatarImage src={generateAvatar(juror.name, juror.gender)} />
                <AvatarFallback>{juror.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  #{juror.jurorNumber} - {juror.name}
                </div>
                <div className="text-sm text-gray-600">
                  {juror.age} years • {juror.gender} • {juror.occupation}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {juror.panelPosition !== null && juror.panelPosition !== undefined && (
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300">
                    <Hash className="h-3 w-3 mr-1" />
                    Panel {juror.panelPosition}
                  </Badge>
                )}
                {typeof score === 'number' && (
                  <Badge className="text-xs bg-green-100 hover:bg-green-100 text-green-700 border-green-300">
                    Score: {score.toFixed(2)}%
                  </Badge>
                )}
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JurorListPanel;