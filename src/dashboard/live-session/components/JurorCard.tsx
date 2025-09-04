import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OverallGauge from "@/components/shared/overall-gauge";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";

// Types
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

// Case-specific juror interface matching the API response
export interface CaseJuror {
  id: string;
  jurorNumber: string;
  name: string;
  age: number;
  gender: string;
  race: string;
  occupation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface JurorCardProps {
  juror: CaseJuror;
  isSelected: boolean;
  onClick: (juror: CaseJuror) => void;
  overallScore?: number;
  isWaiting?: boolean;
}

const JurorCard = ({ juror, isSelected, onClick, overallScore, isWaiting }: JurorCardProps) => {
  const getCardStyles = () => {
    const baseStyles = "flex flex-col items-center justify-center space-y-1 p-2 bg-white rounded-md shadow-sm border transition cursor-pointer";
    const selectedStyles = isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:shadow-md';
    return `${baseStyles} ${selectedStyles}`;
  };

  return (
    <div
      key={juror.id}
      onClick={() => onClick(juror)}
      className={getCardStyles()}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-white shadow rounded-full">
          <AvatarImage src={generateAvatar(juror.name)} alt={juror.name} className="rounded-full" />
          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
            {juror.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        
        {/* Pulsing red notification circle - only show when waiting */}
        {isWaiting && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 text-center">
        #{juror.jurorNumber}
      </span>

      {typeof overallScore === 'number' && (
        <div className="mt-1">
          <OverallGauge valuePercent={overallScore} size="sm" />
        </div>
      )}

      {isSelected && (
        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

export default JurorCard;
