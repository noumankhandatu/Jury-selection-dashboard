import { useEffect, useState } from "react";
import {
  FileText,
  Hash,
  BadgeCheck,
  Tag,
  AlignLeft,
  Users,
  ListOrdered,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { getCaseQuestionsApi } from "@/api/api";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  description: string;
  jurorTraits: string;
}

interface Question {
  id: string;
  question: string;
  questionType: string;
  options?: string[];
  isRequired: boolean;
  order: number;
}

interface ViewCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCase: Case | null;
}

export default function ViewCaseDialog({
  isOpen,
  onOpenChange,
  selectedCase,
}: ViewCaseDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (isOpen && selectedCase) {
      fetchQuestions();
    }
  }, [isOpen, selectedCase]);

  const fetchQuestions = async () => {
    if (!selectedCase) return;

    setLoadingQuestions(true);
    try {
      const response = await getCaseQuestionsApi(selectedCase.id);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  if (!selectedCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              Case Details
            </span>
          </DialogTitle>
          <DialogDescription>View complete case information</DialogDescription>
        </DialogHeader>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash className="h-4 w-4 text-indigo-600" />
                <span>Case Number</span>
              </Label>
              <p className="text-lg font-semibold">{selectedCase.number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BadgeCheck
                  className={`h-4 w-4 ${
                    selectedCase.status === "Active"
                      ? "text-green-600"
                      : selectedCase.status === "Pending"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                />
                <span>Status</span>
              </Label>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={
                    selectedCase.status === "Active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : selectedCase.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {selectedCase.status}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="h-4 w-4 text-pink-600" />
              <span>Case Name</span>
            </Label>
            <p className="text-lg">{selectedCase.name}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-amber-600" />
              <span>Description</span>
            </Label>
            <p className="text-gray-600">{selectedCase.description}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Juror Traits</span>
            </Label>
            <p className="text-gray-600">{selectedCase.jurorTraits}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-violet-600" />
              <span>Questions</span>
            </Label>
            {loadingQuestions ? (
              <div className="mt-2 text-gray-500">Loading questions...</div>
            ) : questions.length > 0 ? (
              <div className="mt-2 space-y-2">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start space-x-2">
                    <span className="text-gray-500">{index + 1}.</span>
                    <p className="text-gray-600">{question.question}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-gray-500">No questions available</div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
