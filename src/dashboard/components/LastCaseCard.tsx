import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Hash, Scale, CalendarDays, AlignLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getCasesApi } from "@/api/api";

type CaseType = "CIVIL" | "CRIMINAL";

interface CaseItem {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  caseName?: string | null;
  description?: string | null;
  idealJurorTraits?: string | null;
  createdAt: string;
}

export default function LastCaseCard() {
  const [lastCase, setLastCase] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const cases: CaseItem[] = await getCasesApi();
        if (Array.isArray(cases) && cases.length > 0) {
          // API already sends in desc order; keep a defensive sort.
          const sorted = [...cases].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLastCase(sorted[0]);
        } else {
          setLastCase(null);
        }
      } catch {
        setError("Failed to load last case");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createdAtText = useMemo(() => {
    if (!lastCase?.createdAt) return "";
    try {
      const d = new Date(lastCase.createdAt);
      const date = d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const time = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${date}, ${time}`;
    } catch {
      return lastCase.createdAt;
    }
  }, [lastCase]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="p-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg"
                whileHover={{ scale: 1.1, rotate: 8 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Last Case
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Most recently created case
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-0 flex-1 flex flex-col">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="flex items-center space-x-3 text-gray-600">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-b-transparent border-indigo-600"></div>
                <span>Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : !lastCase ? (
            <div className="text-gray-600 text-sm">No cases found.</div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Case Name */}
              <div>
                <div className="text-sm text-gray-500">Case Name</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {lastCase.caseName || "Untitled Case"}
                </div>
              </div>

              {/* Case Number & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Hash className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Case Number</div>
                    <div className="text-sm font-medium text-gray-800">
                      {lastCase.caseNumber}
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Scale className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Case Type</div>
                    <div className="text-sm font-medium text-gray-800">
                      {lastCase.caseType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start space-x-2">
                <CalendarDays className="w-4 h-4 text-violet-600 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm font-medium text-gray-800">
                    {createdAtText}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start space-x-2">
                <AlignLeft className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {lastCase.description || "No description provided."}
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              <div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    if (!lastCase) return;
                    window.location.href = `/dashboard/session-analysis?caseId=${encodeURIComponent(
                      lastCase.id
                    )}`;
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
