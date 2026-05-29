import { useTheme } from "../context/ThemeContext";

export default function QuizCard({
  question,
  options = [],
  selectedAnswer = "",
  onSelect,
}) {
  const { theme } = useTheme();

  const handleSelect = (option) => {
    if (typeof onSelect === "function") {
      onSelect(option);
    }
  };

  return (
    <div className={`quiz-card quiz-card--${theme}`}>
      <div className="quiz-card__header">
        <span className="quiz-card__eyebrow">Question</span>
        <h2 className="quiz-card__title">{question}</h2>
      </div>

      <div
        className="quiz-card__options"
        role="radiogroup"
        aria-label="Answer options"
      >
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`quiz-option ${
                isSelected ? "quiz-option--selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              <span className="quiz-option__index">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="quiz-option__text">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}