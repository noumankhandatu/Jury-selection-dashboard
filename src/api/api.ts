/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseUrl from "../utils/config/baseUrl";
import { CaseData, CreateJurorsPayload } from "./types";

export const createCaseApi = async (caseData: CaseData) => {
  try {
    const response = await BaseUrl.post("/cases/create", caseData);
    return response.data;
  } catch (error: any) {
    console.error("Error creating case:", error);
    throw error;
  }
};

export const createJurorsApi = async (payload: CreateJurorsPayload) => {
  try {
    const response = await BaseUrl.post("/jurors/create", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating jurors:", error);
    throw error;
  }
};

export const getCasesApi = async () => {
  try {
    const response = await BaseUrl.get("/cases/list/");
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating jurors:", error);
    throw error;
  }
};
export const getJurorsApi = async () => {
  try {
    const response = await BaseUrl.get("/jurors/list/");
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating jurors:", error);
    throw error;
  }
};

// Create a new question for a case
export const createQuestionApi = async (
  caseId: string,
  payload: {
    question: string;
    questionType: string;
    options?: string[];
    isRequired?: boolean;
    order?: number;
  }
) => {
  try {
    const response = await BaseUrl.post(`/questions/cases/${caseId}/questions`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating question:", error);
    throw error;
  }
};

// Get all questions for a case
export const getCaseQuestionsApi = async (caseId: string) => {
  try {
    const response = await BaseUrl.get(`/questions/cases/${caseId}/questions`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching case questions:", error);
    throw error;
  }
};

// Get a single question by ID
export const getQuestionApi = async (questionId: string) => {
  try {
    const response = await BaseUrl.get(`/questions/${questionId}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

// Update a question by ID
export const updateQuestionApi = async (
  questionId: string,
  payload: {
    question?: string;
    questionType?: string;
    options?: string[];
    isRequired?: boolean;
    order?: number;
  }
) => {
  try {
    const response = await BaseUrl.put(`/questions/questions/${questionId}`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error updating question:", error);
    throw error;
  }
};

// Delete a question by ID
export const deleteQuestionApi = async (questionId: string) => {
  try {
    const response = await BaseUrl.delete(`/questions/questions/${questionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

// Reorder questions for a case
export const reorderQuestionsApi = async (caseId: string, payload: { questionIds: string[] }) => {
  try {
    const response = await BaseUrl.put(`/questions/cases/${caseId}/questions/reorder`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error reordering questions:", error);
    throw error;
  }
};

// Create a new live session
export const createSessionApi = async (payload: {
  name: string;
  description: string;
  caseId: string;
  startTime: string;
  endTime: string;
}) => {
  try {
    const response = await BaseUrl.post("/sessions", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating session:", error);
    throw error;
  }
};

// Assign one or more questions to one or more jurors for a session
export const assignQuestionsToJurorsApi = async (payload: {
  sessionId: string;
  assignments: Array<{
    questionId: string;
    jurorIds: string[];
    dueAt?: string;
  }>;
}) => {
  try {
    const response = await BaseUrl.post("/assignments/assign", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error assigning questions:", error);
    throw error;
  }
};

// Save a juror response
export const saveJurorResponseApi = async (payload: {
  sessionId: string;
  questionId: string;
  jurorId: string;
  response: string;
  responseType: "TEXT" | "YES_NO" | "RATING";
}) => {
  try {
    const response = await BaseUrl.post("/responses/save", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error saving juror response:", error);
    throw error;
  }
};

// Assess a saved response with AI
export const assessResponseApi = async (responseId: string) => {
  try {
    const response = await BaseUrl.post(`/responses/${responseId}/assess`);
    return response.data;
  } catch (error: any) {
    console.error("Error assessing response:", error);
    throw error;
  }
};

// Get scores for all jurors in a session
export const getSessionScoresApi = async (sessionId: string) => {
  try {
    const response = await BaseUrl.get(`/scores/session/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching session scores:", error);
    throw error;
  }
};

// Get detailed juror analysis for a juror in a session
export const getJurorDetailsAnalysisApi = async (sessionId: string, jurorId: string) => {
  try {
    const response = await BaseUrl.get(`/scores/session/${sessionId}/juror/${jurorId}/details`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching juror details analysis:", error);
    throw error;
  }
};

// Get sessions for a given case
export const getSessionsByCaseApi = async (caseId: string) => {
  try {
    const response = await BaseUrl.get(`/sessions/case/${caseId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching sessions by case:", error);
    throw error;
  }
};

// Get a single session with details
export const getSessionByIdApi = async (sessionId: string) => {
  try {
    const response = await BaseUrl.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching session by id:", error);
    throw error;
  }
};

// Get session statistics (overview + top jurors)
export const getSessionStatisticsApi = async (sessionId: string) => {
  try {
    const response = await BaseUrl.get(`/scores/session/${sessionId}/statistics`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching session statistics:", error);
    throw error;
  }
};

// Get detailed assessment for a specific response
export const getResponseAssessmentApi = async (responseId: string) => {
  try {
    const response = await BaseUrl.get(`/responses/${responseId}/assessment`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching response assessment:", error);
    throw error;
  }
};
