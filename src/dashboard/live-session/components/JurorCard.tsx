import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types
export interface Juror {
  id: string | number;
  name: string;
}

interface JurorCardProps {
  juror: Juror;
  isSelected: boolean;
  onClick: (juror: Juror) => void;
}

// Utility functions
const generateAvatar = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

const JurorCard = ({ juror, isSelected, onClick }: JurorCardProps) => {
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
      <Avatar className="h-10 w-10 border-2 border-white shadow">
        <AvatarImage src={generateAvatar(juror.name)} alt={juror.name} />
        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
          {juror.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-gray-700 text-center">
        {juror.name}
      </span>
      {isSelected && (
        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

export default JurorCard;
