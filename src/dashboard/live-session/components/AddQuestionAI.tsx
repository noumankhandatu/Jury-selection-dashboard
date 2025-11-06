import { Button } from "@/components/ui/button";
import QuestionsManager from "@/dashboard/create-case/components/questions-manager";
import { useState } from "react";

const AddQuestionAI = () => {
  const [createQuestion, setCreateQuestion] = useState<string[]>([]);
  const [showManager, setShowManager] = useState(false);

  const handleAddClick = () => {
    setShowManager(true);
    if (createQuestion.length === 0) {
      setCreateQuestion([""]);
    }
  };

  const handleSubmit = () => {
    const trimmedQuestions = createQuestion
      .map((q) => q.trim())
      .filter(Boolean);
    console.log("Submitted Questions:", trimmedQuestions);
    // Add API logic here if needed
  };

  return (
    <div className="p-4">
      <hr />
      <div className="h-[10px]" />

      <div className="flex justify-center">
        {!showManager && (
          <Button onClick={handleAddClick} variant="default">
            + Add Question
          </Button>
        )}
      </div>

      {showManager && (
        <>
          <QuestionsManager
            questions={createQuestion}
            onQuestionsChange={setCreateQuestion}
          />

          {createQuestion.length > 1 && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-md transition duration-200"
              >
                Submit Questions
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddQuestionAI;
