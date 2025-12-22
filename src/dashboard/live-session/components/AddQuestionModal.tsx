// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { createQuestionApi } from "@/api/api";
// import AIQuestionSuggestions from "./AIQuestionSuggestions";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Question } from "@/types/questions";

// interface AddQuestionModalProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   selectedCaseId?: string;
//   selectedCase?: any;
//   onQuestionsAdded?: () => void;
// }

// const AddQuestionModal = ({
//   isOpen,
//   onOpenChange,
//   selectedCaseId,
//   selectedCase,
//   onQuestionsAdded,
// }: AddQuestionModalProps) => {
//   const [question, setQuestion] = useState<Question>("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!question.trim() || !selectedCaseId) return;

//     try {
//       setLoading(true);
//       await createQuestionApi(selectedCaseId, {
//         question: question.trim(),
//         questionType: "TEXT",
//         isRequired: false,
//         order: 1,
//       });

//       // Reset form and close modal
//       setQuestion("");
//       onOpenChange(false);

//       // Notify parent component
//       if (onQuestionsAdded) {
//         onQuestionsAdded();
//       }
//     } catch (error) {
//       console.error("Error creating question:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuestionsAdded = () => {
//     // Close modal and notify parent
//     onOpenChange(false);
//     if (onQuestionsAdded) {
//       onQuestionsAdded();
//     }
//   };

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const _handleSuggestByAI = () => {
//     // TODO: Implement AI question suggestion functionality
//     console.log("AI suggestion functionality to be implemented");
//   };

//   const handleClose = () => {
//     setQuestion("");
//     onOpenChange(false);
//   };

//   // Prepare case data for AI suggestions
//   const caseData = selectedCase
//     ? {
//         caseName: selectedCase.name || "Unknown Case",
//         caseType: selectedCase.type || "Unknown Type",
//         description: "Live session voir dire questions for jury selection",
//         jurorTraits:
//           "Ideal jurors should be fair, impartial, and able to follow legal instructions",
//       }
//     : {
//         caseName: "Unknown Case",
//         caseType: "Unknown Type",
//         description: "Live session voir dire questions for jury selection",
//         jurorTraits:
//           "Ideal jurors should be fair, impartial, and able to follow legal instructions",
//       };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-lg font-semibold">
//             Add New Question
//           </DialogTitle>
//         </DialogHeader>

//         <Tabs defaultValue="manual" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="manual">Manual Entry</TabsTrigger>
//             <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
//           </TabsList>

//           <TabsContent value="manual" className="space-y-4">
//             <div className="space-y-3">
//               <Label htmlFor="question-input" className="text-sm font-medium">
//                 Question
//               </Label>
//               <Textarea
//                 id="question-input"
//                 placeholder="Type your question here..."
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 className="min-h-[100px] resize-none"
//               />
//             </div>

//             <DialogFooter className="flex gap-2">
//               <Button variant="outline" onClick={handleClose}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSubmit}
//                 disabled={!question.trim() || loading}
//               >
//                 {loading ? "Creating..." : "Submit"}
//               </Button>
//             </DialogFooter>
//           </TabsContent>

//           <TabsContent value="ai" className="space-y-4">
//             <AIQuestionSuggestions
//               caseData={caseData}
//               selectedCaseId={selectedCaseId}
//               onQuestionsAdded={handleQuestionsAdded}
//             />

//             <DialogFooter className="flex gap-2">
//               <Button variant="outline" onClick={handleClose}>
//                 Cancel
//               </Button>
//             </DialogFooter>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AddQuestionModal;
