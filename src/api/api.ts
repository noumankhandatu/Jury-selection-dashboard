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
