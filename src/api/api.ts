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
