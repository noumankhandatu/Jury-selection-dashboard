import { useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import SearchPanel from "./components/search-panel";
import CaseTable from "./components/case-table";
import ViewCaseDialog from "./components/view-case-dialog";
import EditCaseDialog from "./components/edit-case-dialog";
import { itemVariants } from "@/utils/fn";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  description: string;
  jurorTraits: string;
  questions: string[];
}

export default function SearchCasePage() {
  const [cases, setCases] = useState<Case[]>([
    {
      id: "1",
      number: "CV-2025-001",
      name: "Smith vs. Johnson",
      type: "Civil",
      status: "Active",
      createdDate: "2025-01-15",
      description: "Contract dispute between two business partners",
      jurorTraits: "Looking for jurors with business experience",
      questions: [
        "Have you ever been involved in a business partnership?",
        "Do you have experience with contract law?",
        "Can you remain impartial in a business dispute?",
      ],
    },
    {
      id: "2",
      number: "CR-2025-002",
      name: "State vs. Williams",
      type: "Criminal",
      status: "Pending",
      createdDate: "2025-01-20",
      description: "Assault and battery case",
      jurorTraits: "Seeking jurors with no prior criminal history",
      questions: [
        "Have you or a family member been a victim of assault?",
        "Do you have any law enforcement background?",
        "Can you evaluate evidence objectively?",
      ],
    },
    {
      id: "3",
      number: "CV-2025-003",
      name: "Tech Corp vs. Startup Inc",
      type: "Civil",
      status: "Pending",
      createdDate: "2025-01-25",
      description: "Intellectual property dispute between technology companies",
      jurorTraits: "Prefer jurors with basic understanding of technology and patents",
      questions: [
        "Do you work in the technology industry?",
        "Are you familiar with intellectual property concepts?",
        "Do you own stock in any technology companies?",
      ],
    },
    {
      id: "4",
      number: "CR-2025-004",
      name: "State vs. Anderson",
      type: "Criminal",
      status: "Active",
      createdDate: "2025-01-28",
      description: "Drug possession and distribution charges",
      jurorTraits: "Looking for unbiased jurors regarding drug-related offenses",
      questions: [
        "What are your views on drug legalization?",
        "Have you or family members struggled with addiction?",
        "Can you judge based on evidence rather than personal beliefs?",
      ],
    },
    {
      id: "5",
      number: "CV-2025-005",
      name: "Property Dispute - Miller vs. Davis",
      type: "Civil",
      status: "Draft",
      createdDate: "2025-02-01",
      description: "Boundary dispute between neighboring property owners",
      jurorTraits: "Seeking property owners who understand real estate matters",
      questions: ["Do you own property?", "Have you had boundary disputes with neighbors?", "Are you familiar with property law basics?"],
    },
  ]);

  const [filteredCases, setFilteredCases] = useState<Case[]>(cases);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editFormData, setEditFormData] = useState({
    number: "",
    name: "",
    type: "",
    status: "",
    description: "",
    jurorTraits: "",
    questions: [] as string[],
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
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

  const handleDeleteCase = (caseId: string) => {
    const updatedCases = cases.filter((case_) => case_.id !== caseId);
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
  };

  const handleEditFormDataChange = (field: string, value: string | string[]) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (editingCase) {
      const updatedCases = cases.map((case_) =>
        case_.id === editingCase.id
          ? {
              ...case_,
              ...editFormData,
            }
          : case_
      );
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

        <CaseTable cases={filteredCases} onViewCase={handleViewCase} onEditCase={handleEditCase} onDeleteCase={handleDeleteCase} />

        <ViewCaseDialog isOpen={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} selectedCase={selectedCase} />

        <EditCaseDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editingCase={editingCase}
          editFormData={editFormData}
          onEditFormDataChange={handleEditFormDataChange}
          onSave={handleSaveEdit}
        />
      </motion.div>
    </div>
  );
}
