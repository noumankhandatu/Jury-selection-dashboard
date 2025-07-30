import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Loader2, FileText, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import OpenAI from "openai";

interface PDFUploaderProps {
  onQuestionsExtracted: (questions: string[]) => void;
}

export default function PDFUploader({ onQuestionsExtracted }: PDFUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleFileUpload = (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    setExtractedCount(null);
    processPDF(file);
  };

  const processPDF = async (file: File) => {
    setIsProcessing(true);

    try {
      // Convert PDF to base64
      const base64 = await fileToBase64(file);

      // Create a focused prompt for extracting questions only
      const prompt = `
      You are an AI assistant specialized in extracting jury selection questions from PDF documents.
      
      Analyze the provided PDF and extract ALL questions that could be used for jury selection, voir dire, or juror screening.
      
      Look for:
      - Direct questions (starting with question words like "Have you...", "Do you...", "Are you...", "Would you...", etc.)
      - Numbered or bulleted questions
      - Any text that asks for information from potential jurors
      - Questions about bias, experience, opinions, background, etc.
      
      Return ONLY a JSON object in this exact format:
      {
        "questions": ["question 1", "question 2", "question 3", ...]
      }
      
      Rules:
      - Each question should be a complete, standalone question
      - Remove any numbering or bullet points from the questions
      - Clean up formatting and make questions readable
      - If no questions are found, return an empty array
      - Do not include any explanatory text, only the JSON object
      `;

      // Use OpenAI to analyze the PDF content directly from frontend
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 3000,
        temperature: 0.1,
      });

      const extractedText = response.choices[0]?.message?.content;

      if (!extractedText) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      let extractedData;
      try {
        // Clean the response to extract JSON
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);

        // Fallback: try to extract questions manually from the response
        const lines = extractedText.split("\n").filter((line) => line.trim());
        const questions = lines.filter(
          (line) =>
            line.includes("?") ||
            line.toLowerCase().includes("have you") ||
            line.toLowerCase().includes("do you") ||
            line.toLowerCase().includes("are you") ||
            line.toLowerCase().includes("would you")
        );

        extractedData = {
          questions: questions.length > 0 ? questions : [],
        };
      }

      // Ensure we have a questions array
      if (!extractedData.questions || !Array.isArray(extractedData.questions)) {
        extractedData = { questions: [] };
      }

      if (extractedData.questions && extractedData.questions.length > 0) {
        setExtractedCount(extractedData.questions.length);
        onQuestionsExtracted(extractedData.questions);
        toast.success(`Successfully extracted ${extractedData.questions.length} questions from PDF!`);
      } else {
        toast.warning("No questions found in the PDF. Please check the document or add questions manually.");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to extract questions from PDF. Please try again or add questions manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(",")[1]); // Remove data:application/pdf;base64, prefix
      };
      reader.onerror = (error) => reject(error);
    });
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
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedCount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">PDF Requirements</p>
              <p className="text-xs text-blue-600 mt-1">
                Upload a PDF containing jury selection questions. The AI will automatically identify and extract all questions from the document.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!uploadedFile ? (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="pdfFile"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 bg-white/50 backdrop-blur-sm hover:bg-gray-50/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isProcessing ? <Loader2 className="w-10 h-10 mb-3 text-blue-500 animate-spin" /> : <FileUp className="w-10 h-10 mb-3 text-gray-400" />}
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF with questions only (Max 10MB)</p>
              {isProcessing && <p className="text-xs text-blue-600 mt-2">Extracting questions with AI...</p>}
            </div>
            <input
              ref={fileInputRef}
              id="pdfFile"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={isProcessing}
            />
          </label>
        </div>
      ) : (
        <Card className={`${extractedCount ? "bg-green-50/50 border-green-200" : "bg-blue-50/50 border-blue-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className={`h-8 w-8 ${extractedCount ? "text-green-600" : "text-blue-600"}`} />
                <div>
                  <p className={`font-medium ${extractedCount ? "text-green-800" : "text-blue-800"}`}>{uploadedFile.name}</p>
                  <p className={`text-sm ${extractedCount ? "text-green-600" : "text-blue-600"}`}>
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    {extractedCount && ` • ${extractedCount} questions extracted`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isProcessing && (
              <div className="mt-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">Extracting questions with AI...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
