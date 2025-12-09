import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";
import CardHeaderTag from "@/components/shared/card-header";
import CaseForm from "./components/case-form";
import QuestionsManager from "./components/questions-manager";
import TitleTag from "@/components/shared/tag/tag";
import { createCaseApi } from "@/api/api";
import { GeneratedQuestion } from "@/types/questions";

export default function CreateCasePage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [caseData, setCaseData] = useState({
    caseName: "",
    caseType: "",
    description: "",
    jurorTraits: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCaseDataChange = (field: string, value: string) => {
    setCaseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCase = async () => {
    const { caseName, caseType, description, jurorTraits } = caseData;

    // Check for missing fields
    if (!caseName.trim()) {
      toast.error("Case name is required");
      return;
    }

    if (!caseType.trim()) {
      toast.error("Case type is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!jurorTraits.trim()) {
      toast.error("Ideal juror traits are required");
      return;
    }

    if (questions.length === 0) {
      toast.error("At least one case question is required");
      return;
    }

    setIsCreating(true);

    const newCase = {
      caseName: caseName.trim(),
      caseType: caseType.toUpperCase(),
      description: description.trim(),
      idealJurorTraits: jurorTraits.trim(),
      caseQuestions: questions,
    };

    try {
      const response = await createCaseApi(newCase);
      // Handle response structure: response.data or response.data.data
      const createdCase = response.data || response;
      const caseId = createdCase?.id || createdCase?.data?.id;
      
      toast.success(`Case created successfully with ${questions.length} questions!`);

      // Reset form
      setCaseData({
        caseName: "",
        caseType: "",
        description: "",
        jurorTraits: "",
      });
      setQuestions([]);

      // Navigate to manage jurors page with the new case ID
      // if (caseId) {
      //   navigate(`/dashboard/manage-jurors?caseId=${caseId}`);
      // } else {
      //   navigate("/dashboard/manage-jurors");
      // }
    } catch (error) {
      console.error("❌ Failed to create case:", error);
      toast.error("Failed to create case. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <div className="mx-auto space-y-6">
        <TitleTag title="Create New Case" />

        {/* Case Information Section */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeaderTag title="Case Information" description="Enter the case details" Icon={FileText} />
          <CardContent className="space-y-6 pt-6">
            <CaseForm
              caseData={caseData}
              onCaseDataChange={handleCaseDataChange}
              onAddQuestions={(newQuestions) => setQuestions((prev) => [...prev, ...newQuestions])}
            />
          </CardContent>
        </Card>

        {/* Questions Management Section - Combined PDF Upload + Manual Entry */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeaderTag
            title="Jury Selection Questions"
            description="Add questions manually or upload a PDF to extract them automatically"
            Icon={FileText}
          />
          <CardContent className="space-y-6 pt-6">
            <QuestionsManager questions={questions} onQuestionsChange={setQuestions} />

            {/* Create Case Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button
                onClick={handleCreateCase}
                disabled={isCreating || !caseData.caseName.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg font-medium"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Case...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Case ({questions.length} questions)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
