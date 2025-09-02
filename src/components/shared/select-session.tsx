/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown, Timer } from "lucide-react";
import CardHeaderTag from "@/components/shared/card-header";
import { itemVariants } from "@/utils/fn";

export interface SessionItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    assignments?: number;
    responses?: number;
    assessments?: number;
  };
}

export interface SelectSessionProps {
  sessions: SessionItem[];
  selectedSession: SessionItem | null;
  onSessionSelect: (session: SessionItem) => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  className?: string;
}

export function SelectSession({
  sessions,
  selectedSession,
  onSessionSelect,
  title = "Select Session",
  description = "Choose a session to proceed",
  showDetails = true,
  className = "",
}: SelectSessionProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (s: SessionItem) => {
    onSessionSelect(s);
    setOpen(false);
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeaderTag title={title} description={description} Icon={Timer} />
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <Label htmlFor="sessionSearch" className="text-sm font-medium">
            Search Sessions
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-left font-normal bg-white/70 backdrop-blur-md border border-gray-300 hover:border-blue-400 transition-colors duration-200"
              >
                {selectedSession ? (
                  <span className="truncate">{selectedSession.name}</span>
                ) : (
                  <span className="text-muted-foreground">Search by session name...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search sessions..." className="h-9 px-3" />
                <CommandList>
                  <CommandEmpty>No sessions found.</CommandEmpty>
                  <CommandGroup>
                    {sessions.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={`${s.name} ${s.status}`}
                        onSelect={() => handleSelect(s)}
                        className="flex flex-col items-start py-3 px-4 data-[selected=true]:bg-blue-50"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium truncate max-w-[300px]">{s.name}</span>
                        </div>
                        {s.startTime && (
                          <span className="text-xs text-muted-foreground">Starts {new Date(s.startTime).toLocaleString()}</span>
                        )}
                        {s._count && (
                          <span className="text-xs text-muted-foreground">
                            {s._count.assignments ?? 0} assignments • {s._count.responses ?? 0} responses
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {showDetails && selectedSession && (
          <motion.div className="mt-4" variants={itemVariants}>
            <Card className="bg-blue-50/50 backdrop-blur-md border border-blue-100 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg truncate max-w-[300px]">{selectedSession.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {selectedSession.startTime && <span>Start: {new Date(selectedSession.startTime).toLocaleString()}</span>}
                    {selectedSession.endTime && <span>End: {new Date(selectedSession.endTime).toLocaleString()}</span>}
                    {selectedSession._count && (
                      <span>
                        Assignments: {selectedSession._count.assignments ?? 0} • Responses: {selectedSession._count.responses ?? 0}
                      </span>
                    )}
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


