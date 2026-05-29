import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import QuizCard from "../components/QuizCard";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const quizTitle = location.state?.title?.trim() || `Quiz ${id}`;
  const requestedCount = Number(location.state?.numQ) || 5;

  const allQuestions = useMemo(
    () => [
      {
        question: "Which keyword is used to inherit a class in Java?",
        options: ["this", "super", "extends", "implements"],
        correctAnswer: "extends",
      },
      {
        question: "Which collection does not allow duplicate values?",
        options: ["List", "ArrayList", "Set", "Vector"],
        correctAnswer: "Set",
      },
      {
        question: "Which HTTP method is commonly used to create data?",
        options: ["GET", "POST", "DELETE", "TRACE"],
        correctAnswer: "POST",
      },
      {
        question: "Which database language command is used to fetch data?",
        options: ["INSERT", "SELECT", "UPDATE", "DROP"],
        correctAnswer: "SELECT",
      },
      {
        question: "Which React hook is used for state management in a function component?",
        options: ["useRef", "useEffect", "useState", "useMemo"],
        correctAnswer: "useState",
      },
      {
        question: "Which protocol is connectionless?",
        options: ["TCP", "UDP", "HTTP", "FTP"],
        correctAnswer: "UDP",
      },
      {
        question: "Which layer of the OSI model handles routing?",
        options: ["Transport", "Session", "Network", "Physical"],
        correctAnswer: "Network",
      },
    ],
    []
  );

  const questions = allQuestions.slice(0, requestedCount);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array(questions.length).fill("")
  );

  const currentQuestion = questions[questionIndex];
  const currentAnswer = selectedAnswers[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const isFirstQuestion = questionIndex === 0;

  const answeredCount = selectedAnswers.filter(Boolean).length;
  const isComplete = answeredCount === questions.length;

  const handleSelect = (option) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = option;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setQuestionIndex((prev) => prev - 1);
    }
  };

  const submitQuiz = () => {
    let score = 0;

    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score += 1;
      }
    });

    navigate("/result", {
      state: {
        score,
        total: questions.length,
        answeredCount,
        unansweredCount: questions.length - answeredCount,
        title: quizTitle,
        quizId: id,
      },
    });
  };

  const handleSubmit = () => {
    if (!answeredCount) {
      window.alert("Please answer at least one question before submitting.");
      return;
    }

    if (!isComplete) {
      const shouldSubmit = window.confirm(
        `You have answered ${answeredCount} out of ${questions.length} questions. Unanswered questions will be marked incorrect. Do you want to submit now?`
      );

      if (!shouldSubmit) {
        return;
      }
    }

    submitQuiz();
  };

  if (!currentQuestion) {
    return (
      <div className="quiz-page">
        <div className="quiz-page__container">
          <p>No questions available for this quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-page__container">
        <div className="quiz-topbar">
          <div>
            <p className="quiz-kicker">Quiz</p>
            <h1 className="quiz-heading">{quizTitle}</h1>
          </div>

          <div className="quiz-meta">
            <span>
              Question {questionIndex + 1} of {questions.length}
            </span>
            <span>
              Answered {answeredCount} / {questions.length}
            </span>
          </div>
        </div>

        <ProgressBar
          current={answeredCount}
          total={questions.length}
          label="Quiz progress"
        />

        <QuizCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedAnswer={currentAnswer}
          onSelect={handleSelect}
        />

        <div className="quiz-actions">
          <button
            className="secondary-btn"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            type="button"
          >
            Previous
          </button>

          {!isLastQuestion && (
            <button
              className="secondary-btn"
              onClick={handleNext}
              type="button"
            >
              Next Question
            </button>
          )}

          <button
            className="primary-btn"
            onClick={handleSubmit}
            type="button"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}