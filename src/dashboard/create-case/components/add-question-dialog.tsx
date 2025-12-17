import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Question, QuestionType } from "../../../types/questions";

interface AddQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: Question) => void;
  onEditQuestion?: (question: Question, index: number) => void;
  editingQuestion?: { question: Question; index: number } | null;
}

const DEFAULT_TAGS = [
  "bias", "experience", "background", "knowledge", 
  "attitude", "relationship", "presumption_of_innocence",
  "prejudice", "expertise", "conflict", "familiarity"
];

export function AddQuestionDialog({ 
  isOpen, 
  onClose, 
  onAddQuestion,
  onEditQuestion,
  editingQuestion 
}: AddQuestionDialogProps) {
  const isEditMode = !!editingQuestion;
  
  // Convert backend percentage (0-100) to 1-10 scale for display
  const getDisplayPercentage = (percentage: number) => {
    return Math.round((percentage / 100) * 10);
  };

  // Convert 1-10 scale back to 0-100 for backend
  const getBackendPercentage = (displayPercentage: number) => {
    return (displayPercentage / 10) * 100;
  };

  const [questionText, setQuestionText] = useState("");
  const [selectedType, setSelectedType] = useState<QuestionType>("YES_NO");
  const [percentage, setPercentage] = useState<number>(5); // 1-10 scale, default 5
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  // Initialize form when editing
  useEffect(() => {
    if (editingQuestion) {
      const question = editingQuestion.question;
      setQuestionText(question.question || "");
      setSelectedType(question.questionType || "YES_NO");
      setPercentage(getDisplayPercentage(question.percentage || 50));
      setSelectedTags(question.tags || []);
    } else {
      // Reset form for add mode
      setQuestionText("");
      setSelectedType("YES_NO");
      setPercentage(5);
      setSelectedTags([]);
      setCustomTag("");
    }
  }, [editingQuestion, isOpen]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handlePercentageChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setPercentage(value);
    }
  };

  const getPercentageLabel = (value: number) => {
    if (value <= 3) return "Low";
    if (value <= 6) return "Medium";
    if (value <= 8) return "High";
    return "Very High";
  };

  const handleSubmit = () => {
    if (!questionText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const backendPercentage = getBackendPercentage(percentage);

    const newQuestion: Question = {
      id:String(Date.now()),
      question: questionText.trim(),
      tags: selectedTags,
      percentage: backendPercentage,
      questionType: selectedType
    };

    if (isEditMode && editingQuestion && onEditQuestion) {
      onEditQuestion(newQuestion, editingQuestion.index);
      toast.success("Question updated successfully");
    } else {
      onAddQuestion(newQuestion);
      toast.success("Question added successfully");
    }
    
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setQuestionText("");
    setSelectedType("YES_NO");
    setPercentage(5);
    setSelectedTags([]);
    setCustomTag("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question">Question Text *</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your voir dire question..."
              className="min-h-[100px] bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Question Type</Label>
            <Select value={selectedType} onValueChange={(value: QuestionType) => setSelectedType(value)}>
              <SelectTrigger id="type" className="bg-white/50 backdrop-blur-sm border-gray-200">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES_NO">Yes/No Question</SelectItem>
                <SelectItem value="RATING">Rating</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Relevance Scale 1-10 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="relevance">
                Relevance: <span className="font-bold text-blue-600">{percentage}/10</span>
              </Label>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                percentage <= 3 ? "bg-yellow-100 text-yellow-800" :
                percentage <= 6 ? "bg-orange-100 text-orange-800" :
                percentage <= 8 ? "bg-blue-100 text-blue-800" :
                "bg-green-100 text-green-800"
              }`}>
                {getPercentageLabel(percentage)}
              </span>
            </div>
            
            {/* Scale Numbers */}
            <div className="flex justify-between px-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div key={num} className="flex flex-col items-center">
                  <span className={`text-xs font-medium ${percentage === num ? "text-blue-600 font-bold" : "text-gray-500"}`}>
                    {num}
                  </span>
                </div>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-4">
              {/* Custom styled range slider */}
              <div className="relative pt-6">
                <input
                  id="relevance"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer 
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 
                           [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 
                           [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg
                           [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 
                           [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black 
                           [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                           [&::-moz-range-thumb]:shadow-lg"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((percentage - 1) / 9) * 100}%, #d1d5db ${((percentage - 1) / 9) * 100}%, #d1d5db 100%)`
                  }}
                />
                
                {/* Value indicator above slider */}
                <div 
                  className="absolute top-0 transform -translate-x-1/2 text-sm font-bold text-blue-600"
                  style={{ left: `${((percentage - 1) / 9) * 100}%` }}
                >
                  {percentage}
                </div>
              </div>
              
              {/* +/- Controls */}
              <div className="flex items-center justify-center space-x-6">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePercentageChange(Math.max(1, percentage - 1))}
                  className="h-10 w-10 border-gray-300 hover:bg-gray-100"
                  disabled={percentage <= 1}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{percentage}</div>
                  <div className="text-xs text-gray-500 mt-1">Current Value</div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePercentageChange(Math.min(10, percentage + 1))}
                  className="h-10 w-10 border-gray-300 hover:bg-gray-100"
                  disabled={percentage >= 10}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Max 5)</Label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto p-1">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedTags.length === 0 && (
                <span className="text-sm text-gray-500">No tags added yet</span>
              )}
            </div>

            {/* Default Tags */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto p-1">
              {DEFAULT_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Custom Tag */}
            <div className="flex space-x-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 bg-white/50 backdrop-blur-sm border-gray-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim() || selectedTags.length >= 5}
                className="border-gray-200 whitespace-nowrap"
              >
                Add Tag
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Press Enter or click Add Tag to add custom tags
            </p>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="border-gray-200">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!questionText.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isEditMode ? "Update Question" : "Add Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}