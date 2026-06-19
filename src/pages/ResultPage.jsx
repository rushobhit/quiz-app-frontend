import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard";
import { logout } from "../quizApi";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedRole = localStorage.getItem("role") || "";

  const score = Number(location.state?.score);
  const totalQuestions = Number(location.state?.total);
  const quizTitle = location.state?.title?.trim() || "Quiz Result";
  const quizId = location.state?.quizId ?? 1;
  const attemptedQuestions = Number(
    location.state?.answeredCount ?? totalQuestions
  );
  const unansweredCount = Number(location.state?.unansweredCount ?? 0);
  const timeTaken = location.state?.timeTaken || "00:00";

  const studentFullName =
    location.state?.studentFullName ||
    storedUser?.fullName ||
    storedUser?.name ||
    "Unknown Student";

  const email =
    location.state?.email ||
    storedUser?.email ||
    "Unknown Email";

  const hasValidResult =
    Number.isFinite(score) &&
    Number.isFinite(totalQuestions) &&
    totalQuestions > 0 &&
    score >= 0 &&
    score <= totalQuestions;

  const percentageScore = useMemo(() => {
    if (!hasValidResult) return 0;
    return Number(((score / totalQuestions) * 100).toFixed(2));
  }, [hasValidResult, score, totalQuestions]);

  const remark = useMemo(() => {
    if (percentageScore >= 90) return "Excellent performance";
    if (percentageScore >= 75) return "Very good performance";
    if (percentageScore >= 50) return "Good effort, keep improving";
    return "Needs more practice";
  }, [percentageScore]);

  useEffect(() => {
    if (!hasValidResult) {
      navigate("/", { replace: true });
    }
  }, [hasValidResult, navigate]);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout({
        fullName: studentFullName,
        email,
        role: storedRole,
        eventType: "LOGOUT",
        source: "RESULT_PAGE",
      });
    } catch (err) {
      console.error("Logout logging/email failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
    }
  };

  if (!hasValidResult) {
    return null;
  }

  return (
    <div className="result-page">
      <ResultCard
        id={quizId}
        studentFullName={studentFullName}
        email={email}
        quizTitle={quizTitle}
        score={score}
        percentageScore={percentageScore}
        attemptedQuestions={attemptedQuestions}
        totalQuestions={totalQuestions}
        unansweredCount={unansweredCount}
        timeTaken={timeTaken}
        remark={remark}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
    </div>
  );
}