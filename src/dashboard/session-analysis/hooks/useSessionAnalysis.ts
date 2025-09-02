/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getCasesApi, getSessionByIdApi, getSessionsByCaseApi, getResponseAssessmentApi } from "@/api/api";
import type { Case as UISelectCase } from "@/components/shared/select-case";
import type { SessionItem } from "@/components/shared/select-session";
import type { ApiCase, ApiSession, ApiSessionById } from "../types";

export const useSessionAnalysis = () => {
  const [cases, setCases] = useState<UISelectCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<UISelectCase | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [sessionDetail, setSessionDetail] = useState<ApiSessionById | null>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string>("");
  const [responseAssessment, setResponseAssessment] = useState<any | null>(null);
  const [isAssessLoading, setIsAssessLoading] = useState(false);
  const [assessError, setAssessError] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCasesApi();
        const transformed: UISelectCase[] = ((response || []) as ApiCase[]).map((c) => ({
          id: String(c.id),
          number: c.caseNumber,
          name: c.caseName,
          type: c.caseType,
          status: "Active",
          createdDate: c.createdAt,
          questions: c.caseQuestions,
        }));
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
        const list = Array.isArray(data?.sessions) ? (data.sessions as ApiSession[]) : [];
        const transformed: SessionItem[] = list.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          status: s.status,
          startTime: s.startTime,
          endTime: s.endTime,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
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
        setResponseAssessment(null);
        return;
      }
      try {
        const data = await getSessionByIdApi(selectedSession.id);
        setSessionDetail((data?.session as ApiSessionById) || null);
      } catch {
        setSessionDetail(null);
      }
    };
    fetchDetail();
  }, [selectedSession?.id]);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!selectedResponseId) {
        setResponseAssessment(null);
        return;
      }
      setIsAssessLoading(true);
      setAssessError("");
      try {
        const data = await getResponseAssessmentApi(selectedResponseId);
        setResponseAssessment(data?.assessment || null);
      } catch (e) {
        setAssessError(e instanceof Error ? e.message : "Failed to load assessment");
      } finally {
        setIsAssessLoading(false);
      }
    };
    fetchAssessment();
  }, [selectedResponseId]);

  return {
    cases,
    selectedCase,
    setSelectedCase,
    sessions,
    selectedSession,
    setSelectedSession,
    sessionDetail,
    selectedResponseId,
    setSelectedResponseId,
    responseAssessment,
    isAssessLoading,
    assessError,
    isLoading,
    error,
  };
};


