import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Hash, UserPlus, Check } from 'lucide-react';
import { CaseJuror } from '@/types/court-room';
import { Question } from '@/types/questions';

const generateAvatar = (name: string, gender: string) => {
  const seed = name.toLowerCase().replace(/\s+/g, '-');
  return `https://api.dicebear.com/7.x/${gender === 'Male' ? 'avataaars' : 'avataaars-neutral'
    }/svg?seed=${seed}`;
};

interface JurorListPanelProps {
  sessionJurors: CaseJuror[];
  selectedJurorIds: Set<string>;
  scoresByJurorId: Record<string, { overallScore?: number }>;
  jurorResponses: Record<string, { questionId: string; response: string; responseType: string }>;
  selectedQuestion: Question | null;
  onJurorToggle: (juror: CaseJuror) => void;
}

const JurorListPanel = ({
  sessionJurors,
  selectedJurorIds,
  scoresByJurorId,
  jurorResponses,
  selectedQuestion,
  onJurorToggle
}: JurorListPanelProps) => {

  if (sessionJurors.length === 0) {
    return (
      <div className="w-[70%] border-r bg-white overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <UserPlus className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No jurors available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[70%] border-r bg-white overflow-auto">
      <div className="p-4 space-y-2">
        {sessionJurors.map(juror => {
          const isSelected = selectedJurorIds.has(juror.id);
          const score = scoresByJurorId[juror.id]?.overallScore;

          const responseKey = selectedQuestion ? `${juror.id}-${selectedQuestion.id}` : '';
          const response = responseKey ? jurorResponses[responseKey]?.response : undefined;

          // Determine avatar border
          let avatarBorder = '';
          if (response === 'yes') avatarBorder = 'border-green-500';
          else if (response === 'no') avatarBorder = 'border-red-500';
          else avatarBorder = ''; // not answered yet

          return (
            <div
              key={juror.id}
              onClick={() => onJurorToggle(juror)}
              className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition
                ${isSelected
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-200 hover:border-gray-300'}
                  ${avatarBorder}
                  `}
            >
              <Avatar className="h-12 w-12 border-2 shadow-sm">
                <AvatarImage src={generateAvatar(juror.name, juror.gender)} />
                <AvatarFallback>
                  {juror.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="font-semibold">
                  #{juror.jurorNumber} – {juror.name}
                </div>
                <div className="text-sm text-gray-600">
                  {juror.age} • {juror.gender} • {juror.occupation}
                </div>
              </div>

              {typeof score === 'number' && (
                <Badge className="bg-green-100 hover:bg-green-100 text-green-700 text-xs">
                  {score.toFixed(2)}%
                </Badge>
              )}

              {juror.panelPosition !== null && (
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  Panel {juror.panelPosition}
                </Badge>
              )}

              {isSelected && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
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