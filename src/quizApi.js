import axios from "axios";
import { clearAuth } from "./utils/authStorage";

// For LOCAL and PRODUCTION environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://quiz-app-backend-sus3.onrender.com";
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----- REQUEST INTERCEPTOR: add token safely -----
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage access issues in restricted environments
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ----- RESPONSE INTERCEPTOR: handle 401 safely -----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

	if (status === 401) {
	  clearAuth();
	  window.location.hash = "#/login";
	}

    return Promise.reject(error);
  }
);

// Common helper for error messages
export const getApiErrorMessage = (err, fallbackMessage) =>
  err?.response?.data?.message || fallbackMessage;

// ================== AUTH HELPERS ==================

export const login = (email, password, role) =>
  api.post("/auth/login", { email, password, role });

export const logout = (payload) =>
  api.post("/auth/logout", payload);

export const createLoginLog = (payload) =>
  api.post("/auth/login-log", payload);

export const sendSignupOtp = (email) =>
  api.post("/auth/send-student-signup-otp", { email });

export const verifySignupOtp = (email, otp) =>
  api.post("/auth/verify-student-signup-otp", { email, otp });

export const createStudentAccount = (data) =>
  api.post("/auth/student/signup-details", data);


// ================== QUIZ HELPERS ==================

export const getQuizMeta = (subject, difficulty) =>
  api.get("/quizzes/meta", {
    params: { subject, difficulty },
  });
  
export const createQuiz = (subject, difficulty) =>
  api.post("/quizzes", { subject, difficulty });

export const getQuizQuestions = (id) =>
  api.get(`/quizzes/${id}/questions`);

export const submitQuiz = (id, submissionPayload) =>
  api.post(`/quizzes/${id}/submit`, submissionPayload);

// ================== ADMIN HELPERS ==================

export const exportResultsCsv = () =>
  api.get(
    "/api/admin/student-results/export",
    {
      responseType: "blob",
    }
  );
  
  export const exportResultsExcel = () =>
    api.get(
      "/api/admin/student-results/export-excel",
      {
        responseType: "blob",
      }
    );

export const updateStudentResult = (id, payload) =>
  api.put(`/api/admin/student-results/${id}`, payload);

export const getAdminQuestions = (params = {}) =>
  api.get("/api/admin/questions", { params });

export const createAdminQuestion = (questionPayload) =>
  api.post("/api/admin/questions", questionPayload);

export const updateAdminQuestion = (id, questionPayload) =>
  api.put(`/api/admin/questions/${id}`, questionPayload);

export const deleteAdminQuestion = (id) =>
  api.delete(`/api/admin/questions/${id}`);

export const getStudentResults = (params = {}) =>
  api.get("/api/admin/student-results", { params });

export const deleteStudentResult = (id) =>
  api.delete(`/api/admin/student-results/${id}`);

export const getAdminLogs = (params = {}) =>
  api.get("/api/admin/logs", { params });

export const getAllStudents = (params = {}) =>
  api.get("/api/admin/students", { params });

export const updateStudent = (id, payload) =>
  api.put(`/api/admin/students/${id}`, payload);

export const deleteStudent = (id) =>
  api.delete(`/api/admin/students/${id}`);

// Recovery helpers
export const forgotPassword = (identifierType, identifier, dob) =>
  api.post("/auth/forgot-password", { identifierType, identifier, dob });

export const forgotUsername = (email, dob) =>
  api.post("/auth/forgot-username", { email, dob });

export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword });

// Social logins
export const googleLogin = (code, redirectUri) =>
  api.post("/auth/google-login", { code, redirectUri });

export const githubLogin = (code) =>
  api.post("/auth/github-login", { code });

export const socialLoginMock = (email, name, provider) =>
  api.post("/auth/social-login-mock", { email, name, provider });

export default api;
