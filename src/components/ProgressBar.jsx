export default function ProgressBar({
  current = 1,
  total = 10,
  label = "Quiz progress",
}) {
  // Guard against invalid totals
  const safeTotal = total > 0 ? total : 1;

  // Clamp current between 0 and safeTotal
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);

  // Calculate percentage (0–100)
  const rawPercent = (safeCurrent / safeTotal) * 100;
  const percent = Math.min(Math.max(Math.round(rawPercent), 0), 100);

  const progressText = `Question ${safeCurrent} of ${safeTotal}, ${percent}% complete`;

  return (
    <div className="quiz-progress">
      <div className="quiz-progress__top">
        <span className="quiz-progress__label">{label}</span>
        <span className="quiz-progress__meta">
          {safeCurrent} / {safeTotal}
        </span>
      </div>

      <div
        className="quiz-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-valuetext={progressText}
      >
        <div
          className="quiz-progress__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}