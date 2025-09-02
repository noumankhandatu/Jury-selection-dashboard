// manage-jurors-page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SelectCase, type Case } from "@/components/shared/select-case";
import { PDFUploader } from "./components/pdf-uploader";
import { JurorDisplay } from "./components/juror-display";
import { JurorDetailsDialog } from "./components/juror-details-dialog";
import { AddJurorDialog } from "./components/add-juror-dialog";
import { extractAndParseJurorsFromPDF } from "./components/utils";
import type { Juror } from "./components/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import { itemVariants } from "@/utils/fn";
import TagBtnJuror from "@/components/shared/tag/tag-btn-manage-juror";
import { createJurorsApi, getCasesApi } from "@/api/api";
import { toast } from "sonner";

export default function ManageJurorsPage() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedJuror, setSelectedJuror] = useState<Juror | null>(null);
  const [isJurorDetailsOpen, setIsJurorDetailsOpen] = useState(false);
  const [isAddJurorOpen, setIsAddJurorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [cases, setCases] = useState<Case[]>([]);
  const [jurorsByCase, setJurorsByCase] = useState<Record<string, Juror[]>>({});

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [hasUploadedOnce, setHasUploadedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const parsedJurors = (await extractAndParseJurorsFromPDF(file, selectedCase.id)).map((j) => ({
        ...j,
        submitted: false,
      }));

      if (parsedJurors.length === 0) {
        setUploadError("No juror data found in the PDF.");
        setHasUploadedOnce(true);
        return;
      }

      const updatedJurorsByCase = { ...jurorsByCase };
      const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
      updatedJurorsByCase[selectedCase.id] = [...currentCaseJurors, ...parsedJurors];
      setJurorsByCase(updatedJurorsByCase);

      setUploadSuccess(`✅ Extracted ${parsedJurors.length} jurors from ${file.name}`);
      setHasUploadedOnce(true);
      setTimeout(() => setUploadSuccess(""), 8000);
    } catch (err) {
      setUploadError(`Processing failed for "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
      setHasUploadedOnce(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Details dialog now reads from analysis API; no local editing/save

  const handleAddJuror = (newJuror: Juror) => {
    if (!selectedCase) return;
    const updatedJurors = [...(jurorsByCase[selectedCase.id] || []), { ...newJuror, submitted: false }];
    setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: updatedJurors });
    setHasUploadedOnce(true);
    setUploadSuccess(`Juror ${newJuror.name} added to case ${selectedCase.number}`);
  };

  const handleDeleteJuror = (jurorId: string) => {
    if (!selectedCase) return;
    const updatedJurors = jurorsByCase[selectedCase.id].filter((j) => j.id !== jurorId);
    setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: updatedJurors });
    setUploadSuccess(`Juror deleted from case ${selectedCase.number}`);
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
      setJurorsByCase({ ...jurorsByCase, [selectedCase.id]: updated });
      setUploadSuccess(`✅ Submitted ${jurors.length} jurors!`);
      setTimeout(() => setUploadSuccess(""), 10000);
    } catch (err: any) {
      toast.error(err?.error || "Failed to submit jurors.");
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
          jurorsMap[String(c.id)] = (c.jurors || []).map((j: Juror) => ({ ...j, submitted: true }));
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
      } catch (error) {
        console.error("❌ Error getting cases:", error);
      }
    };
    getCases();
  }, []);

  const currentJurors = selectedCase ? jurorsByCase[selectedCase.id] || [] : [];
  const newJurors = currentJurors.filter((j: any) => !j.submitted);
  const oldJurors = currentJurors.filter((j: any) => j.submitted);

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
              isUploading={isUploading}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
            />
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
        </div>

        <JurorDetailsDialog isOpen={isJurorDetailsOpen} onClose={() => setIsJurorDetailsOpen(false)} juror={selectedJuror} />
        <AddJurorDialog isOpen={isAddJurorOpen} onClose={() => setIsAddJurorOpen(false)} onSave={handleAddJuror} selectedCase={selectedCase} />
      </motion.div>
    </div>
  );
}
