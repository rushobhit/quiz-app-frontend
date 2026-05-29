import axios from "axios";

// Single place to change backend URL if needed
const API_BASE = "https://quizmicroservice.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // enable only if you use cookies (JWT in cookies etc.)
});

// Attach token on every request (for Authorization header)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.location.href = "/login"; // full reload to clear React state
    }

    return Promise.reject(error);
  }
);

// API functions
export const createQuiz = (category, numQ, title) =>
  api.post("/quiz/create", null, {
    params: { category, numQ, title },
  });

export const getQuizQuestions = (id) =>
  api.get(`/quiz/get/${id}`);

export const submitQuiz = (id, responses) =>
  api.post(`/quiz/submit/${id}`, responses);

export default api;