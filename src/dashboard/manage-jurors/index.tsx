// manage-jurors-page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SelectCase, type Case } from "@/components/shared/select-case";
import { PDFUploader } from "./components/pdf-uploader";
import { JurorDisplay } from "./components/juror-display";
import { ManageJurorDetailsModal } from "./components/manage-juror-details-modal";
import { AddJurorDialog } from "./components/add-juror-dialog";
import { extractAndParseJurorsFromPDF, extractAndParseJurorsFromImage } from "./components/utils";
import type { Juror } from "./components/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, CheckCircle, CheckCircle2 } from "lucide-react";
import { itemVariants } from "@/utils/fn";
import TagBtnJuror from "@/components/shared/tag/tag-btn-manage-juror";
import { createJurorsApi, getCasesApi } from "@/api/api";
import { toast } from "sonner";

/** User-friendly message when create jurors API fails (e.g. duplicate TDL). */
function getJurorCreateErrorDisplay(
  err: any,
  fallbackToast: string
): { toast: string; uploadErrorDetail: string } {
  const data = err?.response?.data;
  const errors = data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const hasDuplicate = errors.some(
      (e: any) =>
        typeof e?.error === "string" &&
        /already exists|TDL number/i.test(e.error)
    );
    if (hasDuplicate) {
      const msg = "Can't add a juror that already exists.";
      return { toast: msg, uploadErrorDetail: msg };
    }
  }
  const detail =
    errors?.[0]?.error ||
    data?.message ||
    err?.error ||
    err?.message ||
    "Unknown error";
  return {
    toast: fallbackToast,
    uploadErrorDetail: `Failed to save jurors: ${detail}`,
  };
}

export default function ManageJurorsPage() {
  const [searchParams] = useSearchParams();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedJuror, setSelectedJuror] = useState<Juror | null>(null);
  const [isJurorDetailsOpen, setIsJurorDetailsOpen] = useState(false);
  const [isAddJurorOpen, setIsAddJurorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [cases, setCases] = useState<Case[]>([]);
  const [jurorsByCase, setJurorsByCase] = useState<Record<string, Juror[]>>({});

  // Helper function to extract numeric part from juror number for sorting
  const getJurorNumberForSort = (jurorNumber: string | undefined): number => {
    if (!jurorNumber) return 999999; // Put jurors without numbers at the end
    // Extract numbers from strings like "J-001", "J-056", "M-1234", etc.
    const match = jurorNumber.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Sort function for jurors by panelPosition ASC (nulls at bottom), then by juror number
  const sortJurorsByNumber = (jurors: Juror[]): Juror[] => {
    return [...jurors].sort((a, b) => {
      // First sort by panelPosition (nulls go to bottom)
      const panelA = a.panelPosition ?? 999999;
      const panelB = b.panelPosition ?? 999999;
      
      // If both have panelPosition, sort by panelPosition
      if (a.panelPosition !== null && b.panelPosition !== null) {
        if (panelA !== panelB) {
          return panelA - panelB;
        }
      } else if (a.panelPosition !== null && b.panelPosition === null) {
        return -1; // a comes before b
      } else if (a.panelPosition === null && b.panelPosition !== null) {
        return 1; // b comes before a
      }
      // If both are null or equal panelPosition, sort by juror number
      const numA = getJurorNumberForSort(a.jurorNumber);
      const numB = getJurorNumberForSort(b.jurorNumber);
      return numA - numB;
    });
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [hasUploadedOnce, setHasUploadedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successDialogData, setSuccessDialogData] = useState<{ count: number; fileName: string; imageCount?: number } | null>(null);

  /** Per-image upload state for multi-image flow (max 5). Progress 0–100, updates independently. */
  const [imageUploads, setImageUploads] = useState<{ id: string; name: string; progress: number; status: "uploading" | "done" | "error"; error?: string }[]>([]);
  const handleViewJurorDetails = (juror: Juror) => {
    setSelectedJuror(juror);
    setIsJurorDetailsOpen(true);
  };
  const handleCaseSelect = (case_: Case) => {
    if (!case_ || !case_.id) return;

    setSelectedCase(case_);
    const caseJurors = jurorsByCase[case_.id] || [];
    setHasUploadedOnce(caseJurors.length > 0);
    setUploadError("");
    setUploadSuccess("");
    setImageUploads([]);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedCase) {
      setUploadError("Please select a case first");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      // Determine file type and use appropriate extraction function
      const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
      
      let parsedJurors;
      if (isPDF) {
        // Extract jurors from PDF
        parsedJurors = (await extractAndParseJurorsFromPDF(file, selectedCase.id)).map((j) => ({
          ...j,
          submitted: false,
        }));
      } else if (isImage) {
        // Extract jurors from image
        parsedJurors = (await extractAndParseJurorsFromImage(file, selectedCase.id)).map((j) => ({
          ...j,
          submitted: false,
        }));
      } else {
        setUploadError("Please upload a PDF file or an image (JPG, PNG, etc.)");
        setIsUploading(false);
        return;
      }

      if (parsedJurors.length === 0) {
        setUploadError(`No juror data found in the ${isPDF ? "PDF" : "image"}.`);
        setHasUploadedOnce(true);
        setIsUploading(false);
        return;
      }

      // Automatically submit jurors to the server
      setIsSubmitting(true);
      try {
        const payload = {
          caseId: selectedCase.id,
          caseName: selectedCase.name,
          caseNumber: selectedCase.number,
          totalJurors: parsedJurors.length,
          submissionDate: new Date().toISOString(),
          jurors: parsedJurors.map((j) => ({
            ...j,
            source: isPDF ? "PDF Extraction" : "Image Extraction",
            createdAt: new Date().toISOString(),
          })),
        };

        await createJurorsApi(payload);
        
        // Update state with submitted jurors
        const updatedJurorsByCase = { ...jurorsByCase };
        const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
        const submittedJurors = parsedJurors.map((j) => ({ ...j, submitted: true }));
        updatedJurorsByCase[selectedCase.id] = sortJurorsByNumber([...currentCaseJurors, ...submittedJurors]);
        setJurorsByCase(updatedJurorsByCase);

        // Show success dialog
        setSuccessDialogData({ count: parsedJurors.length, fileName: file.name });
        setShowSuccessDialog(true);
        setHasUploadedOnce(true);
        
        toast.success(`${parsedJurors.length} jurors uploaded successfully!`);
      } catch (submitErr: any) {
        // If submission fails, still add jurors to state but mark as not submitted
        const updatedJurorsByCase = { ...jurorsByCase };
        const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
        updatedJurorsByCase[selectedCase.id] = sortJurorsByNumber([...currentCaseJurors, ...parsedJurors]);
        setJurorsByCase(updatedJurorsByCase);

        const { toast: toastMsg, uploadErrorDetail } = getJurorCreateErrorDisplay(
          submitErr,
          "Failed to save jurors. Please try submitting manually."
        );
        setUploadError(uploadErrorDetail);
        setHasUploadedOnce(true);
        toast.error(toastMsg);
      } finally {
        setIsSubmitting(false);
      }
    } catch (err) {
      setUploadError(`Processing failed for "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
      setHasUploadedOnce(true);
    } finally {
      setIsUploading(false);
    }
  };

  /** Process 1–5 images in parallel. Each has its own progress bar (0–100%). */
  const handleMultipleImageUpload = async (files: File[]) => {
    if (!selectedCase) {
      setUploadError("Please select a case first");
      return;
    }
    const images = files.filter((f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f.name));
    const capped = images.slice(0, 5);
    if (capped.length === 0) {
      setUploadError("Please upload at least one image (JPG, PNG, etc.).");
      return;
    }
    if (images.length > 5) {
      toast.info("Only the first 5 images will be processed.");
    }

    setUploadError("");
    setUploadSuccess("");
    setIsUploading(true);
    const PROGRESS_CAP = 90;
    const PROGRESS_INTERVAL_MS = 80;
    const PROGRESS_STEP = 4;

    const initial = capped.map((f, i) => ({
      id: `img-${Date.now()}-${i}-${f.name}`,
      name: f.name,
      progress: 0,
      status: "uploading" as const,
    }));
    setImageUploads(initial);

    const updateProgress = (id: string, progress: number, status: "uploading" | "done" | "error", error?: string) => {
      setImageUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress, status, error } : u))
      );
    };

    const runOne = async (file: File, id: string): Promise<Juror[]> => {
      let cancelled = false;
      const timer = window.setInterval(() => {
        if (cancelled) return;
        setImageUploads((prev) => {
          const u = prev.find((x) => x.id === id);
          if (!u || u.status !== "uploading") return prev;
          const next = Math.min(u.progress + PROGRESS_STEP, PROGRESS_CAP);
          return prev.map((x) => (x.id === id ? { ...x, progress: next } : x));
        });
      }, PROGRESS_INTERVAL_MS);

      try {
        const jurors = await extractAndParseJurorsFromImage(file, selectedCase.id);
        cancelled = true;
        clearInterval(timer);
        updateProgress(id, 100, "done");
        return jurors.map((j) => ({ ...j, submitted: false }));
      } catch (e) {
        cancelled = true;
        clearInterval(timer);
        const msg = e instanceof Error ? e.message : "Unknown error";
        updateProgress(id, 100, "error", msg);
        return [];
      }
    };

    const allResults = await Promise.all(capped.map((f, i) => runOne(f, initial[i].id)));
    const parsedJurors = allResults.flat();
    const okCount = allResults.filter((r) => r.length > 0).length;
    const failCount = capped.length - okCount;

    if (parsedJurors.length === 0) {
      setUploadError("No juror data found in any of the images.");
      setHasUploadedOnce(true);
      setIsUploading(false);
      setImageUploads([]);
      return;
    }

    if (failCount > 0) {
      toast.warning(`${failCount} image(s) had no juror data or failed. Added jurors from ${okCount} image(s).`);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        caseId: selectedCase.id,
        caseName: selectedCase.name,
        caseNumber: selectedCase.number,
        totalJurors: parsedJurors.length,
        submissionDate: new Date().toISOString(),
        jurors: parsedJurors.map((j) => ({
          ...j,
          source: "Image Extraction",
          createdAt: new Date().toISOString(),
        })),
      };
      await createJurorsApi(payload);

      const updatedJurorsByCase = { ...jurorsByCase };
      const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
      const submittedJurors = parsedJurors.map((j) => ({ ...j, submitted: true }));
      updatedJurorsByCase[selectedCase.id] = sortJurorsByNumber([...currentCaseJurors, ...submittedJurors]);
      setJurorsByCase(updatedJurorsByCase);

      setSuccessDialogData({
        count: parsedJurors.length,
        fileName: capped.length === 1 ? capped[0].name : `${capped.length} images`,
        imageCount: capped.length,
      });
      setShowSuccessDialog(true);
      setHasUploadedOnce(true);
      toast.success(`${parsedJurors.length} jurors uploaded successfully!`);
    } catch (submitErr: any) {
      const updatedJurorsByCase = { ...jurorsByCase };
      const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
      updatedJurorsByCase[selectedCase.id] = sortJurorsByNumber([...currentCaseJurors, ...parsedJurors]);
      setJurorsByCase(updatedJurorsByCase);

      const { toast: toastMsg, uploadErrorDetail } = getJurorCreateErrorDisplay(
        submitErr,
        "Failed to save jurors. Please try submitting manually."
      );
      setUploadError(uploadErrorDetail);
      setHasUploadedOnce(true);
      toast.error(toastMsg);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setImageUploads([]);
    }
  };

  // Details dialog now reads from analysis API; no local editing/save

  const handleAddJuror = (newJuror: Juror) => {
    if (!selectedCase) return;
    const updatedJurors = [...(jurorsByCase[selectedCase.id] || []), { ...newJuror, submitted: false }];
    setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: sortJurorsByNumber(updatedJurors) });
    setHasUploadedOnce(true);
    setUploadSuccess(`Juror ${newJuror.name} added to case ${selectedCase.number}`);
  };

  const handleDeleteJuror = (jurorId: string) => {
    if (!selectedCase) return;
    const updatedJurors = jurorsByCase[selectedCase.id].filter((j) => j.id !== jurorId);
    setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: updatedJurors });
    setUploadSuccess(`Juror deleted from case ${selectedCase.number}`);
  };

  const handleUpdateJuror = (updatedJuror: Juror) => {
    if (!selectedCase) return;
    const updatedJurors = jurorsByCase[selectedCase.id].map((j) =>
      j.id === updatedJuror.id ? { ...updatedJuror, submitted: j.submitted || false } : j
    );
    setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: sortJurorsByNumber(updatedJurors) });
    setSelectedJuror(updatedJuror);
  };

  const handleSubmitJurors = async () => {
    if (!selectedCase) return;

    const jurors = (jurorsByCase[selectedCase.id] || []).filter((j: any) => !j.submitted);
    if (jurors.length === 0) {
      toast.error("No new jurors to submit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        caseId: selectedCase.id,
        caseName: selectedCase.name,
        caseNumber: selectedCase.number,
        totalJurors: jurors.length,
        submissionDate: new Date().toISOString(),
        jurors: jurors.map((j) => ({
          ...j,
          source: j.id.startsWith("manual-") ? "Manual Entry" : "PDF Extraction",
          createdAt: new Date().toISOString(),
        })),
      };

      await createJurorsApi(payload);
      toast.success("Jurors submitted successfully!");

      const updated = jurorsByCase[selectedCase.id].map((j) => ({ ...j, submitted: true }));
      setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: sortJurorsByNumber(updated) });
      setUploadSuccess(`✅ Submitted ${jurors.length} jurors!`);
      setTimeout(() => setUploadSuccess(""), 10000);
    } catch (err: any) {
      const { toast: toastMsg } = getJurorCreateErrorDisplay(
        err,
        "Failed to submit jurors."
      );
      toast.error(toastMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getCases = async () => {
      try {
        const response = await getCasesApi();
        const jurorsMap: Record<string, Juror[]> = {};

        (response as any[]).forEach((c) => {
          const jurors = (c.jurors || []).map((j: Juror) => ({ ...j, submitted: true }));
          jurorsMap[String(c.id)] = sortJurorsByNumber(jurors);
        });

        const transformedCases = (response as any[]).map((c) => ({
          id: String(c.id),
          number: c.caseNumber,
          name: c.caseName,
          type: c.caseType,
          status: "Active",
          createdDate: c.createdAt,
          questions: c.caseQuestions,
        }));

        setCases(transformedCases);
        setJurorsByCase(jurorsMap);

        // Auto-select case from URL parameter if provided
        const caseIdFromUrl = searchParams.get("caseId");
        if (caseIdFromUrl && transformedCases.length > 0) {
          const caseToSelect = transformedCases.find((c) => c.id === caseIdFromUrl);
          if (caseToSelect) {
            setSelectedCase(caseToSelect);
            const caseJurors = jurorsMap[caseToSelect.id] || [];
            setHasUploadedOnce(caseJurors.length > 0);
            // Clear the URL parameter after selecting
            window.history.replaceState({}, "", "/dashboard/manage-jurors");
          }
        }
      } catch (error) {
        console.error("❌ Error getting cases:", error);
      }
    };
    getCases();
  }, [searchParams]);

  const currentJurors = selectedCase ? jurorsByCase[selectedCase.id] || [] : [];
  const sortedCurrentJurors = sortJurorsByNumber(currentJurors);
  const newJurors = sortJurorsByNumber(sortedCurrentJurors.filter((j: any) => !j.submitted));
  const oldJurors = sortJurorsByNumber(sortedCurrentJurors.filter((j: any) => j.submitted));

  const shouldShowSubmitButton = selectedCase && newJurors.length > 0;
  const shouldShowJurorDisplay = selectedCase && (hasUploadedOnce || currentJurors.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div className=" mx-auto space-y-6" initial="hidden" animate="visible" variants={itemVariants}>
        <TagBtnJuror setIsAddJurorOpen={setIsAddJurorOpen} />
        <div className="grid gap-6">
          <SelectCase
            cases={cases}
            selectedCase={selectedCase}
            onCaseSelect={handleCaseSelect}
            jurorsByCase={jurorsByCase}
            title="Select Case"
            description="Choose a case to manage its jurors"
            showDetails={true}
          />

          {selectedCase && (
            <PDFUploader
              selectedCase={selectedCase}
              onFileUpload={handleFileUpload}
              onMultipleImageUpload={handleMultipleImageUpload}
              imageUploads={imageUploads}
              isUploading={isUploading}
              isSubmitting={isSubmitting}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
            />
          )}

          {shouldShowSubmitButton && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-green-800">Ready to Submit</CardTitle>
                      <CardDescription className="text-green-600">
                        {newJurors.length} juror{newJurors.length > 1 ? "s" : ""} ready for case {selectedCase.number}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Button onClick={handleSubmitJurors} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit All Jurors
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {shouldShowJurorDisplay && (
            <JurorDisplay
              selectedCase={selectedCase}
              jurors={newJurors.length > 0 ? newJurors : oldJurors}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onViewDetails={handleViewJurorDetails}
              onDelete={handleDeleteJuror}
            />
          )}
        </div>

        <ManageJurorDetailsModal 
          isOpen={isJurorDetailsOpen} 
          onClose={() => setIsJurorDetailsOpen(false)} 
          juror={selectedJuror}
          onUpdate={handleUpdateJuror}
        />
        <AddJurorDialog isOpen={isAddJurorOpen} onClose={() => setIsAddJurorOpen(false)} onSave={handleAddJuror} selectedCase={selectedCase} />
        
        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Jurors Uploaded Successfully!</DialogTitle>
              <DialogDescription className="text-center pt-2">
                {successDialogData && (
                  <>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {successDialogData.count} juror{successDialogData.count > 1 ? "s" : ""} extracted and saved
                    </p>
                    <p className="text-sm text-gray-600">
                      from <span className="font-medium">{successDialogData.fileName}</span>
                    </p>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
