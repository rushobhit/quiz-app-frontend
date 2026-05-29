import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../quizApi";

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState("");
  const [resultsError, setResultsError] = useState("");

  const loadAdminData = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setQuestionsError("");
      setResultsError("");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [questionsRes, resultsRes] = await Promise.allSettled([
        api.get("/admin/questions", config),
        api.get("/admin/student-results", config),
      ]);

      if (questionsRes.status === "fulfilled") {
        setQuestions(questionsRes.value.data || []);
      } else {
        setQuestions([]);
        setQuestionsError(
          questionsRes.reason?.response?.data?.message ||
            "Unable to load questions."
        );
      }

      if (resultsRes.status === "fulfilled") {
        setResults(resultsRes.value.data || []);
      } else {
        setResults([]);
        setResultsError(
          resultsRes.reason?.response?.data?.message ||
            "Unable to load student results."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question
      )
    );
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: (question.options || []).map((option, i) =>
                i === optionIndex ? value : option
              ),
            }
          : question
      )
    );
  };

  const handleSaveQuestion = async (question, index) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: question.category,
      };

      await api.put(
        `/admin/questions/${question.id ?? index}`,
        payload,
        config
      );
      alert("Question updated successfully.");
    } catch (err) {
      alert(
        err?.response?.data?.message || "Failed to update question."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage quiz questions and review student results.
          </p>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            className={activeTab === "questions" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("questions")}
          >
            Manage Questions
          </button>

          <button
            type="button"
            className={activeTab === "results" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("results")}
          >
            Student Results
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadAdminData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button type="button" className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {loading && <p>Loading admin data...</p>}

      {activeTab === "questions" && (
        <div className="admin-section">
          <h2>Edit Questions</h2>

          {questionsError && <div className="error-box">{questionsError}</div>}

          {!questionsError && questions.length === 0 && !loading && (
            <div className="admin-card">
              <p>No questions found.</p>
            </div>
          )}

          {questions.map((question, questionIndex) => (
            <div className="admin-card" key={question.id ?? questionIndex}>
              <label className="field">
                <span>Question</span>
                <input
                  type="text"
                  value={question.question || ""}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "question",
                      e.target.value
                    )
                  }
                />
              </label>

              {(question.options || []).map((option, optionIndex) => (
                <label className="field" key={optionIndex}>
                  <span>Option {optionIndex + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(
                        questionIndex,
                        optionIndex,
                        e.target.value
                      )
                    }
                  />
                </label>
              ))}

              <label className="field">
                <span>Correct Answer</span>
                <input
                  type="text"
                  value={question.correctAnswer || ""}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "correctAnswer",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Category</span>
                <input
                  type="text"
                  value={question.category || ""}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "category",
                      e.target.value
                    )
                  }
                />
              </label>

              <button
                className="primary-btn"
                type="button"
                onClick={() => handleSaveQuestion(question, questionIndex)}
              >
                Save Changes
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "results" && (
        <div className="admin-section">
          <h2>Student Results</h2>

          {resultsError && <div className="error-box">{resultsError}</div>}

          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Quiz Title</th>
                  <th>Score</th>
                  <th>Total</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {results.length > 0 ? (
                  results.map((row, index) => (
                    <tr key={row.id ?? index}>
                      <td>{row.studentName}</td>
                      <td>{row.email}</td>
                      <td>{row.quizTitle}</td>
                      <td>{row.score}</td>
                      <td>{row.total}</td>
                      <td>{row.percentage}%</td>
                      <td>{row.submittedAt}</td>
                    </tr>
                  ))
                ) : (
                  !resultsError && !loading && (
                    <tr>
                      <td colSpan="7">No student results found.</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}