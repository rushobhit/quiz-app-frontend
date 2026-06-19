import { useTheme } from "../context/ThemeContext";

export default function ResultCard({
  id,
  studentFullName = "Unknown Student",
  email = "Unknown Email",
  quizTitle = "Quiz Result",
  score = 0,
  percentageScore = 0,
  attemptedQuestions = 0,
  totalQuestions = 0,
  unansweredCount = 0,
  timeTaken = "00:00",
  remark = "",
  onLogout,
  loggingOut = false,
}) {
  const { theme } = useTheme();

  const safeTotal = totalQuestions > 0 ? totalQuestions : 1;
  const safeScore = Math.min(Math.max(score, 0), safeTotal);

  const safePercentage =
    typeof percentageScore === "number"
      ? Math.min(Math.max(percentageScore, 0), 100)
      : Math.round((safeScore / safeTotal) * 100);

  const displayRemark =
    remark ||
    (safePercentage >= 80
      ? "Excellent work!"
      : safePercentage >= 60
      ? "Good job!"
      : safePercentage >= 40
      ? "Nice effort!"
      : "Keep practicing!");

  return (
    <div className={`result-card result-card--${theme}`}>
      <span className="result-badge">Quiz Completed</span>

      <h1 className="result-title">{quizTitle}</h1>
      <p className="result-message">{displayRemark}</p>

      <div className="result-score-circle">
        <strong>{safePercentage}%</strong>
        <span>
          {safeScore} / {safeTotal} correct
        </span>
      </div>

      <div className="result-meta">
        <div className="result-meta__row">
          <span className="result-meta__label">Student: </span>
          <span className="result-meta__value">{studentFullName}</span>
        </div>

        <div className="result-meta__row">
          <span className="result-meta__label">Email: </span>
          <span className="result-meta__value">{email}</span>
        </div>

        <div className="result-meta__row">
          <span className="result-meta__label">Quiz ID: </span>
          <span className="result-meta__value">{id}</span>
        </div>

        <div className="result-meta__row">
          <span className="result-meta__label">Questions attempted: </span>
          <span className="result-meta__value">
            {attemptedQuestions} / {safeTotal}
          </span>
        </div>

        <div className="result-meta__row">
          <span className="result-meta__label">Unanswered: </span>
          <span className="result-meta__value">{unansweredCount}</span>
        </div>

        <div className="result-meta__row">
          <span className="result-meta__label">Time taken: </span>
          <span className="result-meta__value">{timeTaken}</span>
        </div>
      </div>

      <div className="result-actions">
        <button
          className="primary-btn"
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}