/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { FileText, Plus, FileUp, Loader2, Edit, Trash2, X, Save, Type, Percent, Tag as TagIcon, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getCaseQuestionsApi, createQuestionApi, updateQuestionApi, deleteQuestionApi, extractQuestionsFromPDFApi } from "@/api/api";
import { convertPDFToImages } from "@/utils/convertPdfToImages";

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

type QuestionType = 'YES_NO' | 'TEXT' | 'RATING';

interface Question {
  id: string;
  asked?: string;
  question: string;
  tags: string[];
  percentage: number;
  questionType: QuestionType;
}

const DEFAULT_TAGS = [
  "bias", "experience", "background", "knowledge",
  "attitude", "relationship", "presumption_of_innocence",
  "prejudice", "expertise", "conflict", "familiarity"
];

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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    questionType: "TEXT" as QuestionType,
    tags: [] as string[],
    percentage: 5,
  });
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [currentStep, setCurrentStep] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const getQuestionTypeDisplay = (type: QuestionType) => {
    switch (type) {
      case 'YES_NO': return 'Yes/No';
      case 'RATING': return 'Rating';
      case 'TEXT': return 'Text';
      default: return type;
    }
  };

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
      // Convert percentage from 0-100 to 1-10 for display
      const questionsWithConvertedPercentage = (response.questions || []).map((q: Question) => ({
        ...q,
        percentage: Math.round(q.percentage / 10)
      }));
      setQuestions(questionsWithConvertedPercentage);
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
      // Convert percentage from 1-10 to 10-100 for API
      await createQuestionApi(editingCase.id, {
        question: newQuestion.question.trim(),
        questionType: newQuestion.questionType,
        tags: newQuestion.tags,
        percentage: newQuestion.percentage * 10,
        order: questions.length + 1,
      });

      setNewQuestion({ question: "", questionType: "TEXT", tags: [], percentage: 5 });
      setIsAddingQuestion(false);
      fetchQuestions();
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingCase || !editingQuestion || !editingQuestion.question.trim()) return;

    try {
      const currentIndex = questions.findIndex(q => q.id === editingQuestion.id);

      // Convert percentage from 1-10 to 10-100 for API
      await updateQuestionApi(editingQuestion.id, {
        question: editingQuestion.question.trim(),
        questionType: editingQuestion.questionType,
        tags: editingQuestion.tags,
        percentage: editingQuestion.percentage * 10,
        order: currentIndex + 1,
      });

      setEditingQuestionId(null);
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
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const startEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingQuestion({ ...question });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestion(null);
  };

  const handlePDFUpload = (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    processPDF(file);
  };

  const processPDF = async (file: File) => {
    if (!editingCase) return;
    setIsProcessingPDF(true);
    setCurrentStep("Initializing...");
    setProcessingProgress({ current: 0, total: 0 });
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured");
      }
      setCurrentStep("Converting PDF to images...");
      const images = await convertPDFToImages(file);
      if (images.length === 0) throw new Error("Could not convert PDF to images");
      setProcessingProgress({ current: 0, total: images.length });
      setCurrentStep(`Processing ${images.length} page(s) with AI...`);
      toast.info(`Processing ${images.length} page(s) from PDF...`);
      let allExtracted: { question: string; tags: string[]; percentage: number; questionType: QuestionType }[] = [];
      for (let i = 0; i < images.length; i++) {
        setProcessingProgress({ current: i + 1, total: images.length });
        setCurrentStep(`Analyzing page ${i + 1} of ${images.length}...`);
        try {
          const data = await extractQuestionsFromPDFApi(images[i], i + 1);
          if (data.questions && Array.isArray(data.questions)) {
            const validated = data.questions
              .filter((q: any) => q && typeof q.question === "string" && q.question.trim().length > 5)
              .map((q: any) => ({
                question: q.question.trim(),
                tags: Array.isArray(q.tags) ? q.tags.slice(0, 3) : [],
                percentage: typeof q.percentage === "number" ? Math.min(100, Math.max(0, q.percentage)) : 75,
                questionType: (q.type || "YES_NO") as QuestionType,
              }));
            allExtracted = [...allExtracted, ...validated];
          }
        } catch (pageErr: any) {
          console.error(`Error processing page ${i + 1}:`, pageErr);
          if (pageErr?.response?.status === 429) {
            toast.error("Insufficient AI tokens. Please upgrade your plan or wait for tokens to reset.");
            break;
          }
        }
      }
      setCurrentStep("Finalizing...");
      const unique = allExtracted.reduce((acc, cur) => {
        if (!acc.find((q) => q.question === cur.question)) acc.push(cur);
        return acc;
      }, [] as typeof allExtracted);
      if (unique.length === 0) {
        toast.warning("No questions found in the PDF. Add questions manually or try another file.");
        return;
      }
      const baseOrder = questions.length;
      for (let i = 0; i < unique.length; i++) {
        const q = unique[i];
        const percentage = Math.max(10, Math.min(100, q.percentage));
        await createQuestionApi(editingCase.id, {
          question: q.question,
          questionType: q.questionType,
          tags: q.tags,
          percentage,
          order: baseOrder + 1 + i,
        });
      }
      await fetchQuestions();
      toast.success(`Added ${unique.length} question(s) from PDF.`);
    } catch (err) {
      console.error("PDF processing error:", err);
      if (err instanceof Error) {
        if (err.message.includes("Insufficient AI tokens")) toast.error(err.message);
        else toast.error(`Failed to extract questions: ${err.message}`);
      } else toast.error("An unexpected error occurred while processing the PDF.");
    } finally {
      setIsProcessingPDF(false);
      setCurrentStep("");
      setProcessingProgress({ current: 0, total: 0 });
      if (pdfInputRef.current) pdfInputRef.current.value = "";
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
              <div className="flex items-center gap-2">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePDFUpload(f);
                  }}
                  disabled={isProcessingPDF}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isProcessingPDF}
                  className="flex items-center space-x-2"
                >
                  {isProcessingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{currentStep || "Processing…"}</span>
                      {processingProgress.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {processingProgress.current}/{processingProgress.total}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      <span>Upload Question</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingQuestion(true)}
                  disabled={isProcessingPDF}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </Button>
              </div>
            </div>

            {/* Add Question Form - Shows at top */}
            {isAddingQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-3 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">New Question</Label>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingQuestion(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Question text..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <select
                      className="w-full px-2 py-1.5 text-sm border rounded-md"
                      value={newQuestion.questionType}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, questionType: e.target.value as QuestionType }))}
                    >
                      <option value="TEXT">Text</option>
                      <option value="YES_NO">Yes/No</option>
                      <option value="RATING">Rating</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Relevance (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newQuestion.percentage}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, percentage: parseInt(e.target.value) || 1 }))}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {DEFAULT_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
                          }))
                        }
                        className={`px-2 py-0.5 text-xs rounded-full ${newQuestion.tags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddQuestion} disabled={!newQuestion.question.trim()}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingQuestion(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3 border rounded-lg bg-white animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={question.id}>
                    {editingQuestionId === question.id ? (
                      // Edit Form in place
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3 p-3 border rounded-lg bg-blue-50 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Edit Question</Label>
                          <Button variant="ghost" size="sm" onClick={cancelEditQuestion}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Question text..."
                          value={editingQuestion?.question || ""}
                          onChange={(e) => setEditingQuestion((prev) => (prev ? { ...prev, question: e.target.value } : null))}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <select
                              className="w-full px-2 py-1.5 text-sm border rounded-md"
                              value={editingQuestion?.questionType || "TEXT"}
                              onChange={(e) => setEditingQuestion((prev) => (prev ? { ...prev, questionType: e.target.value as QuestionType } : null))}
                            >
                              <option value="TEXT">Text</option>
                              <option value="YES_NO">Yes/No</option>
                              <option value="RATING">Rating</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Relevance (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editingQuestion?.percentage || 1}
                              onChange={(e) => setEditingQuestion((prev) => (prev ? { ...prev, percentage: parseInt(e.target.value) || 1 } : null))}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Tags</Label>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {DEFAULT_TAGS.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() =>
                                  setEditingQuestion((prev) =>
                                    prev
                                      ? {
                                        ...prev,
                                        tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
                                      }
                                      : null
                                  )
                                }
                                className={`px-2 py-0.5 text-xs rounded-full ${editingQuestion?.tags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                  }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateQuestion} disabled={!editingQuestion?.question.trim()}>
                            Update
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditQuestion}>
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      // Display Question
                      <div className="group flex items-start justify-between p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed mb-3">
                            {question.question}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Question Type */}
                            <div className="flex items-center space-x-1">
                              <Type className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {getQuestionTypeDisplay(question.questionType)}
                              </span>
                            </div>

                            {/* Percentage */}
                            <div className="flex items-center space-x-1">
                              <Percent className="h-3 w-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-700">
                                {question.percentage * 10}% relevant
                              </span>
                            </div>

                            {/* Tags */}
                            {question.tags && question.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <TagIcon className="h-3 w-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {question.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge
                                      key={tagIndex}
                                      variant="outline"
                                      className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {question.tags.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                                    >
                                      +{question.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditQuestion(question)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit question"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm">No questions available</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Question" to get started</p>
              </div>
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