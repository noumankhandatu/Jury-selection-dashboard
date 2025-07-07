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
import { Users, Send, CheckCircle } from "lucide-react";
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
  // Store all jurors by case ID
  const [jurorsByCase, setJurorsByCase] = useState<Record<string, Juror[]>>({});

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [hasUploadedOnce, setHasUploadedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaseSelect = (case_: Case) => {
    console.log("🚀 handleCaseSelect called with:", case_);

    if (!case_ || !case_.id) {
      console.error("❌ Invalid case passed to handleCaseSelect:", case_);
      return;
    }

    console.log("✅ Setting selectedCase to:", case_);
    setSelectedCase(case_);

    // Get jurors for the selected case (will be empty initially until PDFs are uploaded)
    const caseJurors = jurorsByCase[case_.id] || [];
    console.log(`📊 Found ${caseJurors.length} jurors for case ${case_.id}`);

    // Check if this case has had uploads before
    setHasUploadedOnce(caseJurors.length > 0);

    // Clear any previous upload messages
    setUploadError("");
    setUploadSuccess("");
  };

  const handleViewJurorDetails = (juror: Juror) => {
    setSelectedJuror(juror);
    setIsJurorDetailsOpen(true);
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
      // Extract and parse juror data directly from PDF using OpenAI
      const parsedJurors = await extractAndParseJurorsFromPDF(file, selectedCase.id);

      if (parsedJurors.length === 0) {
        setUploadError("No juror data found in the PDF. Please check the file format and try again.");
        setHasUploadedOnce(true); // Show empty state
        return;
      }

      // Add parsed jurors to the case
      const updatedJurorsByCase = { ...jurorsByCase };
      const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
      updatedJurorsByCase[selectedCase.id] = [...currentCaseJurors, ...parsedJurors];
      setJurorsByCase(updatedJurorsByCase);

      setUploadSuccess(
        `🤖 AI successfully extracted ${parsedJurors.length} juror${parsedJurors.length > 1 ? "s" : ""} from ${file.name} and added to case ${
          selectedCase.number
        }!`
      );

      // Mark that we've uploaded at least once
      setHasUploadedOnce(true);

      // Auto-clear success message after 8 seconds
      setTimeout(() => {
        setUploadSuccess("");
      }, 8000);
    } catch (err) {
      console.error("OpenAI PDF processing error:", err);
      setUploadError(`AI processing failed for "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
      setHasUploadedOnce(true); // Show empty state even on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveJuror = (updatedJuror: Juror) => {
    if (!selectedCase) return;

    // Update the juror in the case's juror list
    const updatedJurorsByCase = { ...jurorsByCase };
    updatedJurorsByCase[selectedCase.id] = updatedJurorsByCase[selectedCase.id].map((juror) => (juror.id === updatedJuror.id ? updatedJuror : juror));
    setJurorsByCase(updatedJurorsByCase);

    // Update selected juror if it's the same one
    if (selectedJuror?.id === updatedJuror.id) {
      setSelectedJuror(updatedJuror);
    }
  };

  const handleAddJuror = (newJuror: Juror) => {
    if (!selectedCase) return;

    // Add the new juror to the case's juror list
    const updatedJurorsByCase = { ...jurorsByCase };
    const currentCaseJurors = updatedJurorsByCase[selectedCase.id] || [];
    updatedJurorsByCase[selectedCase.id] = [...currentCaseJurors, newJuror];
    setJurorsByCase(updatedJurorsByCase);

    // Mark that we have jurors now
    setHasUploadedOnce(true);

    // Show success message
    setUploadSuccess(`Successfully added juror ${newJuror.name} to case ${selectedCase.number}!`);
  };

  const handleDeleteJuror = (jurorId: string) => {
    if (!selectedCase) return;

    // Delete the juror from the case's juror list
    const updatedJurorsByCase = { ...jurorsByCase };
    updatedJurorsByCase[selectedCase.id] = updatedJurorsByCase[selectedCase.id].filter((juror) => juror.id !== jurorId);
    setJurorsByCase(updatedJurorsByCase);

    // Show success message
    setUploadSuccess(`Successfully deleted juror from case ${selectedCase.number}!`);
  };

  const handleSubmitJurors = async () => {
    if (!selectedCase) {
      toast.error("No case selected.");
      return;
    }

    const currentJurors = jurorsByCase[selectedCase.id] || [];

    if (currentJurors.length === 0) {
      toast.error("No jurors to submit.");
      return;
    }

    setIsSubmitting(true);

    const jurorSubmissionData = {
      caseId: selectedCase.id,
      caseName: selectedCase.name,
      caseNumber: selectedCase.number,
      totalJurors: currentJurors.length,
      submissionDate: new Date().toISOString(),
      jurors: currentJurors.map((juror) => ({
        // Basic Info
        id: juror.id,
        name: juror.name,
        jurorNumber: juror.jurorNumber,
        age: juror.age,
        dateOfBirth: juror.dateOfBirth,
        gender: juror.gender,
        race: juror.race,

        // Contact Info
        email: juror.email,
        phone: juror.phone,
        workPhone: juror.workPhone,
        address: juror.address,
        mailingAddress: juror.mailingAddress,
        county: juror.county,
        location: juror.location,

        // Professional Info
        occupation: juror.occupation,
        employer: juror.employer,
        employmentDuration: juror.employmentDuration,
        education: juror.education,

        // Personal Info
        maritalStatus: juror.maritalStatus,
        spouse: juror.spouse,
        children: juror.children,
        citizenship: juror.citizenship,

        // Legal Info
        tdl: juror.tdl,
        panelPosition: juror.panelPosition,
        criminalCase: juror.criminalCase,
        accidentalInjury: juror.accidentalInjury,
        civilJury: juror.civilJury,
        criminalJury: juror.criminalJury,

        // System Info
        biasStatus: juror.biasStatus,
        availability: juror.availability,
        experience: juror.experience,
        caseId: juror.caseId,

        // Source tracking
        source: juror.id.startsWith("manual-") ? "Manual Entry" : "PDF Extraction",
        createdAt: new Date().toISOString(),
      })),
    };

    try {
      const result = await createJurorsApi(jurorSubmissionData);
      console.log("✅ Jurors Created:", result);
      toast.success("Jurors created successfully!");

      // Visual confirmation
      setUploadSuccess(
        `✅ Successfully submitted ${currentJurors.length} juror${currentJurors.length > 1 ? "s" : ""} for case ${
          selectedCase.number
        }! Check console for complete data.`
      );

      // Auto-clear after 10 seconds
      setTimeout(() => setUploadSuccess(""), 10000);
    } catch (err: any) {
      console.error("❌ Error creating jurors:", err);
      toast.error(err?.error || "Failed to create jurors.");
      setUploadError("Failed to submit jurors. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

    // 🪵 Console Output
    console.log("🚀 JUROR SUBMISSION DATA:");
    console.log("=".repeat(50));
    console.log(`📋 Case: ${jurorSubmissionData.caseName} (${jurorSubmissionData.caseNumber})`);
    console.log(`👥 Total Jurors: ${jurorSubmissionData.totalJurors}`);
    console.log(`📅 Submission Date: ${new Date(jurorSubmissionData.submissionDate).toLocaleString()}`);
    console.log("=".repeat(50));
    console.log("📊 COMPLETE JUROR ARRAY:");
    console.table(jurorSubmissionData.jurors);
    console.log("=".repeat(50));
    console.log("🔍 RAW JSON DATA:");
    console.log(JSON.stringify(jurorSubmissionData, null, 2));
    console.log("=".repeat(50));
  };

  useEffect(() => {
    console.log("🚀 useEffect called");
    const getCases = async () => {
      try {
        const response = await getCasesApi();
        console.log("✅ Cases:", response);
        // Transform API response to match SelectCase interface
        type RawCase = {
          id: number | string;
          caseNumber: string;
          caseName: string;
          caseType: string;
          createdAt: string;
          caseQuestions?: string[];
          jurors?: Juror[];
        };
        const transformedCases = (response as RawCase[]).map((c) => ({
          id: String(c.id),
          number: c.caseNumber,
          name: c.caseName,
          type: c.caseType,
          status: "Active", // or map from c.status if available
          createdDate: c.createdAt,
          questions: c.caseQuestions,
        }));
        // Build jurorsByCase object
        const jurorsMap: Record<string, Juror[]> = {};
        (response as RawCase[]).forEach((c) => {
          jurorsMap[String(c.id)] = c.jurors || [];
        });
        setCases(transformedCases);
        setJurorsByCase(jurorsMap);
      } catch (error) {
        console.error("❌ Error getting cases:", error);
      }
    };
    getCases();
  }, []);
  // Get current case jurors safely
  const currentJurors = selectedCase ? jurorsByCase[selectedCase.id] || [] : [];

  // Only show JurorDisplay if we have uploaded at least once or have jurors
  const shouldShowJurorDisplay = selectedCase && hasUploadedOnce;

  // Show submit button if we have jurors
  const shouldShowSubmitButton = selectedCase && currentJurors.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={itemVariants}>
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

          {/* Only show AI-Powered Juror Extraction section when a case is selected */}
          {selectedCase && (
            <PDFUploader
              selectedCase={selectedCase}
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
            />
          )}

          {/* Only show JurorDisplay after at least one upload attempt */}
          {shouldShowJurorDisplay && (
            <JurorDisplay
              selectedCase={selectedCase}
              jurors={currentJurors}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onViewDetails={handleViewJurorDetails}
              onDelete={handleDeleteJuror}
            />
          )}

          {/* Submit Button - Only show when there are jurors */}
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
                        {currentJurors.length} juror{currentJurors.length > 1 ? "s" : ""} ready for case {selectedCase.number}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Users className="h-4 w-4" />
                      <span>
                        {currentJurors.filter((j) => String(j.id).startsWith("manual-")).length} Manual +{" "}
                        {currentJurors.filter((j) => !String(j.id).startsWith("manual-")).length} PDF Extracted
                      </span>
                    </div>
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <JurorDetailsDialog isOpen={isJurorDetailsOpen} onClose={() => setIsJurorDetailsOpen(false)} juror={selectedJuror} onSave={handleSaveJuror} />

        <AddJurorDialog isOpen={isAddJurorOpen} onClose={() => setIsAddJurorOpen(false)} onSave={handleAddJuror} selectedCase={selectedCase} />
      </motion.div>
    </div>
  );
}
