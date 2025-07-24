/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectCase } from "@/components/shared/select-case";
import JuryPoolGrid from "./components/jury-pool-grid";
import {
  Play,
  Square,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  StickyNote,
  Gavel,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  CheckCircle,
  XCircle,
  Edit,
  HelpCircle,
} from "lucide-react";

// Mock data
const mockCases = [
  {
    id: "1",
    number: "CV-2025-001",
    name: "Tech Corp vs. Startup Inc",
    type: "Civil",
    status: "Active",
    createdDate: "2025-01-15",
    questions: [
      "Have you ever worked in the technology industry?",
      "Do you own any patents or intellectual property?",
      "Have you been involved in any legal disputes?",
      "Do you have any bias against large corporations?",
      "Are you familiar with mobile app development?",
    ],
  },
  {
    id: "2",
    number: "CV-2025-002",
    name: "Medical Malpractice Case",
    type: "Medical",
    status: "Active",
    createdDate: "2025-01-20",
    questions: [
      "Have you or a family member ever been treated by the defendant doctor?",
      "Do you have any medical training or background?",
      "Have you ever been involved in a medical malpractice case?",
      "Do you have strong feelings about the medical profession?",
      "Can you be impartial in evaluating medical testimony?",
    ],
  },
];

// Updated mock jurors to match your backend structure
const mockJurors = [
  {
    id: "ai-1751453811501-1",
    name: "BRANDON ZAVEN KIRKSHARIAN",
    jurorNumber: "2166 - 06",
    age: 30,
    dateOfBirth: "03/09/1993",
    gender: "Male",
    race: "Non-Hispanic White",
    email: "Not Specified",
    phone: "2812207287",
    workPhone: "Not Specified",
    address: "22923 POWELL, HOUSE LANE, KATY, TX 77449 - 0070",
    mailingAddress: "Not Specified",
    county: "Harris",
    location: "Harris",
    occupation: "N/A",
    employer: "Not Specified",
    employmentDuration: "Not Specified",
    education: "Not Specified",
    maritalStatus: "Not Specified",
    spouse: "Not Specified",
    children: "0",
    citizenship: "Yes",
    tdl: "29390482",
    panelPosition: "4",
    criminalCase: "Not Specified",
    accidentalInjury: "Not Specified",
    civilJury: "Not Specified",
    criminalJury: "Not Specified",
    biasStatus: "low",
    availability: "Available",
    experience: "Not Specified",
    caseId: "1",
    source: "PDF Extraction",
    createdAt: "2025-07-02T10:57:25.500Z",
    seatNumber: 1,
  },
  {
    id: "ai-1751453811501-2",
    name: "SARAH MICHELLE JOHNSON",
    jurorNumber: "2166 - 07",
    age: 28,
    dateOfBirth: "05/15/1995",
    gender: "Female",
    race: "Hispanic",
    email: "sarah.johnson@email.com",
    phone: "2813456789",
    workPhone: "2819876543",
    address: "15432 MAPLE STREET, HOUSTON, TX 77001 - 1234",
    mailingAddress: "Same as above",
    county: "Harris",
    location: "Harris",
    occupation: "Registered Nurse",
    employer: "Memorial Hermann Hospital",
    employmentDuration: "5 years",
    education: "Bachelor's Degree",
    maritalStatus: "Single",
    spouse: "Not Applicable",
    children: "0",
    citizenship: "Yes",
    tdl: "29390483",
    panelPosition: "5",
    criminalCase: "No",
    accidentalInjury: "No",
    civilJury: "No",
    criminalJury: "No",
    biasStatus: "medium",
    availability: "Available",
    experience: "First time serving on jury",
    caseId: "1",
    source: "PDF Extraction",
    createdAt: "2025-07-02T10:57:25.500Z",
    seatNumber: 2,
  },
  {
    id: "ai-1751453811501-3",
    name: "MICHAEL ROBERT DAVIS",
    jurorNumber: "2166 - 08",
    age: 45,
    dateOfBirth: "12/22/1978",
    gender: "Male",
    race: "African American",
    email: "mike.davis@techcorp.com",
    phone: "2817654321",
    workPhone: "2814567890",
    address: "8901 OAK AVENUE, SUGAR LAND, TX 77478 - 5678",
    mailingAddress: "Not Specified",
    county: "Fort Bend",
    location: "Fort Bend",
    occupation: "Software Engineer",
    employer: "Tech Solutions Inc",
    employmentDuration: "10 years",
    education: "Master's Degree",
    maritalStatus: "Married",
    spouse: "Jennifer Davis",
    children: "2",
    citizenship: "Yes",
    tdl: "29390484",
    panelPosition: "6",
    criminalCase: "No",
    accidentalInjury: "Yes - Car accident 2019",
    civilJury: "Yes - 2020",
    criminalJury: "No",
    biasStatus: "high",
    availability: "Limited",
    experience: "Served on civil jury once",
    caseId: "1",
    source: "PDF Extraction",
    createdAt: "2025-07-02T10:57:25.500Z",
    seatNumber: 3,
  },
  {
    id: "ai-1751453811501-4",
    name: "LISA MARIE WILSON",
    jurorNumber: "2166 - 09",
    age: 52,
    dateOfBirth: "08/30/1971",
    gender: "Female",
    race: "Non-Hispanic White",
    email: "lisa.wilson@accounting.com",
    phone: "2819876543",
    workPhone: "2812345678",
    address: "4567 PINE STREET, THE WOODLANDS, TX 77380 - 9012",
    mailingAddress: "P.O. Box 123, The Woodlands, TX 77380",
    county: "Montgomery",
    location: "Montgomery",
    occupation: "Certified Public Accountant",
    employer: "Wilson & Associates CPA",
    employmentDuration: "15 years",
    education: "Bachelor's Degree",
    maritalStatus: "Divorced",
    spouse: "Not Applicable",
    children: "3",
    citizenship: "Yes",
    tdl: "29390485",
    panelPosition: "7",
    criminalCase: "No",
    accidentalInjury: "No",
    civilJury: "No",
    criminalJury: "Yes - 2018",
    biasStatus: "low",
    availability: "Available",
    experience: "Served on criminal jury in 2018",
    caseId: "1",
    source: "PDF Extraction",
    createdAt: "2025-07-02T10:57:25.500Z",
    seatNumber: 4,
  },
  {
    id: "ai-1751453811501-5",
    name: "DAVID ANTHONY BROWN",
    jurorNumber: "2166 - 10",
    age: 39,
    dateOfBirth: "11/18/1984",
    gender: "Male",
    race: "Asian",
    email: "david.brown@manager.com",
    phone: "2815432109",
    workPhone: "2818765432",
    address: "7890 ELM DRIVE, PEARLAND, TX 77584 - 3456",
    mailingAddress: "Not Specified",
    county: "Brazoria",
    location: "Brazoria",
    occupation: "Operations Manager",
    employer: "Global Logistics Corp",
    employmentDuration: "8 years",
    education: "Bachelor's Degree",
    maritalStatus: "Married",
    spouse: "Amanda Brown",
    children: "1",
    citizenship: "Yes",
    tdl: "29390486",
    panelPosition: "8",
    criminalCase: "No",
    accidentalInjury: "No",
    civilJury: "No",
    criminalJury: "No",
    biasStatus: "medium",
    availability: "Available",
    experience: "No prior jury service",
    caseId: "1",
    source: "PDF Extraction",
    createdAt: "2025-07-02T10:57:25.500Z",
    seatNumber: 5,
  },
];

interface Note {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

interface Answer {
  id: string;
  jurorId: string;
  jurorName: string;
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export default function LiveSession() {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedJurors, setSelectedJurors] = useState<string[]>([]);
  const [struckJurors, setStruckJurors] = useState<string[]>([]);
  const [jurorNotes, setJurorNotes] = useState<Record<string, Note[]>>({});
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLeftColumnCollapsed, setIsLeftColumnCollapsed] = useState(false);
  const [isRightColumnCollapsed, setIsRightColumnCollapsed] = useState(false);

  // New states for inline question handling
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [answerText, setAnswerText] = useState("");

  // Dialog states (keeping only note and strike dialogs)
  const [newQuestion, setNewQuestion] = useState("");
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [strikeDialogOpen, setStrikeDialogOpen] = useState(false);
  const [selectedJurorForStrike, setSelectedJurorForStrike] = useState<string>("");
  const [strikeType, setStrikeType] = useState<"cause" | "peremptory">("cause");
  const [strikeReason, setStrikeReason] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedJurorForNote, setSelectedJurorForNote] = useState<string>("");
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCase) {
      setQuestions(selectedCase.questions || []);
    }
  }, [selectedCase]);

  const handleStartSession = () => {
    setSessionActive(true);
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setSelectedJurors([]);
  };

  const handleJurorSelect = (jurorId: string) => {
    if (!sessionActive) return;

    setSelectedJurors((prev) => (prev.includes(jurorId) ? prev.filter((id) => id !== jurorId) : [...prev, jurorId]));
  };

  const handleRecordAnswers = () => {
    if (selectedQuestions.length === 0 || !answerText.trim() || selectedJurors.length === 0) return;

    const newAnswers: Answer[] = [];

    selectedJurors.forEach((jurorId) => {
      const juror = mockJurors.find((j) => j.id === jurorId);
      selectedQuestions.forEach((question) => {
        newAnswers.push({
          id: `${jurorId}-${question}-${Date.now()}`,
          jurorId,
          jurorName: juror?.name || "",
          questionId: question,
          question,
          answer: answerText,
          timestamp: new Date().toLocaleString(),
        });
      });
    });

    setAnswers((prev) => [...prev, ...newAnswers]);
    setSelectedQuestions([]);
    setAnswerText("");
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;

    setQuestions((prev) => [...prev, newQuestion]);
    setNewQuestion("");
    setAddQuestionDialogOpen(false);
  };

  const handleStrikeJuror = () => {
    if (!selectedJurorForStrike) return;

    setStruckJurors((prev) => [...prev, selectedJurorForStrike]);
    setSelectedJurors((prev) => prev.filter((id) => id !== selectedJurorForStrike));
    setStrikeDialogOpen(false);
    setSelectedJurorForStrike("");
    setStrikeReason("");
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedJurorForNote) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date().toLocaleString(),
      author: "Current User",
    };

    setJurorNotes((prev) => ({
      ...prev,
      [selectedJurorForNote]: [...(prev[selectedJurorForNote] || []), note],
    }));

    setNewNote("");
    setNoteDialogOpen(false);
  };

  const handleEditNote = (jurorId: string, noteId: string, newContent: string) => {
    setJurorNotes((prev) => ({
      ...prev,
      [jurorId]:
        prev[jurorId]?.map((note) => (note.id === noteId ? { ...note, content: newContent, timestamp: new Date().toLocaleString() } : note)) || [],
    }));
    setEditingNote(null);
  };

  const handleDeleteNote = (jurorId: string, noteId: string) => {
    setJurorNotes((prev) => ({
      ...prev,
      [jurorId]: prev[jurorId]?.filter((note) => note.id !== noteId) || [],
    }));
  };

  const totalEntries = selectedJurors.length * selectedQuestions.length;

  // Calculate stats for Live Session Stats
  const totalQuestions = questions.length;
  const totalJurors = mockJurors.length;
  const jurorsWhoAnswered = [...new Set(answers.map((answer) => answer.jurorId))].length;
  const jurorsWhoDidntAnswer = totalJurors - jurorsWhoAnswered;

  // Calculate grid template columns based on collapsed states
  const getGridColumns = () => {
    if (isLeftColumnCollapsed && isRightColumnCollapsed) {
      return "1fr"; // This shouldn't happen, but fallback to show left
    }
    if (isLeftColumnCollapsed) {
      return "0fr 1fr"; // Hide left, show right
    }
    if (isRightColumnCollapsed) {
      return "1fr 0fr"; // Show left, hide right
    }
    return "2fr 1fr"; // Show both (default)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* Left Panel Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLeftColumnCollapsed(!isLeftColumnCollapsed)}
          className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
          title={isLeftColumnCollapsed ? "" : ""}
        >
          {isLeftColumnCollapsed ? <ChevronRight className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          <span className="hidden sm:inline">{isLeftColumnCollapsed ? "" : ""}</span>
        </Button>

        {/* Right Panel Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRightColumnCollapsed(!isRightColumnCollapsed)}
          className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-200"
          title={isRightColumnCollapsed ? "" : ""}
        >
          <span className="hidden sm:inline">{isRightColumnCollapsed ? "" : ""}</span>
          {isRightColumnCollapsed ? <ChevronLeft className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Jury Selection</h1>
              <p className="text-gray-600">Interactive courtroom jury pool management</p>
            </div>
          </div>
        </div>

        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Top Row */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Select a Case
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SelectCase cases={mockCases} selectedCase={selectedCase} onCaseSelect={setSelectedCase} title="" description="" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Users className="h-5 w-5" />
                  Live Session Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCase ? (
                  <div className="space-y-6">
                    {/* Live Session Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Total Questions */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{totalQuestions}</div>
                            <div className="text-xs text-gray-600">Total Questions</div>
                          </div>
                        </div>
                      </div>

                      {/* Total Jurors */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{totalJurors}</div>
                            <div className="text-xs text-gray-600">Total Jurors</div>
                          </div>
                        </div>
                      </div>

                      {/* Jurors Who Didn't Answer */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 rounded-lg">
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{jurorsWhoDidntAnswer}</div>
                            <div className="text-xs text-gray-600">Didn't Answer</div>
                          </div>
                        </div>
                      </div>

                      {/* Jurors Who Answered */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            <Edit className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{jurorsWhoAnswered}</div>
                            <div className="text-xs text-gray-600">Answered</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Session Control Buttons */}
                    <div className="flex flex-col gap-3 items-center">
                      {!sessionActive ? (
                        <Button
                          onClick={handleStartSession}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          Start Session
                        </Button>
                      ) : (
                        <Button
                          onClick={handleEndSession}
                          variant="destructive"
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full"
                        >
                          <Square className="h-4 w-4" />
                          End Session
                        </Button>
                      )}

                      {/* Session Status Indicator */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                        <Badge variant={sessionActive ? "default" : "secondary"} className="px-2 py-1 text-xs">
                          {sessionActive ? "Session Active" : "Session Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <HelpCircle className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-center">Select a case to view session data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main 2-Column Layout with Toggle */}
        <div className="mt-6 relative">
          <div
            className="grid transition-all duration-500 ease-in-out gap-6"
            style={{
              gridTemplateColumns: getGridColumns(),
            }}
          >
            {/* Left Column - Courtroom Jury Pool Layout */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLeftColumnCollapsed ? "opacity-0" : "opacity-100"}`}>
              <Card className="h-full">
                <CardContent className="p-0">
                  {selectedCase ? (
                    <div className="space-y-4">
                      <JuryPoolGrid
                        jurors={mockJurors}
                        selectedJurors={selectedJurors}
                        struckJurors={struckJurors}
                        jurorNotes={jurorNotes}
                        onJurorSelect={handleJurorSelect}
                        onStrikeJuror={(jurorId) => {
                          setSelectedJurorForStrike(jurorId);
                          setStrikeDialogOpen(true);
                        }}
                        onAddNote={(jurorId) => {
                          setSelectedJurorForNote(jurorId);
                          setNoteDialogOpen(true);
                        }}
                        sessionActive={sessionActive}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">Select a case to view the jury pool</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Questions and Controls */}
            <div
              className={`space-y-6 transition-all duration-500 ease-in-out overflow-hidden ${isRightColumnCollapsed ? "opacity-0" : "opacity-100"}`}
            >
              {/* Selected Jurors Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Selected Jurors ({selectedJurors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedJurors.length > 0 ? (
                    <div className="space-y-2">
                      {selectedJurors.map((jurorId) => {
                        const juror = mockJurors.find((j) => j.id === jurorId);

                        return (
                          <div key={jurorId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                #{juror?.seatNumber}
                              </Badge>
                              <span className="text-sm font-medium">{juror?.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleJurorSelect(jurorId)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">No jurors selected</div>
                  )}
                </CardContent>
              </Card>

              {/* Questions Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCase ? (
                    <div className="space-y-3">
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {questions.map((question, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Checkbox
                                id={`question-${index}`}
                                checked={selectedQuestions.includes(question)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedQuestions((prev) => [...prev, question]);
                                  } else {
                                    setSelectedQuestions((prev) => prev.filter((q) => q !== question));
                                  }
                                }}
                              />
                              <label htmlFor={`question-${index}`} className="text-sm leading-relaxed cursor-pointer">
                                {question}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Dialog open={addQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="new-question">Question</Label>
                              <Textarea
                                id="new-question"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Enter your question..."
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleAddQuestion} disabled={!newQuestion.trim()}>
                                Add Question
                              </Button>
                              <Button variant="outline" onClick={() => setAddQuestionDialogOpen(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {selectedQuestions.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-2">Selected Questions ({selectedQuestions.length})</div>
                          <div className="space-y-1">
                            {selectedQuestions.map((question, index) => (
                              <div key={index} className="text-xs text-blue-700 bg-white p-2 rounded">
                                {question}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">Select a case to view questions</div>
                  )}
                </CardContent>
              </Card>

              {/* Record Answer Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Enter the response from the selected jurors..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    {totalEntries > 0 && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        This will create {totalEntries} answer entries ({selectedJurors.length} jurors × {selectedQuestions.length} questions)
                      </div>
                    )}

                    <Button
                      onClick={handleRecordAnswers}
                      disabled={selectedQuestions.length === 0 || !answerText.trim() || selectedJurors.length === 0}
                      className="w-full"
                    >
                      Record Answers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Row - Session Answers */}
        {answers.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {answers.map((answer) => (
                      <div key={answer.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{answer.jurorName}</div>
                          <div className="text-xs text-gray-500">{answer.timestamp}</div>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{answer.question}</div>
                        <div className="text-sm bg-gray-50 p-2 rounded">{answer.answer}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Strike Dialog */}
        <Dialog open={strikeDialogOpen} onOpenChange={setStrikeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Strike Juror</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Strike Type</Label>
                <Select value={strikeType} onValueChange={(value: "cause" | "peremptory") => setStrikeType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cause">For Cause</SelectItem>
                    <SelectItem value="peremptory">Peremptory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {strikeType === "cause" && (
                <div>
                  <Label htmlFor="strike-reason">Reason for Cause</Label>
                  <Textarea
                    id="strike-reason"
                    value={strikeReason}
                    onChange={(e) => setStrikeReason(e.target.value)}
                    placeholder="Enter the reason for striking this juror for cause..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleStrikeJuror} variant="destructive" disabled={strikeType === "cause" && !strikeReason.trim()}>
                  Strike Juror
                </Button>
                <Button variant="outline" onClick={() => setStrikeDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Notes ({jurorNotes[selectedJurorForNote]?.length || 0})</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Existing Notes */}
              {jurorNotes[selectedJurorForNote]?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Existing Notes</Label>
                  <ScrollArea className="h-32 mt-2">
                    <div className="space-y-2">
                      {jurorNotes[selectedJurorForNote].map((note) => (
                        <div key={note.id} className="border rounded p-2">
                          {editingNote === note.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={note.content}
                                onChange={(e) => {
                                  const newContent = e.target.value;
                                  setJurorNotes((prev) => ({
                                    ...prev,
                                    [selectedJurorForNote]:
                                      prev[selectedJurorForNote]?.map((n) => (n.id === note.id ? { ...n, content: newContent } : n)) || [],
                                  }));
                                }}
                                rows={2}
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleEditNote(selectedJurorForNote, note.id, note.content);
                                  }}
                                >
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingNote(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm">{note.content}</div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="text-xs text-gray-500">{note.timestamp}</div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingNote(note.id)}>
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(selectedJurorForNote, note.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Add New Note */}
              <div>
                <Label htmlFor="new-note">Add New Note</Label>
                <Textarea
                  id="new-note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note about this juror..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <StickyNote className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoteDialogOpen(false);
                    setNewNote("");
                    setEditingNote(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
