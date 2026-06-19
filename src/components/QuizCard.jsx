import { useId, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

export default function QuizCard({
  question,
  options = [],
  selectedAnswer = null,
  onSelect,
}) {
  const { theme } = useTheme();
  const optionRefs = useRef([]);
  const titleId = useId();

  const safeQuestion =
    typeof question === "string" && question.trim()
      ? question.trim()
      : "Question not available.";

  const safeOptions = useMemo(() => {
    return options
      .map((option) => (typeof option === "string" ? option.trim() : option))
      .filter((option) => option != null && String(option).trim() !== "");
  }, [options]);

  const selectedIndex =
    Number.isInteger(selectedAnswer) && selectedAnswer > 0
      ? selectedAnswer - 1
      : -1;

  const focusOption = (index) => {
    optionRefs.current[index]?.focus();
  };

  const selectOption = (index) => {
    if (typeof onSelect === "function") {
      onSelect(index + 1);
    }
  };

  const moveToOption = (index) => {
    if (index < 0 || index >= safeOptions.length) return;
    selectOption(index);
    focusOption(index);
  };

  const getNextIndex = (currentIndex) => {
    return currentIndex === safeOptions.length - 1 ? 0 : currentIndex + 1;
  };

  const getPreviousIndex = (currentIndex) => {
    return currentIndex === 0 ? safeOptions.length - 1 : currentIndex - 1;
  };

  const handleKeyDown = (event, index) => {
    if (!safeOptions.length) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveToOption(getNextIndex(index));
        break;

      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveToOption(getPreviousIndex(index));
        break;

      case "Home":
        event.preventDefault();
        moveToOption(0);
        break;

      case "End":
        event.preventDefault();
        moveToOption(safeOptions.length - 1);
        break;

      case " ":
      case "Enter":
        event.preventDefault();
        selectOption(index);
        break;

      default:
        break;
    }
  };

  if (!safeOptions.length) {
    return (
      <div className={`quiz-card quiz-card--${theme}`}>
        <div className="quiz-card__header">
          <h2 id={titleId} className="quiz-card__title">
            {safeQuestion}
          </h2>
        </div>

        <div className="quiz-card__empty" role="status" aria-live="polite">
          No options available for this question.
        </div>
      </div>
    );
  }

  return (
    <div className={`quiz-card quiz-card--${theme}`}>
      <div className="quiz-card__header">
        <h2 id={titleId} className="quiz-card__title">
          {safeQuestion}
        </h2>
      </div>

      <div
        className="quiz-card__options quiz-card__options--stack"
        role="radiogroup"
        aria-labelledby={titleId}
        aria-label="Answer options"
      >
        {safeOptions.map((option, index) => {
          const isSelected = selectedIndex === index;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={`quiz-option-${index}`}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${letter}: ${option}`}
              tabIndex={
                isSelected || (selectedIndex === -1 && index === 0) ? 0 : -1
              }
              className={`quiz-option ${
                isSelected ? "quiz-option--selected" : ""
              }`}
              onClick={() => selectOption(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="quiz-option__index" aria-hidden="true">
                {letter}
              </span>

              <span className="quiz-option__content">
                <span className="quiz-option__text">{option}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}