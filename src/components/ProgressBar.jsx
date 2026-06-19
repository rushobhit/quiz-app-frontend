export default function ProgressBar({
  current = 0,          // answered questions
  total = 10,
  label = "Quiz progress",
}) {
  const safeTotal = total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);

  const rawPercent = (safeCurrent / safeTotal) * 100;
  const percent = Math.min(Math.max(Math.round(rawPercent), 0), 100);

  const unanswered = safeTotal - safeCurrent;
  const progressText = `Answered ${safeCurrent} of ${safeTotal} questions. ${unanswered} unanswered. ${percent}% complete.`;

  return (
    <div className="quiz-progress">
      
      <div
        className="quiz-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
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