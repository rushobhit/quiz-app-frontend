import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StartPanel from "../components/StartPanel";

export default function HomePage() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("Java");
  const [numQ, setNumQ] = useState("5");
  const [title, setTitle] = useState("Java Challenge");
  const [error, setError] = useState("");

  const handleStart = (e) => {
    e.preventDefault();
    setError("");

    try {
      const trimmedCategory = category.trim();
      const trimmedTitle = title.trim();
      const totalQuestions = Number(numQ);

      if (!trimmedCategory) {
        throw new Error("Category is required.");
      }

      if (!trimmedTitle) {
        throw new Error("Quiz title is required.");
      }

      if (
        !Number.isInteger(totalQuestions) ||
        totalQuestions < 1 ||
        totalQuestions > 20
      ) {
        throw new Error("Number of questions must be between 1 and 20.");
      }

      navigate("/quiz/1", {
        state: {
          category: trimmedCategory,
          numQ: totalQuestions,
          title: trimmedTitle,
        },
      });
    } catch (err) {
      setError(err.message || "Could not start quiz.");
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <main className="hero-layout">
        <section className="hero-copy">
          <h1>Sharpen your concepts with a focused quiz flow.</h1>
          <p>
            Build, attempt, and review quizzes through a quick practice flow
            designed for better revision.
          </p>
        </section>

        <section className="start-card-wrap" id="start-quiz">
          <StartPanel
            category={category}
            numQ={numQ}
            title={title}
            error={error}
            onCategoryChange={setCategory}
            onNumQChange={setNumQ}
            onTitleChange={setTitle}
            onSubmit={handleStart}
          />
        </section>
      </main>
    </div>
  );
}