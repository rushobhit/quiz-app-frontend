import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import QuizCard from "../components/QuizCard";
import QuestionPaletteSidebar from "../components/QuestionPaletteSidebar";
import {
  createQuiz,
  getQuizQuestions,
  submitQuiz,
  getApiErrorMessage,
} from "../quizApi";

const TOTAL_TIME_SECONDS = 10 * 60;

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const subject = location.state?.subject?.trim() || "";
  const difficulty = location.state?.difficulty?.trim().toUpperCase() || "";

  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState([]);
  const [reviewMarkedQuestions, setReviewMarkedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAutoSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const normalizedRouteQuizId =
    id && id !== "new" && !Number.isNaN(Number(id)) ? Number(id) : null;

  const quizTitle = useMemo(() => {
    if (subject && difficulty) {
      return `${subject} - ${difficulty}`;
    }

    if (quizId) {
      return `Quiz ${quizId}`;
    }

    if (normalizedRouteQuizId) {
      return `Quiz ${normalizedRouteQuizId}`;
    }

    return "Quiz";
  }, [subject, difficulty, quizId, normalizedRouteQuizId]);

  const candidateName = useMemo(() => {
    const firstName = storedUser?.firstName?.trim?.() || "";
    const lastName = storedUser?.lastName?.trim?.() || "";
    const fullNameFromParts = [firstName, lastName].filter(Boolean).join(" ").trim();

    return (
      fullNameFromParts ||
      storedUser?.fullName ||
      storedUser?.name ||
      storedUser?.username ||
      storedUser?.email ||
      "Student"
    );
  }, [storedUser]);

  const paletteQuestions = useMemo(() => {
    return questions.map((question, idx) => ({
      ...question,
      isVisited: !!visitedQuestions[idx],
      isAnswered: selectedAnswers[idx] != null,
      isMarked: !!reviewMarkedQuestions[idx],
    }));
  }, [questions, visitedQuestions, selectedAnswers, reviewMarkedQuestions]);

  const currentQuestion = questions[questionIndex] ?? null;
  const currentAnswer = selectedAnswers[questionIndex] ?? null;

  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion =
    questions.length > 0 && questionIndex === questions.length - 1;

  const answeredCount = useMemo(
    () => selectedAnswers.filter((value) => value != null).length,
    [selectedAnswers]
  );

  const reviewCount = useMemo(
    () =>
      questions.filter(
        (_, idx) =>
          reviewMarkedQuestions[idx] &&
          selectedAnswers[idx] == null
      ).length,
    [questions, reviewMarkedQuestions, selectedAnswers]
  );

  const notVisitedCount = useMemo(
    () => questions.filter((_, idx) => !visitedQuestions[idx]).length,
    [questions, visitedQuestions]
  );

  const visitedUnansweredCount = useMemo(
    () =>
      questions.filter(
        (_, idx) =>
          visitedQuestions[idx] &&
          selectedAnswers[idx] == null &&
          !reviewMarkedQuestions[idx]
      ).length,
    [questions, visitedQuestions, selectedAnswers, reviewMarkedQuestions]
  );

  const answeredAndMarkedCount = useMemo(
    () =>
      questions.filter(
        (_, idx) => selectedAnswers[idx] != null && reviewMarkedQuestions[idx]
      ).length,
    [questions, selectedAnswers, reviewMarkedQuestions]
  );

  const isComplete = questions.length > 0 && answeredCount === questions.length;

  const formatTime = useCallback((seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  }, []);

  const getTimeTakenFormatted = useCallback(() => {
    const timeTakenSeconds = TOTAL_TIME_SECONDS - timeLeft;
    return formatTime(timeTakenSeconds);
  }, [timeLeft, formatTime]);

  const markVisited = useCallback((index) => {
    if (index < 0) return;

    setVisitedQuestions((prev) => {
      if (!prev.length || prev[index]) return prev;
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  }, []);

  const getQuestionStatus = useCallback(
    (idx) => {
      const isVisited = !!visitedQuestions[idx];
      const isAnswered = selectedAnswers[idx] != null;
      const isMarked = !!reviewMarkedQuestions[idx];

      if (!isVisited) return "not-visited";
      if (isMarked && isAnswered) return "answered-marked";
      if (isMarked) return "marked";
      if (isAnswered) return "answered";
      return "visited";
    },
    [visitedQuestions, selectedAnswers, reviewMarkedQuestions]
  );

  const submitQuizToServer = useCallback(async () => {
    if (!quizId) {
      throw new Error("Quiz id is missing.");
    }

    const responses = questions.map((q, idx) => ({
      id: q.id,
      selectedOption: selectedAnswers[idx] ?? null,
      markedForReview: !!reviewMarkedQuestions[idx],
      status: getQuestionStatus(idx),
    }));

    const timeTaken = getTimeTakenFormatted();

    const payload = {
      responses,
      timeTaken,
      quizTitle,
      attemptedQuestions: answeredCount,
      totalQuestions: questions.length,
      reviewedQuestions: reviewCount,
      subject,
      difficulty,
    };

    const res = await submitQuiz(quizId, payload);
    const resultData = res.data;

    navigate("/result", {
      state: {
        score: resultData?.score ?? resultData,
        percentageScore: resultData?.percentageScore,
        total: questions.length,
        answeredCount,
        unansweredCount: questions.length - answeredCount,
        reviewCount,
        answeredAndMarkedCount,
        title: quizTitle,
        quizId,
        timeTaken,
        subject,
        difficulty,
      },
      replace: true,
    });
  }, [
    quizId,
    questions,
    selectedAnswers,
    reviewMarkedQuestions,
    getQuestionStatus,
    getTimeTakenFormatted,
    quizTitle,
    answeredCount,
    reviewCount,
    answeredAndMarkedCount,
    navigate,
    subject,
    difficulty,
  ]);

  const runSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmittingRef.current) return;

      if (!answeredCount && !isAutoSubmit) {
        window.alert(
          "Please answer at least one question before submitting."
        );
        return;
      }

      if (!isAutoSubmit && timeLeft > 0) {
        const confirmEarlySubmit = window.confirm(
          `Time is not over yet. You still have ${formatTime(
            timeLeft
          )} remaining. Do you want to submit now?`
        );

        if (!confirmEarlySubmit) return;
      }

      if (!isComplete && timeLeft > 0) {
        const shouldSubmit = window.confirm(
          `You have answered ${answeredCount} out of ${questions.length} questions. Unanswered questions may be marked incorrect. Do you want to submit now?`
        );

        if (!shouldSubmit) return;
      }

      try {
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        await submitQuizToServer();
      } catch (err) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        window.alert(getApiErrorMessage(err, "Failed to submit quiz."));
      }
    },
    [
      answeredCount,
      timeLeft,
      formatTime,
      isComplete,
      questions.length,
      submitQuizToServer,
    ]
  );

  const handleSelect = useCallback(
    (optionIndex) => {
      markVisited(questionIndex);

      setSelectedAnswers((prev) => {
        const updated = [...prev];
        updated[questionIndex] = optionIndex;
        return updated;
      });
    },
    [questionIndex, markVisited]
  );

  const handlePrevious = useCallback(() => {
    if (isFirstQuestion) return;

    const nextIndex = questionIndex - 1;
    markVisited(nextIndex);
    setQuestionIndex(nextIndex);
  }, [isFirstQuestion, questionIndex, markVisited]);

  const handleJumpToQuestion = useCallback(
    (index) => {
      markVisited(index);
      setQuestionIndex(index);
    },
    [markVisited]
  );

  const handleSaveAndNext = useCallback(() => {
    markVisited(questionIndex);

    setReviewMarkedQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = false;
      return updated;
    });

    if (!isLastQuestion) {
      const nextIndex = questionIndex + 1;
      markVisited(nextIndex);
      setQuestionIndex(nextIndex);
    }
  }, [questionIndex, isLastQuestion, markVisited]);

  const handleMarkForReviewAndNext = useCallback(() => {
    markVisited(questionIndex);

    setReviewMarkedQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = true;
      return updated;
    });

    if (!isLastQuestion) {
      const nextIndex = questionIndex + 1;
      markVisited(nextIndex);
      setQuestionIndex(nextIndex);
    }
  }, [questionIndex, isLastQuestion, markVisited]);

  const handleClearResponse = useCallback(() => {
    markVisited(questionIndex);

    setSelectedAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = null;
      return updated;
    });

    setReviewMarkedQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = false;
      return updated;
    });
  }, [questionIndex, markVisited]);

  const handleMarkCurrentForReview = useCallback(() => {
    markVisited(questionIndex);

    setReviewMarkedQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = true;
      return updated;
    });
  }, [questionIndex, markVisited]);

  useEffect(() => {
    let ignore = false;

    const initQuiz = async () => {
      try {
        setLoading(true);
        setLoadError("");

        let effectiveQuizId = normalizedRouteQuizId;

        if (!effectiveQuizId) {
          if (!subject || !difficulty) {
            throw new Error("Subject and difficulty are required to start quiz.");
          }

          const createRes = await createQuiz(subject, difficulty);
          effectiveQuizId = createRes?.data?.id;
        }

        if (!effectiveQuizId) {
          throw new Error("Failed to create or resolve quiz id.");
        }

        const qRes = await getQuizQuestions(effectiveQuizId);
        const serverQuestions = Array.isArray(qRes?.data) ? qRes.data : [];

        if (ignore) return;

        setQuizId(effectiveQuizId);
        setQuestions(serverQuestions);
        setSelectedAnswers(Array(serverQuestions.length).fill(null));
        setVisitedQuestions(
          Array.from({ length: serverQuestions.length }, (_, idx) => idx === 0)
        );
        setReviewMarkedQuestions(Array(serverQuestions.length).fill(false));
        setQuestionIndex(0);
        setTimeLeft(TOTAL_TIME_SECONDS);
        setIsSubmitting(false);
        hasAutoSubmittedRef.current = false;
        isSubmittingRef.current = false;
      } catch (err) {
        if (!ignore) {
          setLoadError(getApiErrorMessage(err, "Failed to load quiz."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    initQuiz();

    return () => {
      ignore = true;
    };
  }, [normalizedRouteQuizId, subject, difficulty]);

  useEffect(() => {
    if (loading || !questions.length || isSubmittingRef.current) {
      return;
    }
	if (timeLeft <= 0 && !hasAutoSubmittedRef.current) {
	  hasAutoSubmittedRef.current = true;
	  runSubmit(true);
	  return;
	}

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, loading, questions.length, runSubmit]);

  if (loading) {
    return (
      <div className="quiz-page quiz-page--state">
        <div className="quiz-page__container">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="quiz-page quiz-page--state">
        <div className="quiz-page__container">
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-page quiz-page--state">
        <div className="quiz-page__container">
          <p>No questions available for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page quiz-page--exam nta-theme">
      <div className="quiz-page__container quiz-page__container--exam">
        <section className="quiz-main">
          <div className="c">
            <div className="quiz-exam-topbar__identity">
              <div className="quiz-exam-topbar__avatar">
                <span>👤</span>
              </div>

              <div className="quiz-exam-topbar__details">
                <p>
                  Candidate Name : <strong>{candidateName}</strong>
                </p>
                <p>
                  Exam Name : <strong>{quizTitle}</strong>
                </p>
                <p>
                  Remaining Time :{" "}
                  <span className="quiz-exam-topbar__timer">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>
            </div>
          <ProgressBar
            current={answeredCount}
            total={questions.length}
            label="Quiz progress"
          />
          </div>


          <div className="quiz-question-board">
            <div className="quiz-question-board__header">
              <h5>Question No {questionIndex + 1}</h5>
            </div>

            <div className="quiz-question-board__body">
              <div className="quiz-question-scroll">
                <QuizCard
                  question={currentQuestion.question}
                  options={[
                    currentQuestion.option1,
                    currentQuestion.option2,
                    currentQuestion.option3,
                    currentQuestion.option4,
                  ]}
                  selectedAnswer={currentAnswer}
                  onSelect={handleSelect}
                  questionNumber={questionIndex + 1}
                />
              </div>
            </div>

            <div className="quiz-question-board__footer">
              <div className="quiz-action-row">
                {!isLastQuestion && (
                  <>
                    <button
                      className="exam-btn exam-btn--green"
                      onClick={handleSaveAndNext}
                      disabled={isSubmitting}
                      type="button"
                    >
                      Save & Next
                    </button>

                    <button
                      className="exam-btn exam-btn--blue"
                      onClick={handleMarkForReviewAndNext}
                      disabled={isSubmitting}
                      type="button"
                    >
                      Mark For Review & Next
                    </button>
                  </>
                )}

                {isLastQuestion && (
                  <button
                    className="exam-btn exam-btn--orange"
                    onClick={handleMarkCurrentForReview}
                    disabled={isSubmitting}
                    type="button"
                  >
                    Mark For Review
                  </button>
                )}

                <button
                  className="exam-btn exam-btn--light"
                  onClick={handleClearResponse}
                  disabled={isSubmitting}
                  type="button"
                >
                  Clear
                </button>
              </div>

              <div className="quiz-nav-submit-row">
                <div className="quiz-nav-submit-row__left">
                  <button
                    className="exam-btn exam-btn--nav"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion || isSubmitting}
                    type="button"
                  >
                    &lt;&lt;BACK
                  </button>

                  {!isLastQuestion && (
                    <button
                      className="exam-btn exam-btn--nav"
                      onClick={handleSaveAndNext}
                      disabled={isSubmitting}
                      type="button"
                    >
                      NEXT&gt;&gt;
                    </button>
                  )}
                </div>

                <button
                  className="exam-btn exam-btn--submit"
                  onClick={() => runSubmit(false)}
                  disabled={isSubmitting}
                  type="button"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <QuestionPaletteSidebar
          questions={paletteQuestions}
          currentQuestionIndex={questionIndex}
          onJumpToQuestion={handleJumpToQuestion}
          counts={{
            notVisited: notVisitedCount,
            notAnswered: visitedUnansweredCount,
            answered: answeredCount,
            marked: reviewCount,
            answeredAndMarked: answeredAndMarkedCount,
          }}
        />
      </div>
    </div>
  );
}