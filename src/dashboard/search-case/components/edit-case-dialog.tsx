/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { FileText, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getCaseQuestionsApi, createQuestionApi, updateQuestionApi, deleteQuestionApi } from "@/api/api";

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
  order: number;
}

interface EditCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCase: Case | null;
  editFormData: {
    number: string;
    name: string;
    type: string;
    status: string;
    description: string;
    jurorTraits: string;
  };
  onEditFormDataChange: (field: string, value: string) => void;
  onSave: () => void;
}

export default function EditCaseDialog({ isOpen, onOpenChange, editingCase, editFormData, onEditFormDataChange, onSave }: EditCaseDialogProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    questionType: "TEXT",
  });

  useEffect(() => {
    if (isOpen && editingCase) {
      fetchQuestions();
    }
  }, [isOpen, editingCase]);

  const fetchQuestions = async () => {
    if (!editingCase) return;

    setLoadingQuestions(true);
    try {
      const response = await getCaseQuestionsApi(editingCase.id);
      setQuestions(response.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!editingCase || !newQuestion.question.trim()) return;

    try {
      await createQuestionApi(editingCase.id, {
        question: newQuestion.question.trim(),
        questionType: "TEXT",
      });

      setNewQuestion({ question: "", questionType: "TEXT" });
      setIsAddingQuestion(false);
      fetchQuestions();
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingCase || !editingQuestion || !editingQuestion.question.trim()) return;

    try {
      await updateQuestionApi(editingQuestion.id, {
        question: editingQuestion.question.trim(),
        questionType: "TEXT",
      });

      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error("Failed to update question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestionApi(questionId);
      await fetchQuestions(); // Refresh questions
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  if (!editingCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Edit Case</span>
          </DialogTitle>
          <DialogDescription>Modify case information and manage questions</DialogDescription>
        </DialogHeader>
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-800">My Questions</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddingQuestion(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </Button>
            </div>

            {/* Add Question Form */}
            {isAddingQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 border rounded-lg bg-muted/50"
              >
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="Enter your question..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>
                    Add Question
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="text-center py-8 text-gray-500">Loading questions...</div>
            ) : questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingQuestion(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>No questions available</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Question" to get started</p>
              </div>
            )}

            {/* Edit Question Form */}
            {editingQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 border rounded-lg bg-muted/50"
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-question">Question</Label>
                  <Input
                    id="edit-question"
                    placeholder="Enter your question..."
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion((prev) => (prev ? { ...prev, question: e.target.value } : null))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateQuestion} disabled={!editingQuestion.question.trim()}>
                    Update Question
                  </Button>
                  <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white hover:bg-gray-50">
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
