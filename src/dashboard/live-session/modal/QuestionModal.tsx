// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// export function QuestionModal() {
//   const [open, setOpen] = useState(false);
//   const [questions, setQuestions] = useState<string[]>([""]);

//   const handleAddQuestion = () => {
//     setQuestions((prev) => [...prev, ""]);
//   };

//   const handleQuestionChange = (index: number, value: string) => {
//     const updated = [...questions];
//     updated[index] = value;
//     setQuestions(updated);
//   };

//   const handleSubmit = () => {
//     const cleanedQuestions = questions.map((q) => q.trim()).filter(Boolean);
//     if (cleanedQuestions.length === 0) return;

//     console.log("Submitted Questions:", cleanedQuestions);

//     // Reset state
//     setQuestions([""]);
//     setOpen(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="default">Add Questions</Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Add Jury Questions</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
//           {questions.map((question, index) => (
//             <Input key={index} placeholder={`Question ${index + 1}`} value={question} onChange={(e) => handleQuestionChange(index, e.target.value)} />
//           ))}
//           <Button type="button" variant="secondary" onClick={handleAddQuestion}>
//             + Add Another Question
//           </Button>
//         </div>

//         <div className="pt-4">
//           <Button onClick={handleSubmit} disabled={questions.every((q) => q.trim() === "")} className="w-full">
//             Submit
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
