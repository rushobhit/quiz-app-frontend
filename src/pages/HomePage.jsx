import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StartPanel from "../components/StartPanel";

export default function HomePage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("Java");
  const [difficulty, setDifficulty] = useState("EASY");
  const [error, setError] = useState("");

  const handleStart = (e) => {
    e.preventDefault();
    setError("");

    const trimmedSubject = subject.trim();
    const trimmedDifficulty = difficulty.trim().toUpperCase();

    if (!trimmedSubject) {
      setError("Subject is required.");
      return;
    }

    if (!trimmedDifficulty) {
      setError("Difficulty is required.");
      return;
    }

    navigate("/instructions", {
      state: {
        subject: trimmedSubject,
        difficulty: trimmedDifficulty,
      },
    });
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <main className="hero-layout">
        <section className="hero-copy">
          <h1>Sharpen your concepts with a focused quiz flow.</h1>
          <p>
            Select a subject and difficulty, then start the matching quiz with
            corresponding questions.
          </p>
        </section>

        <section className="start-card-wrap" id="start-quiz">
          <StartPanel
            subject={subject}
            difficulty={difficulty}
            error={error}
            onSubjectChange={setSubject}
            onDifficultyChange={setDifficulty}
            onSubmit={handleStart}
          />
        </section>
      </main>
    </div>
  );
}