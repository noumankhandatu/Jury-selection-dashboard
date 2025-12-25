import axios from "axios";
import { toast } from "sonner";
import { isInsufficientTokensError, extractTokenErrorData, emitTokenError } from "../tokenErrorEvents";

const BASEURL = import.meta.env.VITE_BASEURL;

const BaseUrl = axios.create({
  baseURL: BASEURL,
    headers: {
    "ngrok-skip-browser-warning": "true", // Remove in production
  },
});

// Request Interceptor
BaseUrl.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
BaseUrl.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API Error Response:", error.response);

      // Check for insufficient tokens error
      if (isInsufficientTokensError(error)) {
        const tokenErrorData = extractTokenErrorData(error);
        if (tokenErrorData) {
          console.warn("⚠️ Insufficient AI tokens - triggering buy tokens modal");
          emitTokenError(tokenErrorData);
        }
      }

      if (error.response.status === 401) {
        console.warn("🚫 Unauthorized: Token may be expired or invalid.");
        handleLogout();
      }
    } else {
      console.error("❌ Network/Error without response:", error);
    }

    return Promise.reject(error);
  }
);

// Logout Function
export const handleLogout = () => {
  try {
    localStorage.clear();
    toast.success("Logged out successfully");
    window.location.reload();
  } catch (error) {
    console.error("Error logging out:", error);
    toast.error("An unexpected error occurred while logging out");
  }
};

export default BaseUrl;
