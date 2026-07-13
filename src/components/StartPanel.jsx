import { useTheme } from "../context/ThemeContext";

const SUBJECT_OPTIONS = ["Java", "Python", "CPP", "JavaScript", "DBMS", "SQL", "OS", "CN", "Teaching Aptitude", "Research Aptitude"];
const DIFFICULTY_OPTIONS = ["EASY", "MODERATE", "HARD"];

export default function StartPanel({
  subject = "",
  difficulty = "",
  loading = false,
  error = "",
  onSubjectChange,
  onDifficultyChange,
  onSubmit,
}) {
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  const handleSubjectChange = (e) => {
    if (typeof onSubjectChange === "function") {
      onSubjectChange(e.target.value);
    }
  };

  const handleDifficultyChange = (e) => {
    if (typeof onDifficultyChange === "function") {
      onDifficultyChange(e.target.value);
    }
  };

  return (
    <section className="start-panel">
      <form
        className={`start-card start-card--${theme}`}
        onSubmit={handleSubmit}
      >
        <div className="card-head">
          <span className="panel-badge">Quiz Setup</span>
          <h2>Start a new quiz</h2>
          <p>Select a subject and difficulty to begin your quiz.</p>
        </div>

        <label className="field" htmlFor="quiz-subject">
          <span>Subject</span>
          <select
            id="quiz-subject"
            value={subject}
            onChange={handleSubjectChange}
          >
            <option value="">Select a subject</option>
            {SUBJECT_OPTIONS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor="quiz-difficulty">
          <span>Difficulty</span>
          <select
            id="quiz-difficulty"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value="">Select difficulty</option>
            {DIFFICULTY_OPTIONS.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div
            className="error-box"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <button
          className="primary-btn start-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Start Quiz"}
        </button>
      </form>
    </section>
  );
}