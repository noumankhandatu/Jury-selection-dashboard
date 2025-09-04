/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, List, Scale, Users } from "lucide-react";
import type { Juror } from "./types";
import { ManageJurorCard } from "./manage-juror-card";
import { JurorTable } from "./juror-table";
import CardHeaderTag from "@/components/shared/card-header";

interface JurorDisplayProps {
  selectedCase: any | null;
  jurors: Juror[];
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onViewDetails: (juror: Juror) => void;
  onDelete: (jurorId: string) => void;
}

export function JurorDisplay({ selectedCase, jurors, viewMode, onViewModeChange, onViewDetails }: JurorDisplayProps) {
  if (!selectedCase) return null;

  const isNewJurorList = jurors.some((j: any) => !j.submitted);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.8 } }} className="space-y-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut", delay: 1.0 } }}>
        <Card className="bg-white/80 relative backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeaderTag
            title={isNewJurorList ? "Available Jurors" : "Old Jurors"}
            description={isNewJurorList ? "Available jurors for case" : "Previously submitted jurors"}
            Icon={Users}
          />
          <div className="flex items-center justify-end absolute top-6 right-4 gap-2">
            <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as "table" | "grid")}>
              <TabsList className="bg-white/60">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardContent className="p-4 sm:p-6">
            {jurors.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                  {jurors.map((juror) => (
                    <ManageJurorCard key={juror.id} juror={juror} onViewDetails={onViewDetails} />
                  ))}
                </div>
              ) : (
                <JurorTable jurors={jurors} onViewDetails={onViewDetails} />
              )
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Scale className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No jurors available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
