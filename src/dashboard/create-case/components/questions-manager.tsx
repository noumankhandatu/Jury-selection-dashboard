/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileUp, Loader2, Plus, Trash2, FileText, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AddQuestionDialog } from "./add-question-dialog";
import { extractQuestionsFromPDFApi } from "@/api/api";

interface QuestionsManagerProps {
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

export default function QuestionsManager({ questions, onQuestionsChange }: QuestionsManagerProps) {
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Add these state variables after the existing ones
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [currentStep, setCurrentStep] = useState("");

  const handlePDFUpload = (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    processPDF(file);
  };

  const processPDF = async (file: File) => {
    setIsProcessingPDF(true);
    setCurrentStep("Initializing...");
    setProcessingProgress({ current: 0, total: 0 });

    try {
      // Check if OpenAI API key is available
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      setCurrentStep("Converting PDF to images...");
      // Convert PDF to images using a simpler approach
      const images = await convertPDFToImages(file);

      if (images.length === 0) {
        throw new Error("Could not convert PDF to images");
      }

      setProcessingProgress({ current: 0, total: images.length });
      setCurrentStep(`Processing ${images.length} page(s) with AI...`);
      toast.info(`Processing ${images.length} page(s) from PDF...`);

      let allExtractedQuestions: string[] = [];

      // Process each page
      for (let i = 0; i < images.length; i++) {
        setProcessingProgress({ current: i + 1, total: images.length });
        setCurrentStep(`Analyzing page ${i + 1} of ${images.length}...`);

        const imageBase64 = images[i];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _prompt = `
        Extract all jury selection questions from this page of a PDF document.
        
        Return only a JSON object with this exact format:
        {"questions": ["question 1", "question 2", "question 3"]}
        
        Rules:
        - Extract complete questions only
        - Remove numbering and formatting
        - Each question should be a standalone string
        - If no questions found on this page, return {"questions": []}
        `;

        try {
          // Call backend API with token tracking
          const data = await extractQuestionsFromPDFApi(imageBase64, i + 1);
          
          if (data.questions && Array.isArray(data.questions)) {
            allExtractedQuestions = [...allExtractedQuestions, ...data.questions];
          }
        } catch (pageError: any) {
          console.error(`Error processing page ${i + 1}:`, pageError);
          
          if (pageError.response?.status === 429) {
            toast.error(
              "Insufficient AI tokens. Please upgrade your plan or wait for your tokens to reset."
            );
            break; // Stop processing if out of tokens
          }
          // Continue with other pages on other errors
        }
      }

      setCurrentStep("Finalizing results...");

      // Remove duplicates and validate
      const uniqueQuestions = [...new Set(allExtractedQuestions)];
      const validQuestions = uniqueQuestions.filter((q) => q && typeof q === "string" && q.trim().length > 5);

      if (validQuestions.length > 0) {
        onQuestionsChange([...questions, ...validQuestions]);
        toast.success(`Successfully extracted ${validQuestions.length} questions from PDF!`);
      } else {
        toast.warning("No questions found in the PDF. Please check the document or add questions manually.");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);

      if (error instanceof Error) {
        if (error.message.includes("Insufficient AI tokens")) {
          toast.error(error.message);
        } else {
          toast.error(`Failed to extract questions: ${error.message}`);
        }
      } else {
        toast.error("An unexpected error occurred while processing the PDF.");
      }
    } finally {
      setIsProcessingPDF(false);
      setCurrentStep("");
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  const convertPDFToImages = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        try {
          // Use a consistent version of PDF.js
          const script: any = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

          script.onload = async () => {
            try {
              // Access PDF.js from global window object
              const pdfjsLib = (window as any).pdfjsLib;

              // Set worker source to match the main library version
              pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

              const typedArray = new Uint8Array(this.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument(typedArray).promise;

              const images: string[] = [];

              // Convert each page to image
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 2.0 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                  await page.render({
                    canvasContext: context,
                    viewport: viewport,
                  }).promise;

                  // Convert canvas to base64
                  const imageBase64 = canvas.toDataURL("image/png").split(",")[1];
                  images.push(imageBase64);
                }
              }

              resolve(images);
            } catch (error) {
              console.error("Error processing PDF:", error);
              reject(error);
            }
          };

          script.onerror = () => reject(new Error("Failed to load PDF.js library"));

          // Only add script if it's not already loaded
          if (!(window as any).pdfjsLib) {
            document.head.appendChild(script);
          } else {
            // If already loaded, use it directly
            script.onload();
          }
        } catch (error) {
          console.error("Error setting up PDF.js:", error);
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error("Failed to read PDF file"));
      fileReader.readAsArrayBuffer(file);
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _extractQuestionsFromText = (text: string): string[] => {
    const questions: string[] = [];

    try {
      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (parsedData && Array.isArray(parsedData.questions)) {
          return parsedData.questions.filter((q: any) => q && typeof q === "string" && q.trim().length > 0).map((q: string) => q.trim());
        }
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
    }

    // Fallback: extract questions manually
    if (text && typeof text === "string") {
      const lines = text.split(/[\n\r]+/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!line || typeof line !== "string") {
          continue;
        }

        const trimmedLine = line.trim();

        if (trimmedLine.length < 5) {
          continue;
        }

        // Check for question patterns
        const hasQuestionMark = trimmedLine.includes("?");
        const startsWithQuestion =
          trimmedLine.startsWith("Have you") ||
          trimmedLine.startsWith("Do you") ||
          trimmedLine.startsWith("Are you") ||
          trimmedLine.startsWith("Would you") ||
          trimmedLine.startsWith("Can you") ||
          trimmedLine.startsWith("Will you") ||
          trimmedLine.startsWith("have you") ||
          trimmedLine.startsWith("do you") ||
          trimmedLine.startsWith("are you") ||
          trimmedLine.startsWith("would you") ||
          trimmedLine.startsWith("can you") ||
          trimmedLine.startsWith("will you");

        if (hasQuestionMark || startsWithQuestion) {
          questions.push(trimmedLine);
        }
      }
    }

    return questions;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.includes("pdf")) {
        handlePDFUpload(file);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const removeQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="questions" className="text-gray-700 flex items-center space-x-2">
          <Brain className="h-4 w-4" />
          <span>Case Questions</span>
        </Label>
        <Button onClick={() => setIsAddQuestionDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* PDF Upload Section */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Upload Questions from PDF</p>
                <p className="text-xs text-blue-600 mt-1">
                  Upload a PDF containing jury selection questions and AI will automatically extract them for you.
                </p>
              </div>
            </div>

            {!uploadedFile ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="pdfFile"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    isDragging ? "border-blue-500 bg-blue-100/50" : "border-blue-300 bg-white/50 backdrop-blur-sm hover:bg-blue-50/50"
                  } ${isProcessingPDF ? "pointer-events-none opacity-75" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isProcessingPDF ? (
                      <>
                        <div className="relative mb-3">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          {processingProgress.total > 0 && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {processingProgress.current}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-blue-700 font-medium mb-1">{currentStep}</p>
                        {processingProgress.total > 0 && (
                          <>
                            <div className="w-48 bg-blue-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-600">
                              Page {processingProgress.current} of {processingProgress.total}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <FileUp className="w-8 h-8 mb-3 text-blue-400" />
                        <p className="mb-2 text-sm text-blue-700">
                          <span className="font-semibold">Click to upload PDF</span> or drag and drop
                        </p>
                        <p className="text-xs text-blue-600">PDF files only (Max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={pdfInputRef}
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePDFUpload(file);
                    }}
                    disabled={isProcessingPDF}
                  />
                </label>
              </div>
            ) : (
              <Card className="bg-green-50/50 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {isProcessingPDF && <p className="text-xs text-blue-600 font-medium">{currentStep}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isProcessingPDF && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeUploadedFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isProcessingPDF}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isProcessingPDF && processingProgress.total > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1 text-center">
                        Processing page {processingProgress.current} of {processingProgress.total}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{questions.length} questions loaded</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestionsChange([])}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {questions.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-700">{question}</p>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddQuestionDialog
        isOpen={isAddQuestionDialogOpen}
        onClose={() => setIsAddQuestionDialogOpen(false)}
        onAddQuestion={(question) => {
          onQuestionsChange([...questions, question]);
          setIsAddQuestionDialogOpen(false);
        }}
      />
    </div>
  );
}
