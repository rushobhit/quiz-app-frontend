import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // enable only if you use cookies
});

// Attach token on every request
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

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      // full reload to clear React state
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const createQuiz = (category, numQ, title) =>
  api.post("/quiz/create", null, {
    params: { category, numQ, title },
  });

export const getQuizQuestions = (id) =>
  api.get(`/quiz/get/${id}`);

export const submitQuiz = (id, responses) =>
  api.post(`/quiz/submit/${id}`, responses);

export default api;