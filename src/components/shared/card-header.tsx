import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type CardHeaderTagProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

const CardHeaderTag = ({ title, description, Icon }: CardHeaderTagProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
      <CardTitle className="flex items-center space-x-2">
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </CardTitle>
      <CardDescription className="text-white/80">{description}</CardDescription>
    </CardHeader>
  );
};

export default CardHeaderTag;
