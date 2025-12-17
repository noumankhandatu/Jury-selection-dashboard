import { Badge } from '@/components/ui/badge';
import { Hash, UserPlus, Check, User, UserRound } from 'lucide-react';
import { CaseJuror } from '@/types/court-room';
import { Question } from '@/types/questions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OverallGauge from '@/components/shared/overall-gauge';
import { generateAvatar } from '@/dashboard/manage-jurors/components/utils';

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
      <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
          <UserPlus className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-400">No jurors available</p>
          <p className="text-sm text-gray-400 mt-2">Add jurors to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[70%] border-r bg-white overflow-auto">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Jurors</h2>
            <p className="text-sm text-gray-600 mt-1">
              {sessionJurors.length} juror{sessionJurors.length !== 1 ? 's' : ''} • {selectedJurorIds.size} selected
            </p>
          </div>
          {selectedJurorIds.size > 0 && (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {selectedJurorIds.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sessionJurors.map(juror => {
            const isSelected = selectedJurorIds.has(juror.id);
            const overallScore = scoresByJurorId[juror.id]?.overallScore;

            const responseKey = selectedQuestion ? `${juror.id}-${selectedQuestion.id}` : '';
            const response = responseKey ? jurorResponses[responseKey]?.response : undefined;

            // Determine avatar border based on response
            let cardBorder = 'border-gray-300';
            if (isSelected) {
              cardBorder = 'border-blue-500';
            }
            if (selectedQuestion?.questionType === 'YES_NO') {
              if (response === 'yes') {
                cardBorder = 'border-green-500';
              } else if (response === 'no') {
                cardBorder = 'border-red-500';
              }
            }
            // Generate avatar initials
            const initials = juror.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={juror.id}
                onClick={() => onJurorToggle(juror)}
                className={`relative flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${cardBorder}
                  ${isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}
                  `}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}

                {/* Avatar */}
                <div className="relative mb-3">
                  <Avatar className="h-14 w-14 border-4 shadow-sm">
                    <AvatarImage
                      src={generateAvatar(juror.name, juror.gender)}
                      alt={juror.name}
                      className="object-cover"
                    />
                    <AvatarFallback className={`text-lg font-semibold
                      ${juror.gender?.toLowerCase() === 'male'
                        ? 'bg-blue-100 text-blue-700'
                        : juror.gender?.toLowerCase() === 'female'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Gender Icon */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow
                    ${juror.gender?.toLowerCase() === 'male'
                      ? 'bg-blue-500 text-white'
                      : juror.gender?.toLowerCase() === 'female'
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                    {juror.gender?.toLowerCase() === 'male' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <UserRound className="h-3 w-3" />
                    )}
                  </div>
                </div>

                {/* Juror Info */}
                <div className="text-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm truncate w-full">
                    <span className='text-base block'>#{juror.jurorNumber}</span> {juror.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    {juror.age > 0 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {juror.age}
                      </Badge>
                    )}
                    {juror.occupation && (
                      <span className="text-xs text-gray-600 truncate max-w-[80px]">
                        {juror.occupation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Overall Gauge */}
                  <div className="flex flex-col justify-center items-center w-full my-2">
                    <OverallGauge
                      valuePercent={overallScore || 0}
                      size="sm"
                      showLabel={false}
                    />
                    <div className="text-xs text-center -mt-1 text-gray-600 font-medium">
                      {(overallScore || 0).toFixed(1)}%
                    </div>
                  </div>

                {/* Panel Position Badge */}
                {juror.panelPosition !== null && juror.panelPosition !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    Panel {juror.panelPosition}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JurorListPanel;