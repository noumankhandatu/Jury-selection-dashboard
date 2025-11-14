/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Sparkles, Loader2, CheckCircle } from "lucide-react";
import CardHeaderTag from "@/components/shared/card-header";
import { itemVariants } from "@/utils/fn";

export function PDFUploader({ selectedCase, onFileUpload, isUploading, isSubmitting, uploadError, uploadSuccess }: any) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Accept PDFs and images
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
    
    if (!isPDF && !isImage) {
      return;
    }

    await onFileUpload(file);
    // Clear the file input
    event.target.value = "";
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden relative z-10">
      <CardHeaderTag
        title="AI-Powered Juror Extraction"
        description={`Upload PDF files or images and let AI extract juror information for ${selectedCase.name}`}
        Icon={Brain}
      />

      <CardContent className="p-4 sm:p-6">
        {/* Loading State */}
        {(isUploading || isSubmitting) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {isUploading && !isSubmitting ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      AI Processing Your File...
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <span>Uploading file to OpenAI servers</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <span>Analyzing document structure and content</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <span>Extracting juror information with AI</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4">This may take 10-30 seconds depending on file size...</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      Saving Jurors...
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        <span>Uploading jurors to database</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4">Almost done...</p>
                  </>
                )}
              </div>

              {/* Progress Animation */}
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-full rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Interface */}
        {!isUploading && !isSubmitting && (
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 sm:p-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-400 hover:bg-purple-50/70">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-base sm:text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Powered Document Processing
                </p>
                <p className="text-sm text-gray-600">Upload any juror questionnaire PDF or image and AI will extract all information</p>
                <p className="text-xs text-purple-600 font-medium">✨ Powered by OpenAI GPT-4 Vision</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 font-medium transition-all duration-200"
                >
                  <label htmlFor="pdfUpload" className="cursor-pointer flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF or Image
                  </label>
                </Button>
              </div>

              <input id="pdfUpload" type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,image/*" onChange={handleFileChange} className="hidden" />

              {/* AI Processing Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Processing Capabilities:
                </h4>
                <ul className="text-xs text-purple-800 space-y-1 text-left">
                  <li>• Extracts juror information from PDFs and images</li>
                  <li>• Identifies personal details, demographics, and background</li>
                  <li>• Analyzes responses to assess potential bias</li>
                  <li>• Structures data automatically for easy management</li>
                  <li>• Handles handwritten and typed questionnaires</li>
                  <li>• Supports photos of paper documents</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadError && (
          <motion.div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" variants={itemVariants}>
            <p className="text-red-700 text-sm font-medium">{uploadError}</p>
          </motion.div>
        )}

        {/* Success State */}
        {uploadSuccess && (
          <motion.div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 font-medium text-sm">{uploadSuccess}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
