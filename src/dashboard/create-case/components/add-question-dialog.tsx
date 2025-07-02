"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface AddQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: string) => void;
}

export function AddQuestionDialog({ isOpen, onClose, onAddQuestion }: AddQuestionDialogProps) {
  const [newQuestion, setNewQuestion] = useState("");

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }
    onAddQuestion(newQuestion.trim());
    setNewQuestion("");
    toast.success("Question added successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>Enter a question to be used during jury selection.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="min-h-[120px] bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddQuestion} className="bg-blue-500 hover:bg-blue-600 text-white">
            Add Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
