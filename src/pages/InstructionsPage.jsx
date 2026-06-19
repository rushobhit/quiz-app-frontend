import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage, getQuizMeta } from "../quizApi";

const TOTAL_TIME_SECONDS = 10 * 60;
const START_DELAY_SECONDS = 2 * 60;

export default function InstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const subject = location.state?.subject?.trim() || "Java";
  const difficulty = location.state?.difficulty?.trim().toUpperCase() || "EASY";

  const [startDelay, setStartDelay] = useState(START_DELAY_SECONDS);
  const [totalQuestions, setTotalQuestions] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  useEffect(() => {
    if (startDelay <= 0) return;

    const timerId = setInterval(() => {
      setStartDelay((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [startDelay]);

  useEffect(() => {
    let ignore = false;

    const fetchQuizMeta = async () => {
      try {
        setMetaLoading(true);
        setMetaError("");

		const res = await getQuizMeta(subject, difficulty);
		const data = res?.data?.data || {};

		setTotalQuestions(
		  Number(
		    data?.totalQuestions ??
		    data?.count ??
		    data?.questionCount ??
		    0
		  )
		);
      } catch (err) {
        if (!ignore) {
          setMetaError(getApiErrorMessage(err, "Failed to load quiz details."));
          setTotalQuestions(null);
        }
      } finally {
        if (!ignore) {
          setMetaLoading(false);
        }
      }
    };

    if (subject && difficulty) {
      fetchQuizMeta();
    }

    return () => {
      ignore = true;
    };
  }, [subject, difficulty]);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const quickStats = useMemo(
    () => [
      { label: "Subject", value: subject },
      { label: "Difficulty", value: difficulty },
      {
        label: "Questions",
        value: metaLoading ? "Loading..." : totalQuestions ?? "Unavailable",
      },
      { label: "Time", value: formatTime(TOTAL_TIME_SECONDS) },
    ],
    [subject, difficulty, totalQuestions, metaLoading]
  );

  const canStartQuiz = startDelay === 0;

  const handleStartQuiz = () => {
    if (!canStartQuiz) return;

    navigate("/quiz/new", {
      state: {
        subject,
        difficulty,
        totalQuestions,
      },
    });
  };

  return (
    <div className="instructions-page">
      <div className="instructions-page__container">
        <section className="instructions-top">
          <div className="instructions-top__content">
            <span className="instructions-badge">Quiz Guide</span>
            <h1>Check the screen before you start</h1>
            <p>
              This page shows where everything appears on the quiz screen, what
              each action button does, and how time and navigation work.
            </p>
          </div>

          <div className="instructions-stats">
            {quickStats.map((item) => (
              <div key={item.label} className="instructions-stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="instructions-grid">
          <div className="instructions-main">
            <div className="instructions-card">
              <h2>Screen map</h2>

              <div className="instructions-screen">
                <div className="instructions-screen__main">
                  <div className="instructions-mini instructions-mini--top">
                    <span>1</span>
                    <div>
                      <strong>Top bar</strong>
                      <p>Shows candidate name, exam name, and timer.</p>
                    </div>
                  </div>

                  <div className="instructions-mini instructions-mini--center">
                    <span>2</span>
                    <div>
                      <strong>Question area</strong>
                      <p>Displays the current question and answer options.</p>
                    </div>
                  </div>

                  <div className="instructions-mini instructions-mini--bottom">
                    <span>3</span>
                    <div>
                      <strong>Bottom actions</strong>
                      <p>Includes Save & Next, Clear, Back, Next, and Submit.</p>
                    </div>
                  </div>
                </div>

                <div className="instructions-screen__side">
                  <div className="instructions-mini instructions-mini--side">
                    <span>4</span>
                    <div>
                      <strong>Right panel</strong>
                      <p>Lets you jump directly to any question.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="instructions-card">
              <h2>Action buttons</h2>

              <div className="instructions-actions-grid">
                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--green" disabled>
                    Save & Next
                  </button>
                  <p>Saves the selected answer and opens the next question.</p>
                </div>

                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--blue" disabled>
                    Mark For Review & Next
                  </button>
                  <p>Marks the question for review and moves forward.</p>
                </div>

                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--light" disabled>
                    Clear
                  </button>
                  <p>Removes the selected answer from the current question.</p>
                </div>

                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--nav" disabled>
                    &lt;&lt;BACK
                  </button>
                  <p>Returns to the previous question.</p>
                </div>

                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--nav" disabled>
                    NEXT&gt;&gt;
                  </button>
                  <p>Opens the next question.</p>
                </div>

                <div className="instructions-action-card">
                  <button type="button" className="exam-btn exam-btn--submit" disabled>
                    Submit
                  </button>
                  <p>Submits the full quiz and ends the attempt.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="instructions-side">
            <div className="instructions-card">
              <h2>Palette guide</h2>

              <div className="instructions-palette">
                <div className="instructions-palette__item">
                  <span className="instructions-palette__badge instructions-palette__badge--not-visited">
                    1
                  </span>
                  <p>Not visited.</p>
                </div>

                <div className="instructions-palette__item">
                  <span className="instructions-palette__badge instructions-palette__badge--not-answered">
                    2
                  </span>
                  <p>Visited but not answered.</p>
                </div>

                <div className="instructions-palette__item">
                  <span className="instructions-palette__badge instructions-palette__badge--answered">
                    3
                  </span>
                  <p>Answered.</p>
                </div>

                <div className="instructions-palette__item">
                  <span className="instructions-palette__badge instructions-palette__badge--marked">
                    4
                  </span>
                  <p>Marked for review.</p>
                </div>

                <div className="instructions-palette__item">
                  <span className="instructions-palette__badge instructions-palette__badge--dual">
                    5
                  </span>
                  <p>Answered and marked for review.</p>
                </div>
              </div>
            </div>

            <div className="instructions-card">
              <h2>Before starting</h2>
              <ul className="instructions-list">
                <li>The timer starts on the quiz page.</li>
                <li>You can move between questions from the right panel.</li>
                <li>Unanswered questions may be counted as incorrect.</li>
                <li>The quiz may auto-submit when time ends.</li>
              </ul>

              {metaError ? <div className="error-box">{metaError}</div> : null}
            </div>

            <div className="instructions-start-card">
              {startDelay > 0 ? (
                <div className="instructions-start-timer">
                  You can start the test in {formatTime(startDelay)}
                </div>
              ) : (
                <div className="instructions-start-ready">
                  You can start the quiz now
                </div>
              )}

              <div className="instructions-start-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleStartQuiz}
                  disabled={!canStartQuiz}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}