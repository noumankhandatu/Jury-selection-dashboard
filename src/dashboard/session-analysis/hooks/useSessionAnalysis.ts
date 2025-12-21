/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  getCasesApi,
  getSessionsByCaseApi,
  getSessionStatisticsApi,
  getBestJurorsApi,
  generateStrikeRecommendationsApi,
} from "@/api/api";
import type { Case as UISelectCase } from "@/components/shared/select-case";
import type { SessionItem } from "@/components/shared/select-session";
import type {
  ApiCase,
  ApiSession,
  ApiSessionById,
  ApiSessionStatisticsResponse,
} from "../types";

export const useSessionAnalysis = () => {
  const [cases, setCases] = useState<UISelectCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<UISelectCase | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [sessionDetail, setSessionDetail] = useState<ApiSessionById | null>(
    null
  );
  const [selectedResponseId, setSelectedResponseId] = useState<string>("");
  const [sessionStats, setSessionStats] =
    useState<ApiSessionStatisticsResponse | null>(null);
  const [bestJurors, setBestJurors] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCasesApi();
        const transformed: UISelectCase[] = ((response || []) as ApiCase[]).map(
          (c) => ({
            id: String(c.id),
            number: c.caseNumber,
            name: c.caseName,
            type: c.caseType,
            status: "Active",
            createdDate: c.createdAt,
            questions: c.caseQuestions,
          })
        );
        setCases(transformed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load cases");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedCase?.id) {
        setSessions([]);
        setSelectedSession(null);
        setSessionDetail(null);
        return;
      }
      try {
        const data = await getSessionsByCaseApi(selectedCase.id);
        const list = Array.isArray(data?.sessions)
          ? (data.sessions as ApiSession[])
          : [];
        const transformed: SessionItem[] = list.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          status: s.status,
          startTime: s.startTime,
          endTime: s.endTime,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          summary: s.summary,
          _count: s._count,
        }));
        setSessions(transformed);
      } catch {
        setSessions([]);
      }
    };
    fetchSessions();
  }, [selectedCase?.id]);

useEffect(() => {
  const fetchDetail = async () => {
    if (!selectedSession?.id) {
      setSessionDetail(null);
      setSelectedResponseId("");
      return;
    }
    try {
      const stats = await getSessionStatisticsApi(selectedSession.id);
      setSessionStats(stats as ApiSessionStatisticsResponse);
      
      // Get summary from selectedSession (which comes from sessions list)
      const sessionSummary = selectedSession.summary;
      
      // Provide minimal sessionDetail for existing consumers
      const session: ApiSessionById = {
        id: stats?.session?.id || selectedSession.id,
        name: stats?.session?.name || selectedSession.name,
        description: "",
        status: selectedSession.status || "",
        startTime: selectedSession.startTime || "",
        endTime: selectedSession.endTime || null,
        createdAt: selectedSession.createdAt || "",
        updatedAt: selectedSession.updatedAt || "",
        summary: sessionSummary, // ADDED SUMMARY HERE
        caseId: stats?.session?.case?.id || "",
        case: {
          caseNumber: stats?.session?.case?.caseNumber || "",
          caseName: stats?.session?.case?.caseName || "",
          caseType: stats?.session?.case?.caseType || "",
        },
        assignments: [],
        responses: [],
        scores: [],
      } as any;
      setSessionDetail(session);
    } catch (err: any) {
      // Check if it's a token error (429) - don't break the page for token errors
      const isTokenError = 
        err?.response?.status === 429 || 
        err?.response?.data?.error === "Insufficient AI tokens";
      
      if (isTokenError) {
        // For token errors, keep existing data and just log the error
        // The StrikeRecommendationsSection will handle token errors separately
        console.warn("Token error in session statistics (non-critical):", err);
        // Still try to set basic session detail from selectedSession data
        const session: ApiSessionById = {
          id: selectedSession.id,
          name: selectedSession.name,
          description: selectedSession.description || "",
          status: selectedSession.status || "",
          startTime: selectedSession.startTime || "",
          endTime: selectedSession.endTime || null,
          createdAt: selectedSession.createdAt || "",
          updatedAt: selectedSession.updatedAt || "",
          summary: selectedSession.summary,
          caseId: "",
          case: {
            caseNumber: "",
            caseName: "",
            caseType: "",
          },
          assignments: [],
          responses: [],
          scores: [],
        } as any;
        setSessionDetail(session);
      } else {
        // For other errors, only clear data if it's a critical error (not 404, etc.)
        const isCriticalError = err?.response?.status >= 500 || !err?.response?.status;
        if (isCriticalError) {
          console.error("Critical error loading session details:", err);
          setSessionStats(null);
          setSessionDetail(null);
          setBestJurors(null);
        } else {
          // For non-critical errors (like 404), keep basic session info
          const session: ApiSessionById = {
            id: selectedSession.id,
            name: selectedSession.name,
            description: selectedSession.description || "",
            status: selectedSession.status || "",
            startTime: selectedSession.startTime || "",
            endTime: selectedSession.endTime || null,
            createdAt: selectedSession.createdAt || "",
            updatedAt: selectedSession.updatedAt || "",
            summary: selectedSession.summary,
            caseId: "",
            case: {
              caseNumber: "",
              caseName: "",
              caseType: "",
            },
            assignments: [],
            responses: [],
            scores: [],
          } as any;
          setSessionDetail(session);
        }
      }
    }
  };
  fetchDetail();
}, [selectedSession?.id]);

  // assessment fetching removed as it's unused in UI

  return {
    cases,
    selectedCase,
    setSelectedCase,
    sessions,
    selectedSession,
    setSelectedSession,
    sessionDetail,
    sessionStats,
    bestJurors,
    fetchBestJurors: async (minScore: number, maxScore?: number) => {
      if (!selectedSession?.id) return;
      try {
        // Request a larger limit so we can filter down on client for mid/low buckets
        const desiredLimit = typeof maxScore === "number" ? 100 : 30;
        const res = await getBestJurorsApi(
          selectedSession.id,
          minScore,
          desiredLimit
        );
        let list = Array.isArray(res?.bestJurors) ? res.bestJurors : [];
        if (typeof maxScore === "number") {
          list = list.filter(
            (j: any) => Number(j?.overallScore ?? 0) <= maxScore
          );
        }
        setBestJurors(list);
      } catch {
        setBestJurors([]);
      }
    },
    selectedResponseId,
    setSelectedResponseId,
    isLoading,
    error,
  };
};
