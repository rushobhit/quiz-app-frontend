import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const score = Number(location.state?.score);
  const total = Number(location.state?.total);
  const title = location.state?.title?.trim() || "Quiz Result";
  const quizId = location.state?.quizId ?? 1;
  const answeredCount = Number(location.state?.answeredCount ?? total);
  const unansweredCount = Number(location.state?.unansweredCount ?? 0);

  const hasValidResult =
    Number.isFinite(score) &&
    Number.isFinite(total) &&
    total > 0 &&
    score >= 0 &&
    score <= total;

  useEffect(() => {
    if (!hasValidResult) {
      navigate("/", { replace: true });
    }
  }, [hasValidResult, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  if (!hasValidResult) {
    return null;
  }

  return (
    <div className="result-page">
      <ResultCard
        title={title}
        score={score}
        total={total}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        onGoHome={() => navigate("/", { replace: true })}
        onRetry={() =>
          navigate(`/quiz/${quizId}`, {
            state: {
              title,
              numQ: total,
            },
          })
        }
        onLogout={handleLogout}
      />
    </div>
  );
}