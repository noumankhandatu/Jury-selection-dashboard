/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import SearchPanel from "./components/search-panel";
import CaseTable from "./components/case-table";
import ViewCaseDialog from "./components/view-case-dialog";
import EditCaseDialog from "./components/edit-case-dialog";
import { itemVariants } from "@/utils/fn";
import { getCasesApi, getSessionsByCaseApi } from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  description: string;
  jurorTraits: string;
}

export default function SearchCasePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSessionSummaryDialogOpen, setIsSessionSummaryDialogOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [sessionSummaryCase, setSessionSummaryCase] = useState<Case | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    name: "",
    type: "",
    status: "",
    description: "",
    jurorTraits: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 5;

  const fetchCases = async () => {
    try {
      const response = await getCasesApi();
      const mappedCases: Case[] = response.map((item: any) => ({
        id: String(item.id),
        number: item.caseNumber,
        name: item.caseName,
        type: item.caseType,
        status: "Active",
        createdDate: item.createdAt,
        description: item.description,
        jurorTraits: item.idealJurorTraits,
      }));
      setCases(mappedCases);
      setFilteredCases(mappedCases);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // reset to first page on new search
    setFilteredCases(
      cases.filter(
        (case_) =>
          term === "" ||
          case_.number.toLowerCase().includes(term.toLowerCase()) ||
          case_.name.toLowerCase().includes(term.toLowerCase()) ||
          case_.type.toLowerCase().includes(term.toLowerCase()) ||
          case_.status.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_);
    setIsViewDialogOpen(true);
  };

  const handleEditCase = (case_: Case) => {
    setEditingCase(case_);
    setEditFormData(case_);
    setIsEditDialogOpen(true);
  };

  const handleViewSessionSummary = async (case_: Case) => {
    setIsLoadingSummary(true);
    setSessionSummaryCase(case_);
    setIsSessionSummaryDialogOpen(true);
    
    try {
      const response = await getSessionsByCaseApi(case_.id);
      const sessions = response?.sessions || [];
      
      // Get the most recent session with a summary
      const sessionWithSummary = sessions
        .filter((s: any) => s.summary)
        .sort((a: any, b: any) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];
      
      if (sessionWithSummary?.summary) {
        setSessionSummary(sessionWithSummary.summary);
      } else {
        setSessionSummary(null);
        toast.info("No session summary available for this case yet.");
      }
    } catch (error: any) {
      console.error("Error fetching session summary:", error);
      setSessionSummary(null);
      toast.error("Failed to load session summary");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleEditFormDataChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (editingCase) {
      const updatedCases = cases.map((case_) => (case_.id === editingCase.id ? { ...case_, ...editFormData } : case_));
      setCases(updatedCases);
      setFilteredCases(
        updatedCases.filter(
          (case_) =>
            searchTerm === "" ||
            case_.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            case_.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            case_.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            case_.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setIsEditDialogOpen(false);
    }
  };

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  const renderPagination = () => (
    <div className="mt-4 flex justify-center space-x-2">
      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentPage(idx + 1)}
          className={`px-3 py-1 rounded border ${
            currentPage === idx + 1 ? "bg-indigo-500 text-white" : "bg-white text-indigo-500 border-indigo-300"
          }`}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div className="mx-auto space-y-6" initial="hidden" animate="visible" variants={itemVariants}>
        <motion.div className="flex items-center space-x-4" variants={itemVariants}>
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Search & Manage Cases</h1>
        </motion.div>

        <SearchPanel searchTerm={searchTerm} onSearch={handleSearch} />

        <CaseTable 
          cases={currentCases} 
          onViewCase={handleViewCase} 
          onEditCase={handleEditCase}
          onViewSessionSummary={handleViewSessionSummary}
        />

        {renderPagination()}

        <ViewCaseDialog isOpen={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} selectedCase={selectedCase} />

        <EditCaseDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editingCase={editingCase}
          editFormData={editFormData}
          onEditFormDataChange={handleEditFormDataChange}
          onSave={handleSaveEdit}
        />

        {/* Session Summary Dialog */}
        <Dialog open={isSessionSummaryDialogOpen} onOpenChange={setIsSessionSummaryDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Session Summary
              </DialogTitle>
              <DialogDescription>
                {sessionSummaryCase?.name || "Case Session Summary"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {isLoadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Loading session summary...</span>
                </div>
              ) : sessionSummary ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {sessionSummary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground italic">
                    No session summary available for this case yet.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete a live session to generate a summary.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
