import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import AIQuestionGenerator from "./ai-question-generator";
import { GeneratedQuestion } from "../../../types/questions";

interface CaseFormProps {
  caseData: {
    caseName: string;
    caseType: string;
    description: string;
    jurorTraits: string;
  };
  onCaseDataChange: (field: string, value: string) => void;
  onAddQuestions: (questions: GeneratedQuestion[]) => void;
}

export default function CaseForm({ caseData, onCaseDataChange, onAddQuestions }: CaseFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="caseName" className="text-gray-700">
          Case Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="caseName"
          placeholder="Enter case name"
          value={caseData.caseName}
          onChange={(e) => onCaseDataChange("caseName", e.target.value)}
          required
          className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caseType" className="text-gray-700">
          Case Type
        </Label>
        <Select value={caseData.caseType} onValueChange={(value) => onCaseDataChange("caseType", value)}>
          <SelectTrigger id="caseType" className="bg-white/50 backdrop-blur-sm border-gray-200">
            <SelectValue placeholder="Select case type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="civil">Civil</SelectItem>
            <SelectItem value="criminal">Criminal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Enter case description"
          value={caseData.description}
          onChange={(e) => onCaseDataChange("description", e.target.value)}
          className="min-h-[120px] bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jurorTraits" className="text-gray-700 flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Describe Ideal Juror Traits</span>
        </Label>
        <Textarea
          id="jurorTraits"
          placeholder="Describe the characteristics and traits you're looking for in ideal jurors for this case..."
          value={caseData.jurorTraits}
          onChange={(e) => onCaseDataChange("jurorTraits", e.target.value)}
          className="min-h-[150px] bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* AI Question Generator */}
      <AIQuestionGenerator caseData={caseData} onAddQuestions={onAddQuestions} />
    </div>
  );
}