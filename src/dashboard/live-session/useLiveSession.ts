/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getCasesApi } from "@/api/api";
import { Case } from "@/components/shared/select-case";

export const useLiveSession = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    const getCases = async () => {
      try {
        const response = await getCasesApi();

        const transformedCases = (response || []).map((c: any) => ({
          id: String(c.id),
          number: c.caseNumber,
          name: c.caseName,
          type: c.caseType,
          status: "Active",
          createdDate: c.createdAt,
          questions: c.caseQuestions,
          caseDescription: c.description,
          jurorTraits: c.idealJurorTraits,
        }));

        setCases(transformedCases);
      } catch (error) {
        console.error("❌ Error getting cases:", error);
      }
    };

    getCases();
  }, []);

  const handleCaseSelect = (case_: any) => {
    if (!case_ || !case_.id) return;
    setSelectedCase(case_);
  };

  return {
    cases,
    selectedCase,
    handleCaseSelect,
  };
};
