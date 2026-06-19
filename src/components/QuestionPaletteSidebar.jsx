const LEGEND_ITEMS = [
  {
    key: "not-visited",
    label: "Not Visited",
    className: "status-not-visited",
    countKey: "notVisited",
  },
  {
    key: "not-answered",
    label: "Visited & Not Answered",
    className: "status-not-answered",
    countKey: "notAnswered",
  },
  {
    key: "answered",
    label: "Answered",
    className: "status-answered",
    countKey: "answered",
  },
  {
    key: "marked-for-review",
    label: "Marked for Review",
    className: "status-marked-for-review",
    countKey: "marked",
  },
  {
    key: "answered-and-marked",
    label: "Answered & Marked for Review",
    className: "status-answered-and-marked double",
    countKey: "answeredAndMarked",
  },
];

const getQuestionStatusClass = (question) => {
  if (question?.isAnswered && question?.isMarked) {
    return "status-answered-and-marked double";
  }
  if (question?.isMarked) {
    return "status-marked-for-review";
  }
  if (question?.isAnswered) {
    return "status-answered";
  }
  if (question?.isVisited) {
    return "status-not-answered";
  }
  return "status-not-visited";
};

export default function QuestionPaletteSidebar({
  questions = [],
  currentQuestionIndex = 0,
  collapsed = false,
  onToggleCollapse,
  onJumpToQuestion,
  counts = {},
}) {
  if (collapsed) {
    return (
      <aside className="qp-sidebar collapsed">
        <button
          type="button"
          className="qp-sidebar-toggle"
          onClick={onToggleCollapse}
          aria-expanded="false"
          aria-label="Expand question palette"
        >
          Open
        </button>
      </aside>
    );
  }

  return (
    <aside className="qp-sidebar">
      <div className="qp-sidebar-inner">
        <div className="qp-legend-box">
          {LEGEND_ITEMS.map((item, index) => (
            <div key={item.key} className="qp-status-item">
              <span className={`qp-status-badge ${item.className}`}>
                {counts[item.countKey] ?? index + 1}
              </span>
              <span className="qp-status-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="qp-grid" role="list" aria-label="Question palette">
          {questions.map((question, index) => {
            const isActive = index === currentQuestionIndex;
            const statusClass = getQuestionStatusClass(question);

            return (
              <button
                key={question.id ?? index}
                type="button"
                className={`qp-grid-btn ${statusClass} ${
                  isActive ? "active" : ""
                }`}
                onClick={() => onJumpToQuestion?.(index)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}