/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  questions: string[];
}

const mockCases: Case[] = [
  {
    id: "1",
    number: "CV-2025-001",
    name: "Smith vs. Johnson Construction",
    type: "Civil",
    status: "Active",
    createdDate: "2025-01-15",
    questions: [
      "Have you ever been involved in a construction dispute?",
      "Do you have any experience with contract law?",
      "Have you ever worked in the construction industry?",
      "Do you have any bias against large corporations?",
      "Have you ever served on a jury before?",
      "Raise your hand if you are a teacher",
      "Raise your hand if you own property",
      "Raise your hand if you have children",
    ],
  },
  {
    id: "2",
    number: "CR-2025-002",
    name: "State vs. Williams",
    type: "Criminal",
    status: "Active",
    createdDate: "2025-01-20",
    questions: [
      "Have you or anyone close to you been a victim of a crime?",
      "Do you have any law enforcement experience?",
      "Can you be impartial in a criminal case?",
      "Have you ever been arrested or charged with a crime?",
      "Do you believe in the presumption of innocence?",
      "Raise your hand if you have family in law enforcement",
      "Raise your hand if you watch crime shows regularly",
    ],
  },
  {
    id: "3",
    number: "CV-2025-003",
    name: "Tech Corp vs. Startup Inc",
    type: "Civil",
    status: "Active",
    createdDate: "2025-01-25",
    questions: [
      "Do you work in the technology industry?",
      "Have you ever been involved in intellectual property disputes?",
      "Do you understand software development concepts?",
      "Have you ever started your own business?",
      "Do you have any bias for or against large tech companies?",
      "Raise your hand if you use social media daily",
      "Raise your hand if you own cryptocurrency",
    ],
  },
];

const CasePicker = ({
  selectedCase,
  setSelectedCase,
  isSessionActive,
  setSelectedJurors,
  setSelectedQuestions,
  setCurrentAnswer,
  sessionStartTime,
}: any) => {
  const [open, setOpen] = useState(false);

  return (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="caseSearch">Active Cases</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left font-normal"
              disabled={isSessionActive}
            >
              {selectedCase ? (
                <span>
                  {selectedCase.number} - {selectedCase.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Select a case to start live session...</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search cases..." className="h-9" />
              <CommandList>
                <CommandEmpty>No active cases found.</CommandEmpty>
                <CommandGroup>
                  {mockCases
                    .filter((case_) => case_.status === "Active")
                    .map((case_) => (
                      <CommandItem
                        key={case_.id}
                        value={`${case_.number} ${case_.name}`}
                        onSelect={() => {
                          setSelectedCase(case_);
                          setOpen(false);
                          setSelectedJurors([]);
                          setSelectedQuestions([]);
                          setCurrentAnswer("");
                        }}
                        className="flex flex-col items-start py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{case_.number}</span>
                          <Badge style={{ backgroundColor: "#5156be", color: "white" }}>{case_.status}</Badge>
                        </div>
                        <span className="text-sm font-medium">{case_.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {case_.type} • {case_.questions.length} questions
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedCase && (
        <Card className="bg-gray-50 border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedCase.number}</h3>
                <Badge style={{ backgroundColor: "#5156be", color: "white" }}>{selectedCase.status}</Badge>
              </div>
              <p className="text-sm font-medium">{selectedCase.name}</p>
              <div className=" gap-4 text-sm text-muted-foreground hidden md:flex">
                <span>Type: {selectedCase.type}</span>
                <span>Questions: {selectedCase.questions.length}</span>
                <span>Created: {new Date(selectedCase.createdDate).toLocaleDateString()}</span>
                {sessionStartTime && <span>Session Started: {sessionStartTime}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </CardContent>
  );
};

export default CasePicker;
