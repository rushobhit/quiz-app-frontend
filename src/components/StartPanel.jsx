import { useTheme } from "../context/ThemeContext";

export default function StartPanel({
  category = "",
  loading = false,
  error = "",
  onCategoryChange,
  onSubmit,
}) {
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  const handleCategoryChange = (e) => {
    if (typeof onCategoryChange === "function") {
      onCategoryChange(e.target.value);
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
          <p>Select a subject and begin your practice session.</p>
        </div>

        <label className="field" htmlFor="quiz-category">
          <span>Subject</span>
          <select
            id="quiz-category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">Select a subject</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
            <option value="CN">CN</option>
          </select>
        </label>

        <div
          className="error-box"
          role="alert"
          aria-live="assertive"
          style={{ display: error ? "block" : "none" }}
        >
          {error}
        </div>

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