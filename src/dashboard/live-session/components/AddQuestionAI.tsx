import { Button } from "@/components/ui/button";
import { AddQuestionDialog } from "@/dashboard/create-case/components/add-question-dialog";
import { Question } from "@/types/questions";
import { useState } from "react";

const AddQuestionAI = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    question: Question;
    index: number;
  } | null>(null);

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions([...questions, newQuestion]);
  };

  const handleEditQuestion = (editedQuestion: Question, index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = editedQuestion;
    setQuestions(updatedQuestions);
  };

  const handleEditClick = (question: Question, index: number) => {
    setEditingQuestion({ question, index });
    setIsDialogOpen(true);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    console.log("Submitted Questions:", questions);
    // Add API logic here if needed
    
    // Optional: Clear questions after submission
    // setQuestions([]);
  };

  return (
    <div className="p-4">
      <hr />
      <div className="h-[10px]" />

      <div className="flex justify-center mb-6">
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          variant="default"
          className="gap-2"
        >
          <span>+</span>
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Added Questions ({questions.length})
          </h3>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {question.questionType.replace("_", " ")}
                      </span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        question.percentage <= 30 ? "bg-yellow-100 text-yellow-800" :
                        question.percentage <= 60 ? "bg-orange-100 text-orange-800" :
                        question.percentage <= 80 ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        Relevance: {Math.round((question.percentage / 100) * 10)}/10
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">{question.question}</p>
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(question, index)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button (show only if there are questions) */}
      {questions.length > 0 && (
        <div className="flex justify-end mt-6 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md transition duration-200"
            size="lg"
          >
            Submit Questions
          </Button>
        </div>
      )}

      {/* Add/Edit Question Dialog */}
      <AddQuestionDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingQuestion(null);
        }}
        onAddQuestion={handleAddQuestion}
        onEditQuestion={handleEditQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default AddQuestionAI;