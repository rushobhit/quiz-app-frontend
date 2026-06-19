
import QuizCard from "./QuizCard";

export default function QuestionPanel({
  currentQuestion,
  currentQuestionIndex = 0,
  totalQuestions = 0,
  selectedOption,
  onSelectOption,
  onSaveAndNext,
  onClearResponse,
  onMarkForReview,
  onSaveAndMarkNext,
  onPrevious,
  onNext,
  onSubmit,
}) {
  if (!currentQuestion) {
    return (
      <section className="question-panel">
        <div className="quiz-card__empty">Question data not available.</div>
      </section>
    );
  }

  const questionNumber = currentQuestion.questionNumber ?? currentQuestionIndex + 1;
  const questionType = currentQuestion.type ?? "Single Correct";
  const subject = currentQuestion.subject ?? "General";
  const status = currentQuestion.statusLabel ?? "Ready to answer";

  return (
    <section className="question-panel">
      <div className="question-panel__topbar">
        <div>
          <div className="question-panel__meta">
            <span className="question-panel__meta-chip">Question {questionNumber} / {totalQuestions}</span>
            <span className="question-panel__meta-chip">{questionType}</span>
            <span className="question-panel__meta-chip">{subject}</span>
          </div>
        </div>
      </div>

      <div className="question-panel__shell">
        <div className="question-panel__header">
          <span className="question-panel__badge">Question No {questionNumber}</span>
          <span className="question-panel__status">{status}</span>
        </div>

        <QuizCard
          questionNumber={questionNumber}
          questionText={currentQuestion.questionText ?? currentQuestion.text ?? ""}
          options={currentQuestion.options ?? []}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
        />
      </div>

      <div className="question-panel__actions">
        <button type="button" className="secondary-btn" onClick={onPrevious}>
          Previous
        </button>

        <button type="button" className="ghost-btn" onClick={onClearResponse}>
          Clear Response
        </button>

        <button type="button" className="secondary-btn" onClick={onMarkForReview}>
          Mark for Review
        </button>

        <button type="button" className="secondary-btn" onClick={onSaveAndMarkNext}>
          Save & Mark for Review
        </button>

        <button type="button" className="primary-btn" onClick={onSaveAndNext}>
          Save & Next
        </button>

        <button type="button" className="secondary-btn" onClick={onNext}>
          Next
        </button>

        <button type="button" className="primary-btn question-panel__submit" onClick={onSubmit}>
          Submit Test
        </button>
      </div>
    </section>
  );
}