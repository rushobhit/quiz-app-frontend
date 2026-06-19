import { useState } from "react";
import {
  deleteStudentResult,
  updateStudentResult,
  exportResultsCsv,
  exportResultsExcel,
} from "../quizApi";
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function ResultPanel({
  results,
  setResults,
  error,
  loading,
  onRefresh,
  page,
  setPage,
  totalPages,
}) {
	const [editingId, setEditingId] = useState(null);
	const [backupResult, setBackupResult] = useState(null);	const handleSaveResult = async (row) => {
	  try {
	    await updateStudentResult(row.id, {
	      score: Number(row.score),
	      attemptedQuestions: Number(row.attemptedQuestions),
	      percentage: Number(row.percentage),
	    });

	    alert("Result updated successfully.");
	    setEditingId(null);
	    onRefresh();
	  } catch (err) {
	    alert(
	      err?.response?.data?.message ||
	      "Failed to update result."
	    );
	  }
	};
	
	const handleExportExcel = async () => {
	  try {
	    const response = await exportResultsExcel();

	    const blob = new Blob([response.data]);

	    const url = window.URL.createObjectURL(blob);

	    const link = document.createElement("a");

	    link.href = url;
	    link.download = "student-results.xlsx";

	    link.click();

	    window.URL.revokeObjectURL(url);
	  } 	catch (err) {
	  alert(
	    err?.response?.data?.message ||
	    "Failed to export Excel."
	  );
	}
	};
	
	const handleExportCsv = async () => {
	  try {
	    const response = await exportResultsCsv();

	    const blob = new Blob([response.data], {
	      type: "text/csv",
	    });

	    const url = window.URL.createObjectURL(blob);

	    const link = document.createElement("a");
	    link.href = url;
	    link.download = "student-results.csv";
	    link.click();

	    window.URL.revokeObjectURL(url);
	  } catch (err) {
	    alert(
	      err?.response?.data?.message ||
	      "Failed to export CSV."
	    );
	  }
	};
	
	const handleEditResult = (row) => {
	  setBackupResult({ ...row });
	  setEditingId(row.id);
	};
	const handleResultChange = (
	  id,
	  field,
	  value
	) => {
	  setResults((prev) =>
	    prev.map((r) =>
	      r.id === id
	        ? { ...r, [field]: value }
	        : r
	    )
	  );
	};
	const handleCancelEdit = () => {
	  if (!backupResult) return;

	  setResults((prev) =>
	    prev.map((r) =>
	      r.id === backupResult.id
	        ? backupResult
	        : r
	    )
	  );

	  setBackupResult(null);
	  setEditingId(null);
	};
  const handleDeleteResult = async (row) => {

    if (
      !window.confirm(
        `Delete result for ${row.studentName ?? "this student"}?`
      )
    ) {
      return;
    }

    try {
      await deleteStudentResult(row.id);
      alert("Result deleted successfully.");
      onRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete result.");
    }
  };

  return (
    <div className="admin-section">
      <h2>Student Results</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
	  <div style={{ marginBottom: "12px" }}>
	    <button
	      className="primary-btn"
	      onClick={handleExportCsv}
	    >
	      Export CSV
	    </button>
		<button
		  className="secondary-btn"
		  onClick={handleExportExcel}
		>
		  Export Excel
		</button>
	  </div>
	  
        <table className="results-table">
          <thead>
		  <tr>
		    <th>Student Name</th>
		    <th>Email</th>
		    <th>Quiz Title</th>
		    <th>Score</th>
		    <th>Total</th>
		    <th>Attempted</th>
		    <th>Time Taken</th>
		    <th>Percentage</th>
		    <th>Date</th>
		    <th>Actions</th>
		  </tr>
          </thead>

          <tbody>
            {results.length > 0 ? (
              results.map((row, index) => (
				<tr key={row.id ?? index}>
				  <td>{row.studentName}</td>

				  <td>{row.email}</td>

				  <td>{row.quizTitle}</td>

				  <td>
				    {editingId === row.id ? (
				      <input
				        type="number"
				        value={row.score ?? 0}
						onChange={(e) =>
						  handleResultChange(
						    row.id,
						    "score",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      row.score
				    )}
				  </td>

				  <td>{row.total}</td>

				  <td>
				    {editingId === row.id ? (
				      <input
				        type="number"
				        value={row.attemptedQuestions ?? 0}
						onChange={(e) =>
						  handleResultChange(
						    row.id,
						    "attemptedQuestions",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      row.attemptedQuestions
				    )}
				  </td>

				  <td>{row.timeTaken}</td>

				  <td>
				    {editingId === row.id ? (
				      <input
				        type="number"
				        value={row.percentage ?? 0}
						onChange={(e) =>
						  handleResultChange(
						    row.id,
						    "percentage",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      `${row.percentage}%`
				    )}
				  </td>

				  <td>{formatDateTime(row.submittedAt)}</td>

				  <td>
				    <div className="auth-actions-row">
				      {editingId === row.id ? (
				        <>
				          <button
				            className="primary-btn"
				            onClick={() => handleSaveResult(row)}
				          >
				            Save
				          </button>

				          <button
				            className="secondary-btn"
				            onClick={handleCancelEdit}
				          >
				            Cancel
				          </button>

				          <button
				            className="danger-btn"
				            onClick={() => handleDeleteResult(row)}
				          >
				            Delete
				          </button>
				        </>
				      ) : (
				        <>
				          <button
				            className="secondary-btn"
				            onClick={() => handleEditResult(row)}
				          >
				            Edit
				          </button>

				          <button
				            className="danger-btn"
				            onClick={() => handleDeleteResult(row)}
				          >
				            Delete
				          </button>
				        </>
				      )}
				    </div>
				  </td>
				</tr>
              ))
            ) : (
              !error &&
              !loading && (
                <tr>
                  <td colSpan="10">No student results found.</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "20px",
            alignItems: "center",
          }}
        >
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