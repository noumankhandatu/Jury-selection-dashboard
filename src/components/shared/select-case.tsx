/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, FileText } from "lucide-react";
import CardHeaderTag from "@/components/shared/card-header";
import { itemVariants } from "@/utils/fn";

export interface Case {
  id: string;
  number: string;
  name: string;
  type: string;
  status: string;
  createdDate: string;
  questions?: string[];
}

export interface SelectCaseProps {
  cases: Case[];
  selectedCase: Case | null;
  onCaseSelect: (case_: Case) => void;
  jurorsByCase?: Record<string, any[]>;
  title?: string;
  description?: string;
  showDetails?: boolean;
  className?: string;
}

export function SelectCase({
  cases,
  selectedCase,
  onCaseSelect,
  jurorsByCase = {},
  title = "Select Case",
  description = "Choose a case to proceed",
  showDetails = true,
  className = "",
}: SelectCaseProps) {
  const [open, setOpen] = useState(false);

  const handleCaseSelect = (case_: Case) => {
    onCaseSelect(case_);
    setOpen(false);
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeaderTag title={title} description={description} Icon={FileText} />
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <Label htmlFor="caseSearch" className="text-sm font-medium">
            Search Cases
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-left font-normal bg-white/70 backdrop-blur-md border border-gray-300 hover:border-blue-400 transition-colors duration-200"
              >
                {selectedCase ? (
                  <span className="truncate">
                    {selectedCase.number} - {selectedCase.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Search by case number or name...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search cases..." className="h-9 px-3" />
                <CommandList>
                  <CommandEmpty>No cases found.</CommandEmpty>
                  <CommandGroup>
                    {cases.map((case_) => (
                      <CommandItem
                        key={case_.id}
                        value={`${case_.number} ${case_.name}`}
                        onSelect={() => handleCaseSelect(case_)}
                        className="flex flex-col items-start py-3 px-4 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{case_.number}</span>
                          <Badge variant={case_.status === "Active" ? "default" : case_.status === "Pending" ? "secondary" : "outline"}>
                            {case_.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{case_.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {case_.type} • Created {new Date(case_.createdDate).toLocaleDateString()}
                          {jurorsByCase[case_.id] && ` • ${jurorsByCase[case_.id].length} jurors`}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {showDetails && selectedCase && (
          <motion.div className="mt-4" variants={itemVariants}>
            <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-100 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{selectedCase.number}</h3>
                    <Badge variant={selectedCase.status === "Active" ? "default" : selectedCase.status === "Pending" ? "secondary" : "outline"}>
                      {selectedCase.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{selectedCase.name}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <span>Type: {selectedCase.type}</span>
                    <span>Created: {new Date(selectedCase.createdDate).toLocaleDateString()}</span>
                    {jurorsByCase[selectedCase.id] && <span>Jurors: {jurorsByCase[selectedCase.id].length}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
