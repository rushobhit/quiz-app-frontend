import { useTheme } from "../context/ThemeContext";

export default function ResultCard({
  title = "Quiz Result",
  score = 0,
  total = 0,
  onGoHome,
  onLogout,
}) {
  const { theme } = useTheme();

  const safeTotal = total > 0 ? total : 1;
  const safeScore = Math.min(Math.max(score, 0), safeTotal);
  const percentage = Math.round((safeScore / safeTotal) * 100);

  const getMessage = () => {
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Nice effort!";
    return "Keep practicing!";
  };

  return (
    <div className={`result-card result-card--${theme}`}>
      <span className="result-badge">Quiz Completed</span>

      <h1 className="result-title">{title}</h1>
      <p className="result-message">{getMessage()}</p>

      <div className="result-score-circle">
        <strong>{percentage}%</strong>
        <span>
          {safeScore} / {safeTotal}
        </span>
      </div>

      <div className="result-actions">
        <button
          className="primary-btn"
          type="button"
          onClick={() => onGoHome?.()}
        >
          Go Home
        </button>

        <button
          className="secondary-btn"
          type="button"
          onClick={() => onLogout?.()}
        >
          Logout
        </button>
      </div>
    </div>
  );
}