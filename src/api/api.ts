/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseUrl from "../utils/config/baseUrl";
import {
  CaseData,
  CreateJurorsPayload,
  DashboardAnalyticsResponse,
} from "./types";

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

// Get jurors for a specific case
export const getCaseJurorsApi = async (caseId: string) => {
  try {
    const response = await BaseUrl.get(`/cases/${caseId}/jurors`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching case jurors:", error);
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
    const response = await BaseUrl.post(
      `/questions/cases/${caseId}/questions`,
      payload
    );
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
    const response = await BaseUrl.put(
      `/questions/questions/${questionId}`,
      payload
    );
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
export const reorderQuestionsApi = async (
  caseId: string,
  payload: { questionIds: string[] }
) => {
  try {
    const response = await BaseUrl.put(
      `/questions/cases/${caseId}/questions/reorder`,
      payload
    );
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
export const getJurorDetailsAnalysisApi = async (
  sessionId: string,
  jurorId: string
) => {
  try {
    const response = await BaseUrl.get(
      `/scores/session/${sessionId}/juror/${jurorId}/details`
    );
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
    const response = await BaseUrl.get(
      `/scores/session/${sessionId}/statistics`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching session statistics:", error);
    throw error;
  }
};

// Get best jurors by minimum score threshold for a session
export const getBestJurorsApi = async (
  sessionId: string,
  minScore: number,
  limit?: number
) => {
  try {
    const response = await BaseUrl.get(
      `/scores/session/${sessionId}/best-jurors`,
      {
        params: { minScore, ...(typeof limit === "number" ? { limit } : {}) },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching best jurors:", error);
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

// Get session status
export const getSessionStatusApi = async (sessionId: string) => {
  try {
    const response = await BaseUrl.get(`/sessions/${sessionId}/status`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching session status:", error);
    throw error;
  }
};

// Update session status
export const updateSessionStatusApi = async (
  sessionId: string,
  status: string,
  startTime?: string,
  endTime?: string
) => {
  try {
    const payload: any = { status };

    // Add startTime and endTime if provided
    if (startTime) {
      payload.startTime = startTime;
    }
    if (endTime) {
      payload.endTime = endTime;
    }

    const response = await BaseUrl.put(
      `/sessions/${sessionId}/status`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating session status:", error);
    throw error;
  }
};

// Get dashboard analytics
export const getDashboardAnalyticsApi =
  async (): Promise<DashboardAnalyticsResponse> => {
    try {
      const response = await BaseUrl.get("/dashboard/analytics");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching dashboard analytics:", error);
      throw error;
    }
  };

// ==================== ORGANIZATION APIs ====================

// Create organization
export const createOrganizationApi = async (payload: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    const response = await BaseUrl.post("/organizations", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating organization:", error);
    throw error;
  }
};

// Get user's organizations
export const getUserOrganizationsApi = async () => {
  try {
    const response = await BaseUrl.get("/organizations");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};

// Get organization details
export const getOrganizationApi = async (organizationId: string) => {
  try {
    const response = await BaseUrl.get(`/organizations/${organizationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    throw error;
  }
};

// Update organization
export const updateOrganizationApi = async (
  organizationId: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    timezone?: string;
  }
) => {
  try {
    const response = await BaseUrl.put(
      `/organizations/${organizationId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

// ==================== SUBSCRIPTION APIs ====================

// Create Stripe checkout session
export const createCheckoutSessionApi = async (payload: {
  plan: "STANDARD" | "BUSINESS";
  organizationId: string;
}) => {
  try {
    const response = await BaseUrl.post(
      "/subscriptions/create-checkout",
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

// Verify and activate subscription after Stripe checkout
export const verifySubscriptionApi = async (sessionId: string) => {
  try {
    const response = await BaseUrl.get("/subscriptions/verify", {
      params: { sessionId },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error verifying subscription:", error);
    throw error;
  }
};

// Get subscription details
export const getSubscriptionApi = async (organizationId: string) => {
  try {
    const response = await BaseUrl.get(`/subscriptions/${organizationId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

// Update subscription plan
export const updateSubscriptionPlanApi = async (
  organizationId: string,
  plan: "STANDARD" | "BUSINESS"
) => {
  try {
    const response = await BaseUrl.put(
      `/subscriptions/${organizationId}/plan`,
      { plan }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

// Get billing portal URL
export const getBillingPortalApi = async (organizationId: string) => {
  try {
    const response = await BaseUrl.post(
      `/subscriptions/${organizationId}/portal`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error getting billing portal:", error);
    throw error;
  }
};

// ==================== TEAM MANAGEMENT APIs ====================

// Invite team member
export const inviteTeamMemberApi = async (
  organizationId: string,
  payload: {
    email: string;
    role: "ADMIN" | "MEMBER";
  }
) => {
  try {
    const response = await BaseUrl.post(
      `/organizations/${organizationId}/invite`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Error inviting team member:", error);
    throw error;
  }
};

// Accept invitation
export const acceptInvitationApi = async (token: string) => {
  try {
    const response = await BaseUrl.post("/organizations/invitations/accept", {
      token,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};

// Get organization members
export const getOrganizationMembersApi = async (organizationId: string) => {
  try {
    const response = await BaseUrl.get(
      `/organizations/${organizationId}/members`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

// Remove team member
export const removeTeamMemberApi = async (
  organizationId: string,
  memberId: string
) => {
  try {
    const response = await BaseUrl.delete(
      `/organizations/${organizationId}/members/${memberId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error removing member:", error);
    throw error;
  }
};

// Update member role
export const updateMemberRoleApi = async (
  organizationId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER"
) => {
  try {
    const response = await BaseUrl.put(
      `/organizations/${organizationId}/members/${memberId}/role`,
      { role }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating member role:", error);
    throw error;
  }
};

// Get all invitations (pending, accepted, expired, revoked)
export const getAllInvitationsApi = async (organizationId: string) => {
  try {
    const response = await BaseUrl.get(
      `/organizations/${organizationId}/invitations/all`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all invitations:", error);
    throw error;
  }
};

// ==================== PASSWORD CHANGE WITH OTP APIs ====================

// Request password change OTP
export const requestPasswordChangeOTPApi = async () => {
  try {
    const response = await BaseUrl.post("/auth/request-password-otp");
    return response.data;
  } catch (error: any) {
    console.error("Error requesting password OTP:", error);
    throw error;
  }
};

// Verify password change OTP
export const verifyPasswordOTPApi = async (otp: string) => {
  try {
    const response = await BaseUrl.post("/auth/verify-password-otp", { otp });
    return response.data;
  } catch (error: any) {
    console.error("Error verifying password OTP:", error);
    throw error;
  }
};

// Change password with verified OTP
export const changePasswordApi = async (payload: {
  otp: string;
  newPassword: string;
  currentPassword?: string;
}) => {
  try {
    const response = await BaseUrl.post("/auth/change-password", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw error;
  }
};
