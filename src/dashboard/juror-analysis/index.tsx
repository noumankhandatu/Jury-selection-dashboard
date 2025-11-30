import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ChevronDown, MessageSquare, Brain, AlertTriangle, CheckCircle, Clock, Scale, Users, BarChart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { generateAvatar } from "@/dashboard/manage-jurors/components/utils";

interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
}

interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  confidence: number;
}

interface JurorAnalysis {
  id: string;
  name: string;
  age: number;
  occupation: string;
  education: string;
  experience: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  address: string;
  biasStatus: "low" | "moderate" | "high";
  caseId: string;
  questionsAnswered: QuestionAnswer[];
  aiAnalysis: {
    biasReason: string;
    keyFactors: string[];
    riskLevel: "low" | "medium" | "high";
    recommendation: string;
    confidenceScore: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const BiasIndicator = ({ biasStatus }: { biasStatus: "low" | "moderate" | "high" }) => {
  const getIndicatorColor = () => {
    switch (biasStatus) {
      case "low":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <motion.div
      className="absolute -top-1 -right-1 flex items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <div className={`w-3 h-3 rounded-full ${getIndicatorColor()} border-2 border-white shadow-sm`} />
    </motion.div>
  );
};

export default function JurorAnalysisPage() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedJuror, setSelectedJuror] = useState<JurorAnalysis | null>(null);
  const [open, setOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const mockCases: Case[] = [
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
  ];

  const [allJurors] = useState<JurorAnalysis[]>([
    {
      id: "1",
      name: "John Smith",
      age: 34,
      occupation: "Teacher",
      education: "Bachelor's Degree",
      experience: "No prior jury experience",
      location: "Downtown",
      availability: "Available",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      address: "123 Main St, City, State 12345",
      biasStatus: "low",
      caseId: "1",
      questionsAnswered: [
        {
          id: "1",
          question: "Have you ever worked in construction?",
          answer: "No, I have never worked in construction. I've been a teacher for 10 years.",
          timestamp: "2025-01-15T10:30:00Z",
          confidence: 95,
        },
        {
          id: "2",
          question: "Do you have any bias against construction companies?",
          answer: "I don't think so. I believe everyone deserves fair treatment regardless of their profession.",
          timestamp: "2025-01-15T10:32:00Z",
          confidence: 88,
        },
        {
          id: "3",
          question: "Have you been injured at work before?",
          answer: "No, I work in a safe office environment at the school.",
          timestamp: "2025-01-15T10:34:00Z",
          confidence: 92,
        },
      ],
      aiAnalysis: {
        biasReason:
          "Juror shows no direct connection to construction industry and demonstrates neutral stance. Educational background suggests analytical thinking. No personal injury experience that could influence judgment.",
        keyFactors: [
          "No construction industry experience",
          "Neutral attitude toward construction companies",
          "No personal injury history",
          "Educational background promotes fairness",
        ],
        riskLevel: "low",
        recommendation: "Suitable for jury selection. Shows balanced perspective and no apparent bias.",
        confidenceScore: 92,
      },
    },
    {
      id: "2",
      name: "Sarah Johnson",
      age: 42,
      occupation: "Engineer",
      education: "Master's Degree",
      experience: "Served on 2 juries",
      location: "Suburbs",
      availability: "Available",
      email: "sarah.johnson@email.com",
      phone: "(555) 234-5678",
      address: "456 Oak Ave, City, State 12345",
      biasStatus: "moderate",
      caseId: "1",
      questionsAnswered: [
        {
          id: "1",
          question: "Have you ever worked in construction?",
          answer: "I'm a civil engineer, so I work closely with construction companies on projects.",
          timestamp: "2025-01-15T11:15:00Z",
          confidence: 98,
        },
        {
          id: "2",
          question: "Do you have any bias against construction companies?",
          answer: "I work with them professionally. Some are good, some cut corners. It depends on the company.",
          timestamp: "2025-01-15T11:17:00Z",
          confidence: 85,
        },
        {
          id: "3",
          question: "Have you been injured at work before?",
          answer: "I've seen safety violations on construction sites that concerned me.",
          timestamp: "2025-01-15T11:19:00Z",
          confidence: 90,
        },
      ],
      aiAnalysis: {
        biasReason:
          "Professional experience with construction industry creates potential bias. Has witnessed safety violations which may influence judgment. However, shows professional objectivity and experience with industry standards.",
        keyFactors: [
          "Professional relationship with construction industry",
          "Witnessed safety violations",
          "Mixed opinions about construction companies",
          "Technical expertise may influence judgment",
        ],
        riskLevel: "medium",
        recommendation: "Proceed with caution. Professional experience could be valuable but may create bias. Consider for technical cases.",
        confidenceScore: 78,
      },
    },
    {
      id: "3",
      name: "Michael Brown",
      age: 28,
      occupation: "Accountant",
      education: "Bachelor's Degree",
      experience: "No prior jury experience",
      location: "Downtown",
      availability: "Limited",
      email: "michael.brown@email.com",
      phone: "(555) 345-6789",
      address: "789 Pine St, City, State 12345",
      biasStatus: "high",
      caseId: "2",
      questionsAnswered: [
        {
          id: "1",
          question: "Have you ever been a victim of theft?",
          answer: "Yes, my car was broken into last year and my laptop was stolen. It was very frustrating.",
          timestamp: "2025-01-20T14:20:00Z",
          confidence: 96,
        },
        {
          id: "2",
          question: "Do you have any family members in law enforcement?",
          answer: "My brother is a police officer. He tells me about criminals all the time.",
          timestamp: "2025-01-20T14:22:00Z",
          confidence: 94,
        },
        {
          id: "3",
          question: "Can you remain impartial in criminal cases?",
          answer: "I think criminals should be punished. If someone steals, they're probably guilty.",
          timestamp: "2025-01-20T14:24:00Z",
          confidence: 89,
        },
      ],
      aiAnalysis: {
        biasReason:
          "Strong bias against defendants due to personal victimization and family law enforcement connection. Demonstrates presumption of guilt and punitive mindset. Unlikely to remain impartial.",
        keyFactors: [
          "Personal victim of theft",
          "Family member in law enforcement",
          "Presumption of guilt attitude",
          "Punitive mindset toward criminals",
        ],
        riskLevel: "high",
        recommendation: "Not suitable for criminal jury. Strong bias against defendants. Consider dismissal during voir dire.",
        confidenceScore: 91,
      },
    },
  ]);

  const [filteredJurors, setFilteredJurors] = useState<JurorAnalysis[]>([]);

  const handleCaseSelect = (case_: Case) => {
    setSelectedCase(case_);
    setOpen(false);
    // Filter jurors for the selected case
    const caseJurors = allJurors.filter((juror) => juror.caseId === case_.id);
    setFilteredJurors(caseJurors);
  };

  const handleJurorClick = (juror: JurorAnalysis) => {
    setSelectedJuror(juror);
    setIsAnalysisDialogOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!selectedCase) return;

    if (term === "") {
      const caseJurors = allJurors.filter((juror) => juror.caseId === selectedCase.id);
      setFilteredJurors(caseJurors);
    } else {
      const caseJurors = allJurors.filter((juror) => juror.caseId === selectedCase.id);
      const filtered = caseJurors.filter(
        (juror) =>
          juror.name.toLowerCase().includes(term.toLowerCase()) ||
          juror.occupation.toLowerCase().includes(term.toLowerCase()) ||
          juror.location.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredJurors(filtered);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <motion.div className="max-w-7xl mx-auto space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div className="flex items-center space-x-4" variants={itemVariants}>
          <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Juror Analysis</h1>
        </motion.div>

        {/* Case Selection */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Select Case</span>
              </CardTitle>
              <CardDescription className="text-white/80">Choose a case to analyze jurors</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80"
                  >
                    {selectedCase ? selectedCase.name : "Select a case..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search cases..." className="h-9" />
                    <CommandEmpty>No case found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {mockCases.map((case_) => (
                          <CommandItem
                            key={case_.id}
                            value={case_.name}
                            onSelect={() => {
                              handleCaseSelect(case_);
                              setOpen(false);
                            }}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={
                                  case_.type === "Criminal" ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700 border-blue-200"
                                }
                              >
                                {case_.type}
                              </Badge>
                              <span>{case_.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Jurors</span>
              </CardTitle>
              <CardDescription className="text-white/80">Find and analyze jurors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="jurorSearch" className="text-gray-700">
                  Search Jurors
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="jurorSearch"
                    placeholder="Search by name, occupation, or location..."
                    className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jurors Grid */}
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>Juror Analysis</span>
              </CardTitle>
              <CardDescription className="text-white/80">Review juror profiles and bias analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredJurors.map((juror) => (
                    <motion.div
                      key={juror.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border-gray-200"
                        onClick={() => handleJurorClick(juror)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={generateAvatar(juror.name, (juror as any).gender)} alt={juror.name} />
                                <AvatarFallback>
                                  {juror.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <BiasIndicator biasStatus={juror.biasStatus} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-semibold text-lg">{juror.name}</h3>
                              <p className="text-sm text-gray-600">{juror.occupation}</p>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    juror.biasStatus === "low"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : juror.biasStatus === "moderate"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {juror.biasStatus.charAt(0).toUpperCase() + juror.biasStatus.slice(1)} Bias
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    juror.aiAnalysis.riskLevel === "low"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : juror.aiAnalysis.riskLevel === "medium"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-red-100 text-red-700 border-red-200"
                                  }
                                >
                                  {juror.aiAnalysis.riskLevel.charAt(0).toUpperCase() + juror.aiAnalysis.riskLevel.slice(1)} Risk
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-xs text-gray-500">Age</Label>
                              <p className="font-medium">{juror.age}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Education</Label>
                              <p className="font-medium">{juror.education}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Experience</Label>
                              <p className="font-medium">{juror.experience}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Location</Label>
                              <p className="font-medium">{juror.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredJurors.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-8 text-gray-500">
                    {searchTerm ? "No jurors found matching your search criteria" : "Select a case to view jurors"}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis Dialog */}
        <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedJuror ? generateAvatar(selectedJuror.name, (selectedJuror as any).gender) : "/placeholder.svg"} alt={selectedJuror?.name} />
                    <AvatarFallback>
                      {selectedJuror?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedJuror && <BiasIndicator biasStatus={selectedJuror.biasStatus} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedJuror?.name}</h2>
                  <p className="text-sm text-gray-600">{selectedJuror?.occupation}</p>
                </div>
              </DialogTitle>
              <DialogDescription>Detailed analysis of juror responses and AI bias assessment</DialogDescription>
            </DialogHeader>

            {selectedJuror && (
              <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {/* Juror Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-xs text-gray-500">Age</Label>
                    <p className="font-medium">{selectedJuror.age}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Education</Label>
                    <p className="font-medium">{selectedJuror.education}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Experience</Label>
                    <p className="font-medium">{selectedJuror.experience}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Location</Label>
                    <p className="font-medium">{selectedJuror.location}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI Analysis</span>
                    </CardTitle>
                    <CardDescription className="text-white/80">AI-powered bias assessment and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(selectedJuror.aiAnalysis.riskLevel)}
                        <span className="font-medium">Risk Level: {selectedJuror.aiAnalysis.riskLevel}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedJuror.aiAnalysis.riskLevel === "low"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : selectedJuror.aiAnalysis.riskLevel === "medium"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        Confidence: {selectedJuror.aiAnalysis.confidenceScore}%
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bias Assessment</Label>
                      <p className="mt-1 text-gray-600">{selectedJuror.aiAnalysis.biasReason}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Key Factors</Label>
                      <ul className="mt-2 space-y-1">
                        {selectedJuror.aiAnalysis.keyFactors.map((factor, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Recommendation</Label>
                      <p className="mt-1 text-gray-600">{selectedJuror.aiAnalysis.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions & Answers */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Questions & Answers</span>
                    </CardTitle>
                    <CardDescription className="text-white/80">Review juror responses and confidence scores</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {selectedJuror.questionsAnswered.map((qa, index) => (
                      <motion.div
                        key={qa.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">{qa.question}</h4>
                            <p className="text-gray-600">{qa.answer}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              qa.confidence >= 90
                                ? "bg-green-100 text-green-700 border-green-200"
                                : qa.confidence >= 80
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {qa.confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{new Date(qa.timestamp).toLocaleString()}</div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
