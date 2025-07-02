import { FileText, CheckCircle2, Clock } from "lucide-react";

export interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
}

export const mockCases: Case[] = [
  {
    id: "1",
    number: "CV-2025-001",
    name: "Smith vs. Johnson Construction",
    type: "Civil",
    status: "Active",
    createdDate: "2025-01-15",
  },
  {
    id: "2",
    number: "CR-2025-002",
    name: "State vs. Williams",
    type: "Criminal",
    status: "Active",
    createdDate: "2025-01-20",
  },
  {
    id: "3",
    number: "CV-2025-003",
    name: "Tech Corp vs. Startup Inc",
    type: "Civil",
    status: "Pending",
    createdDate: "2025-01-25",
  },
  {
    id: "4",
    number: "CR-2025-004",
    name: "State vs. Anderson",
    type: "Criminal",
    status: "Active",
    createdDate: "2025-01-28",
  },
  {
    id: "5",
    number: "CV-2025-005",
    name: "Property Dispute - Miller vs. Davis",
    type: "Civil",
    status: "Draft",
    createdDate: "2025-02-01",
  },
];

// Mock data for chart
export const casesTrendData = [
  { month: "Jan", cases: 8, completed: 5, incomplete: 3 },
  { month: "Feb", cases: 12, completed: 8, incomplete: 4 },
  { month: "Mar", cases: 15, completed: 10, incomplete: 5 },
  { month: "Apr", cases: 18, completed: 12, incomplete: 6 },
  { month: "May", cases: 22, completed: 14, incomplete: 8 },
  { month: "Jun", cases: 24, completed: 16, incomplete: 8 },
];

export const cardData = [
  {
    title: "Total Cases",
    subtitle: "All time cases managed",
    value: 24,
    icon: FileText,
    change: "+5 this month",
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50",
    hoverBg: "from-blue-100 to-indigo-100",
    textColor: "text-blue-600",
  },
  {
    title: "Completed Cases",
    subtitle: "Successfully closed cases",
    value: 16,
    icon: CheckCircle2,
    change: "+3 this month",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    hoverBg: "from-green-100 to-emerald-100",
    textColor: "text-green-600",
  },
  {
    title: "Incomplete Cases",
    subtitle: "Active and pending cases",
    value: 8,
    icon: Clock,
    change: "+2 this month",
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-50 to-orange-50",
    hoverBg: "from-amber-100 to-orange-100",
    textColor: "text-amber-600",
  },
];
