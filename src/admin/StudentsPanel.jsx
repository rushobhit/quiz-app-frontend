// src/admin/StudentsPanel.jsx

import { updateStudent, deleteStudent } from "../quizApi";
import { useState } from "react";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function StudentsPanel({
  students,
  setStudents,
  error,
  loading,
  onRefresh,
  page,
  setPage,
  totalPages,
}){
	const [editingId, setEditingId] = useState(null);
	const [backupStudent, setBackupStudent] = useState(null);
	const handleStudentChange = (id, field, value) => {
	  setStudents((prev) =>
	    prev.map((stu) =>
	      stu.id === id
	        ? { ...stu, [field]: value }
	        : stu
	    )
	  );
	};
  const handleEditStudent = (student) => {
    setBackupStudent({ ...student });
    setEditingId(student.id);
  };

  const handleCancelEdit = () => {
    if (backupStudent) {
      setStudents((prev) =>
        prev.map((stu) =>
          stu.id === backupStudent.id
            ? backupStudent
            : stu
        )
      );
    }

    setBackupStudent(null);
    setEditingId(null);
  };
  const handleSaveStudent = async (student) => {

    if (!`${student.firstName || ""} ${student.lastName || ""}`.trim() || !student.email?.trim()) {
      alert("Name and email cannot be empty.");
      return;
    }

    try {
		const payload = {
		  firstName: student.firstName || "",
		  lastName: student.lastName || "",
		  username: student.username || "",
		  email: student.email || "",

		  fatherName: student.fatherName || "",
		  motherName: student.motherName || "",
		  dob: student.dob || null,
		  institute: student.institute || "",

		  status: student.status || "ACTIVE",
		};

      await updateStudent(student.id, payload);

      alert("Student updated successfully.");
	  setEditingId(null);
	  setBackupStudent(null);
	  onRefresh();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to update student."
      );
    }
  };

  const handleDeleteStudent = async (student) => {

    if (
      !window.confirm(
        `Delete student: ${
          `${student.firstName || ""} ${student.lastName || ""}`.trim() || "this student"
        }? This may delete their results as well.`
      )
    ) {
      return;
    }

    try {
      await deleteStudent(student.id);

      alert("Student deleted successfully.");
      onRefresh();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to delete student."
      );
    }
  };

  return (
    <div className="admin-section">
      <h2>Students</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <table className="results-table">
          <thead>
		  <tr>
		    <th>First Name</th>
		    <th>Last Name</th>
		    <th>Email</th>
		    <th>Status</th>
		    <th>Username</th>
		    <th>Father Name</th>
		    <th>Mother Name</th>
		    <th>DOB</th>
		    <th>Institute</th>
			<th>Created AT</th>
		    <th>Actions</th>
		  </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((stu, index) => (
				<tr key={stu.id ?? index}>
				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.firstName || ""}
						onChange={(e) =>
						  handleStudentChange(
						    stu.id,
						    "firstName",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      stu.firstName
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.lastName || ""}
						onChange={(e) =>
						  handleStudentChange(
						    stu.id,
						    "lastName",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      stu.lastName
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="email"
				        value={stu.email || ""}
						onChange={(e) =>
						  handleStudentChange(
						    stu.id,
						    "email",
						    e.target.value
						  )
						}
				      />
				    ) : (
				      stu.email
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <select
				        value={stu.status || "ACTIVE"}
						onChange={(e) =>
						  handleStudentChange(
						    stu.id,
						    "status",
						    e.target.value
						  )
						}
				      >
				        <option value="ACTIVE">
				          ACTIVE
				        </option>

				        <option value="BLOCKED">
				          BLOCKED
				        </option>
				      </select>
				    ) : (
				      stu.status
				    )}
				  </td>
				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.username || ""}
				        onChange={(e) =>
							handleStudentChange(
							  stu.id,
							  "username",
							  e.target.value
							)
				        }
				      />
				    ) : (
				      stu.username
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.fatherName || ""}
				        onChange={(e) =>
							handleStudentChange(
							  stu.id,
							  "fatherName",
							  e.target.value
							)
				        }
				      />
				    ) : (
				      stu.fatherName
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.motherName || ""}
				        onChange={(e) =>
							handleStudentChange(
							  stu.id,
							  "motherName",
							  e.target.value
							)
				        }
				      />
				    ) : (
				      stu.motherName
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="date"
				        value={stu.dob || ""}
				        onChange={(e) =>
				          handleStudentChange(
				            stu.id,
				            "dob",
				            e.target.value
				          )
				        }
				      />
				    ) : (
				      stu.dob
				    )}
				  </td>

				  <td>
				    {editingId === stu.id ? (
				      <input
				        type="text"
				        value={stu.institute || ""}
				        onChange={(e) =>
				          handleStudentChange(
				            stu.id,
				            "institute",
				            e.target.value
				          )
				        }
				      />
				    ) : (
				      stu.institute
				    )}
				  </td>
				  <td>
				    {formatDateTime(stu.createdAt)}
				  </td>

				  <td>
				    <div className="auth-actions-row">
				      {editingId === stu.id ? (
				        <>
				          <button
				            className="primary-btn"
				            onClick={() =>
				              handleSaveStudent(stu)
				            }
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
				            onClick={() =>
				              handleDeleteStudent(stu)
				            }
				          >
				            Delete
				          </button>
				        </>
				      ) : (
				        <>
				          <button
				            className="secondary-btn"
				            onClick={() =>
				              handleEditStudent(stu)
				            }
				          >
				            Edit
				          </button>

				          <button
				            className="danger-btn"
				            onClick={() =>
				              handleDeleteStudent(stu)
				            }
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
                  <td colSpan="6">
                    No students found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
		</div>
		{totalPages > 1 && (
		  <div className="pagination">
		    <button
		      type="button"
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