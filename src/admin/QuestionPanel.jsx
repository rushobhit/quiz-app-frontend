// src/admin/QuestionPanel.jsx
import { useState } from "react";
import {
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} from "../quizApi";

const SUBJECT_OPTIONS = ["Java", "Python", "JavaScript", "DBMS", "OS", "CN"];
const DIFFICULTY_OPTIONS = ["EASY", "MODERATE", "HARD"];

export default function QuestionPanel({
  questions,
  setQuestions,
  error,
  loading,
  onRefresh,
  page,
  setPage,
  totalPages,
  search,
  setSearch,
})  {
	const [editingId, setEditingId] = useState(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    subject: "",
    difficulty: "",
    question: "",
    options: ["", "", "", ""],
    correctOption: 1,
  });

  const handleNewOptionChange = (index, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();


    if (
      !newQuestion.subject.trim() ||
      !newQuestion.difficulty.trim() ||
      !newQuestion.question.trim() ||
      newQuestion.options.some((o) => !o.trim())
    ) {
      alert("Please fill subject, difficulty, question, and all 4 options.");
      return;
    }

    if (newQuestion.correctOption < 1 || newQuestion.correctOption > 4) {
      alert("Correct option must be between 1 and 4.");
      return;
    }

    try {
      const payload = {
        subject: newQuestion.subject.trim(),
        difficulty: newQuestion.difficulty.trim(),
        question: newQuestion.question.trim(),
        options: newQuestion.options.map((o) => o.trim()),
        correctOption: Number(newQuestion.correctOption),
      };

      await createAdminQuestion(payload);
      alert("Question created successfully.");

      setNewQuestion({
        subject: "",
        difficulty: "",
        question: "",
        options: ["", "", "", ""],
        correctOption: 1,
      })
	  setShowCreateForm(false);

      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create question.");
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, [field]: value }
          : question
      )
    );
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((opt, i) =>
                i === optionIndex ? value : opt
              ),
            }
          : question
      )
    );
  };

  const handleSaveQuestion = async (question) => {

    if (!question.subject || !question.difficulty || !question.question) {
      alert("Subject, difficulty, and question cannot be empty.");
      return;
    }

    if (!question.options || question.options.length !== 4) {
      alert("Exactly 4 options are required.");
      return;
    }

    if (
      question.correctOption == null ||
      question.correctOption < 1 ||
      question.correctOption > 4
    ) {
      alert("Correct option must be between 1 and 4.");
      return;
    }

    try {
      const payload = {
        subject: question.subject.trim(),
        difficulty: question.difficulty.trim(),
        question: question.question.trim(),
        options: question.options.map((o) => o.trim()),
        correctOption: Number(question.correctOption),
      };

      await updateAdminQuestion(question.id, payload);
      alert("Question updated successfully.");
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update question.");
    }
  };

  const handleDeleteQuestion = async (question) => {

    if (
      !window.confirm(
        `Delete question: "${question.question?.slice(0, 80) || ""}" ?`
      )
    ) {
      return;
    }

    try {
      await deleteAdminQuestion(question.id);
      alert("Question deleted successfully.");
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete question.");
    }
	
  };

  return (
    <div className="admin-section">
      <h2>Manage Questions</h2>

      {/* Create Question */}
      <div className="admin-card">
	  <div className="section-header">
	    <h3>Create New Question</h3>

	    <button
	      type="button"
	      className="primary-btn"
	      onClick={() => setShowCreateForm(!showCreateForm)}
	    >
	      {showCreateForm ? "Hide Form" : "+ Add Question"}
	    </button>
	  </div>

	  {showCreateForm && (
	    <form onSubmit={handleCreateQuestion}>
		<div className="question-meta">
          <label className="field">
            <span>Subject</span>
            <select
              value={newQuestion.subject}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            >
              <option value="">Select subject</option>
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Difficulty</span>
            <select
              value={newQuestion.difficulty}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
            >
              <option value="">Select difficulty</option>
              {DIFFICULTY_OPTIONS.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </label>
		  </div>

          <label className="field">
            <span>Question</span>
			<textarea
			  rows="3"
			  value={newQuestion.question}
			  onChange={(e) =>
			    setNewQuestion((prev) => ({
			      ...prev,
			      question: e.target.value,
			    }))
			  }
			/>
          </label>

		  <div className="question-options">
		    {newQuestion.options.map((opt, index) => (
		      <div
		        key={index}
		        className="question-option-item"
		      >
		        <span className="option-badge">
		          Option {index + 1}
		        </span>

		        <textarea
		          rows="3"
		          value={opt}
		          onChange={(e) =>
		            handleNewOptionChange(
		              index,
		              e.target.value
		            )
		          }
		        />
		      </div>
		    ))}
		  </div>

          <label className="field">
            <span>Correct Option (1-4)</span>
			<select
			  value={newQuestion.correctOption}
			  onChange={(e) =>
			    setNewQuestion((prev) => ({
			      ...prev,
			      correctOption: Number(e.target.value),
			    }))
			  }
			>
			  <option value={1}>Option 1</option>
			  <option value={2}>Option 2</option>
			  <option value={3}>Option 3</option>
			  <option value={4}>Option 4</option>
			</select>
          </label>

          <button className="primary-btn" type="submit">
            Create Question
          </button>
		  </form>
		  )}
      </div>
	  <div className="admin-card">
	    <input
	      type="text"
	      placeholder="Search by subject, difficulty or question..."
	      value={search}
	      onChange={(e) => setSearch(e.target.value)}
	    />
	  </div>
	  <h3>
	    Existing Questions ({questions.length})
	  </h3>

	  {error && <div className="error-box">{error}</div>}

	  {!error && questions.length === 0 && !loading && (
	    <div className="admin-card">
	      <p>No questions found.</p>
	    </div>
	  )}

	  {questions.length > 0 && (
	    <div className="table-wrap">
	      <table className="results-table">
	        <thead>
	          <tr>
	            <th>Subject</th>
	            <th>Difficulty</th>
	            <th>Question</th>
	            <th>Correct</th>
	            <th>Actions</th>
	          </tr>
	        </thead>

	        <tbody>
	          {questions.map((question, index) => (
	            <tr key={question.id ?? index}>
	              <td>
	                {editingId === question.id ? (
	                  <select
	                    value={question.subject || ""}
	                    onChange={(e) =>
	                      handleQuestionChange(
	                        question.id,
	                        "subject",
	                        e.target.value
	                      )
	                    }
	                  >
	                    {SUBJECT_OPTIONS.map((subj) => (
	                      <option key={subj} value={subj}>
	                        {subj}
	                      </option>
	                    ))}
	                  </select>
	                ) : (
	                  question.subject
	                )}
	              </td>

	              <td>
	                {editingId === question.id ? (
	                  <select
	                    value={question.difficulty || ""}
	                    onChange={(e) =>
	                      handleQuestionChange(
	                        question.id,
	                        "difficulty",
	                        e.target.value
	                      )
	                    }
	                  >
	                    {DIFFICULTY_OPTIONS.map((diff) => (
	                      <option key={diff} value={diff}>
	                        {diff}
	                      </option>
	                    ))}
	                  </select>
	                ) : (
	                  question.difficulty
	                )}
	              </td>

	              <td>
	                {editingId === question.id ? (
	                  <>
	                    <textarea
	                      rows="3"
	                      value={question.question || ""}
	                      onChange={(e) =>
	                        handleQuestionChange(
	                          question.id,
	                          "question",
	                          e.target.value
	                        )
	                      }
	                    />

	                    <div className="question-options">
							
						{(question.options || []).map(
						  (option, optionIndex) => (
						    <div
						      key={optionIndex}
						      className="question-option-item"
						    >
						      <span className="option-badge">
						        Option {optionIndex + 1}
						      </span>

						      <textarea
						        rows="2"
						        value={option}
						        onChange={(e) =>
						          handleOptionChange(
						            question.id,
						            optionIndex,
						            e.target.value
						          )
						        }
						      />
						    </div>
						  )
						)}
	                    </div>
	                  </>
	                ) : (
	                  <div>
	                    <strong>{question.question}</strong>
	                  </div>
	                )}
	              </td>

	              <td>
	                {editingId === question.id ? (
	                  <select
	                    value={question.correctOption || 1}
	                    onChange={(e) =>
	                      handleQuestionChange(
	                        question.id,
	                        "correctOption",
	                        Number(e.target.value)
	                      )
	                    }
	                  >
	                    <option value={1}>1</option>
	                    <option value={2}>2</option>
	                    <option value={3}>3</option>
	                    <option value={4}>4</option>
	                  </select>
	                ) : (
	                  question.correctOption
	                )}
	              </td>

	              <td>
	                <div className="auth-actions-row">
	                  {editingId === question.id ? (
	                    <>
	                      <button
	                        className="primary-btn"
	                        type="button"
	                        onClick={async () => {
	                          await handleSaveQuestion(question);
	                          setEditingId(null);
	                        }}
	                      >
	                        Save
	                      </button>

	                      <button
	                        className="secondary-btn"
	                        type="button"
	                        onClick={() => setEditingId(null)}
	                      >
	                        Cancel
	                      </button>

	                      <button
	                        className="danger-btn"
	                        type="button"
	                        onClick={() =>
	                          handleDeleteQuestion(question)
	                        }
	                      >
	                        Delete
	                      </button>
	                    </>
	                  ) : (
	                    <>
	                      <button
	                        className="primary-btn"
	                        type="button"
	                        onClick={() =>
	                          setEditingId(question.id)
	                        }
	                      >
	                        Edit
	                      </button>

	                      <button
	                        className="danger-btn"
	                        type="button"
	                        onClick={() =>
	                          handleDeleteQuestion(question)
	                        }
	                      >
	                        Delete
	                      </button>
	                    </>
	                  )}
	                </div>
	              </td>
	            </tr>
	          ))}
	        </tbody>
	      </table>
	    </div>
	  )}

	  {totalPages > 1 && (
	    <div 		style={{
		            display: "flex",
		            justifyContent: "center",
		            gap: "12px",
		            marginTop: "20px",
		            alignItems: "center",
		          }}>
	      <button
	        type="button"
			className="secondary-btn"
	        disabled={page === 0}
	        onClick={() => setPage(page - 1)}
	      >
	        Previous
	      </button>

	      <span>
	        Page {page + 1} of {totalPages}
	      </span>

	      <button
	        type="button"
			className="secondary-btn"
	        disabled={page >= totalPages - 1}
	        onClick={() => setPage(page + 1)}
	      >
	        Next
	      </button>
	    </div>
	  )}
	  </div>
	 );
}