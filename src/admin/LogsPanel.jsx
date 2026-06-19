// src/admin/LogsPanel.jsx

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function LogsPanel({
  logs,
  error,
  loading,
  page,
  setPage,
  totalPages,
}) {
  return (
    <div className="admin-section">
      <h2>Activity Logs</h2>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Email</th>
              <th>Type</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={log.id ?? index}>
				<td>{formatDateTime(log.createdAt)}</td>
				<td>{log.fullName}</td>
				<td>{log.email}</td>
				<td>{log.eventType}</td>
				<td>{log.message}</td>
                </tr>
              ))
            ) : (
              !error &&
              !loading && (
                <tr>
                  <td colSpan="5">No activity logs found.</td>
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
            alignItems: "center",
            gap: "12px",
            marginTop: "20px",
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