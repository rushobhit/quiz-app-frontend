import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminQuestions,
  getStudentResults,
  getAdminLogs,
  getAllStudents,
} from "../quizApi";
import { clearAuth } from "../utils/authStorage";
import QuestionPanel from "../admin/QuestionPanel";
import ResultPanel from "../admin/ResultPanel";
import LogsPanel from "../admin/LogsPanel";
import StudentsPanel from "../admin/StudentsPanel";

const PAGE_SIZE = 20;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  
  

  const [activeTab, setActiveTab] = useState("questions");

  const [questions, setQuestions] = useState([]);
  const [questionsError, setQuestionsError] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");

  const [results, setResults] = useState([]);
  const [resultsError, setResultsError] = useState("");

  const [logs, setLogs] = useState([]);
  const [logsError, setLogsError] = useState("");

  const [students, setStudents] = useState([]);
  const [studentsError, setStudentsError] = useState("");

  const [loading, setLoading] = useState(false);
  
  const [questionsPage, setQuestionsPage] = useState(0);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(0);

  const [resultsPage, setResultsPage] = useState(0);
  const [resultsTotalPages, setResultsTotalPages] = useState(0);

  const [logsPage, setLogsPage] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);

  const [studentsPage, setStudentsPage] = useState(0);
  const [studentsTotalPages, setStudentsTotalPages] = useState(0);


  const loadAdminData = useCallback(async (search = questionSearch) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setQuestionsError("");
      setResultsError("");
      setLogsError("");
      setStudentsError("");

      const [qRes, rRes, lRes, sRes] = await Promise.allSettled([
		getAdminQuestions({
		  page: questionsPage,
		  size: PAGE_SIZE,
		  search
		}),
		getStudentResults({
		  page: resultsPage,
		  size: PAGE_SIZE,
		}),
		getAdminLogs({
		  page: logsPage,
		  size: PAGE_SIZE,
		}),
		getAllStudents({
		  page: studentsPage,
		  size: PAGE_SIZE,
		}),
      ]);

      if (qRes.status === "fulfilled") {
		const pageData = qRes.value.data.data;

		setQuestions(pageData.content || []);
		setQuestionsTotalPages(
		  pageData.totalPages || 0
		);
      } else {
		setQuestionsTotalPages(0);
		
        setQuestions([]);
        setQuestionsError(
          qRes.reason?.response?.data?.message || "Unable to load questions."
        );
      }

      if (rRes.status === "fulfilled") {
		const pageData = rRes.value.data.data;

		setResults(pageData.content || []);
		setResultsTotalPages(
		  pageData.totalPages || 0
		);
      } else {
		setResultsTotalPages(0);
        setResults([]);
        setResultsError(
          rRes.reason?.response?.data?.message || "Unable to load results."
        );
      }

      if (lRes.status === "fulfilled") {
		const pageData = lRes.value.data.data;

		setLogs(pageData.content || []);
		setLogsTotalPages(
		  pageData.totalPages || 0
		);
      } else {
		setLogsTotalPages(0);
        setLogs([]);
        setLogsError(
          lRes.reason?.response?.data?.message || "Unable to load logs."
        );
      }

	  if (sRes.status === "fulfilled") {
	    const pageData = sRes.value.data.data;

	    setStudents(pageData.content || []);
	    setStudentsTotalPages(
	      pageData.totalPages || 0
	    );
	  } else {
	setStudentsTotalPages(0);
        setStudents([]);
        setStudentsError(
          sRes.reason?.response?.data?.message || "Unable to load students."
        );
      }
    } finally {
      setLoading(false);
    }
	}, [
	  navigate,
	  questionsPage,
	  resultsPage,
	  logsPage,
	  studentsPage,
	  questionSearch,
	]);

	useEffect(() => {
	  const timeout = setTimeout(() => {
	    loadAdminData(questionSearch);
	  }, 800);

	  return () => clearTimeout(timeout);
	}, [questionSearch, loadAdminData]);

	const handleLogout = () => {
	  clearAuth();
	  navigate("/login", { replace: true });
	};

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage questions, students, results and activity logs.
          </p>
        </div>

        <div className="admin-header__actions">
          <button
            type="button"
            className={activeTab === "questions" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>

          <button
            type="button"
            className={activeTab === "results" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("results")}
          >
            Results
          </button>

          <button
            type="button"
            className={activeTab === "students" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>

          <button
            type="button"
            className={activeTab === "logs" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("logs")}
          >
            Logs
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
		<QuestionPanel
		  questions={questions}
		  setQuestions={setQuestions}
		  error={questionsError}
		  loading={loading}
		  onRefresh={loadAdminData}
		  page={questionsPage}
		  setPage={setQuestionsPage}
		  totalPages={questionsTotalPages}
		  search={questionSearch}
		  setSearch={setQuestionSearch}
		/>
      )}

      {activeTab === "results" && (
		<ResultPanel
		  results={results}
		  setResults={setResults}
		  error={resultsError}
		  loading={loading}
		  onRefresh={loadAdminData}
		  page={resultsPage}
		  setPage={setResultsPage}
		  totalPages={resultsTotalPages}
		/>
      )}

      {activeTab === "students" && (
		<StudentsPanel
		  students={students}
		  setStudents={setStudents}
		  error={studentsError}
		  loading={loading}
		  onRefresh={loadAdminData}
		  page={studentsPage}
		  setPage={setStudentsPage}
		  totalPages={studentsTotalPages}
		/>
      )}

      {activeTab === "logs" && (
		<LogsPanel
		  logs={logs}
		  error={logsError}
		  loading={loading}
		  page={logsPage}
		  setPage={setLogsPage}
		  totalPages={logsTotalPages}
		/>
      )}
    </div>
  );
}