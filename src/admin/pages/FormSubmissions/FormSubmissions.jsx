import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { usePermissions } from "../../auth/usePermissions";
import {
  getFormSubmissions,
  deleteFormSubmission,
  updateFormSubmissionStatus,
  getFormSubmissionFile,
} from "../../services/formSubmissionService";
import "./FormSubmissions.css";

export default function FormSubmissions() {
  const { canDelete } = usePermissions();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'new', 'read', 'archived'
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFormSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching form submissions:", err);
      setError("Failed to load form submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      setError("You don't have permission to delete submissions.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete this submission? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteFormSubmission(id);
      await fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
      alert("Submission deleted successfully!");
    } catch (err) {
      console.error("Error deleting submission:", err);
      alert("Error deleting submission. Please try again.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateFormSubmissionStatus(id, newStatus);
      await fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status. Please try again.");
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    // Debug: Log file information with full details
    console.log("🔍 Viewing submission details:", {
      id: submission.id,
      fileId: submission.fileId,
      fileName: submission.fileName,
      fileSize: submission.fileSize,
      fileType: submission.fileType,
      allKeys: Object.keys(submission),
    });
    console.log(
      "🔍 Full submission object (expand to see all fields):",
      submission
    );
    console.log("🔍 File fields specifically:", {
      fileId: submission.fileId,
      fileName: submission.fileName,
      fileSize: submission.fileSize,
      fileType: submission.fileType,
      hasFileId: !!submission.fileId,
      hasFileName: !!submission.fileName,
      fileIdType: typeof submission.fileId,
      fileNameType: typeof submission.fileName,
      fileIdValue: String(submission.fileId),
      fileNameValue: String(submission.fileName),
    });
    // Mark as read if it's new
    if (submission.status === "new") {
      handleStatusChange(submission.id, "read");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: "New", className: "status-badge-new" },
      read: { label: "Read", className: "status-badge-read" },
      archived: { label: "Archived", className: "status-badge-archived" },
    };
    const badge = badges[status] || badges.new;
    return (
      <span className={`status-badge ${badge.className}`}>{badge.label}</span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // File Download Component
  const FileDownloadSection = ({ fileId, fileName, fileSize }) => {
    const [downloading, setDownloading] = useState(false);
    const [fileError, setFileError] = useState(null);

    const handleDownload = async () => {
      try {
        setDownloading(true);
        setFileError(null);

        if (!fileId) {
          setFileError("File ID is missing. Cannot download file.");
          return;
        }

        console.log("Fetching file with ID:", fileId);
        const fileData = await getFormSubmissionFile(fileId);

        if (!fileData || !fileData.data) {
          setFileError("File data not found. The file may have been deleted.");
          return;
        }

        console.log("File data retrieved:", {
          name: fileData.name,
          contentType: fileData.contentType,
          size: fileData.size,
          hasData: !!fileData.data,
        });

        // Create a download link
        const link = document.createElement("a");
        link.href = fileData.data; // Base64 data URL
        link.download = fileData.name || fileName || "download";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } catch (error) {
        console.error("Error downloading file:", error);
        setFileError(
          `Failed to download file: ${error.message || "Unknown error"}`
        );
      } finally {
        setDownloading(false);
      }
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return "Unknown size";
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                marginBottom: "6px",
                color: "#1e293b",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              <strong>File Name:</strong> {fileName || "Unknown"}
            </p>
            {fileSize && (
              <p
                style={{
                  marginBottom: "4px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                <strong>Size:</strong> {formatFileSize(fileSize)}
              </p>
            )}
            {fileId && (
              <p
                style={{
                  marginBottom: "0",
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              >
                ID: {fileId.substring(0, 20)}...
              </p>
            )}
          </div>
        </div>

        {!fileId ? (
          <div
            style={{
              color: "#f59e0b",
              fontSize: "13px",
              padding: "12px",
              background: "#fef3c7",
              borderRadius: "6px",
              border: "1px solid #fde68a",
              marginBottom: "12px",
            }}
          >
            <strong>⚠️ Warning:</strong> File ID is missing. This file may not
            have been uploaded correctly.
            {fileName && (
              <p
                style={{ marginTop: "6px", fontSize: "12px", marginBottom: 0 }}
              >
                The submission shows a file name ({fileName}) but no file ID.
                This might be from an older submission format or the file upload
                may have failed.
              </p>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="admin-btn admin-btn-primary"
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {downloading ? "⏳ Downloading..." : "⬇️ Download File"}
            </button>
            {fileError && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "13px",
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fee2e2",
                  borderRadius: "6px",
                  border: "1px solid #fecaca",
                }}
              >
                <strong>❌ Error:</strong> {fileError}
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    marginBottom: 0,
                  }}
                >
                  Please check the browser console (F12) for more details.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const filteredSubmissions =
    statusFilter === "all"
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

  const newCount = submissions.filter((s) => s.status === "new").length;
  const readCount = submissions.filter((s) => s.status === "read").length;
  const archivedCount = submissions.filter(
    (s) => s.status === "archived"
  ).length;

  return (
    <AdminLayout currentPage="form-submissions">
      <div className="form-submissions-management">
        <div className="form-submissions-header">
          <div>
            <h1 className="admin-heading-1">Form Submissions</h1>
            <p className="admin-text-sm admin-mt-sm">
              View and manage all form submissions from the Tell Us section.
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchSubmissions}
              className="admin-btn admin-btn-secondary"
              disabled={loading}
            >
              {loading ? "⏳ Loading..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
            <button
              onClick={fetchSubmissions}
              className="admin-btn admin-btn-secondary admin-mt-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="submissions-stats">
          <div className="stat-card" onClick={() => setStatusFilter("all")}>
            <div className="stat-number">{submissions.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div
            className="stat-card stat-new"
            onClick={() => setStatusFilter("new")}
          >
            <div className="stat-number">{newCount}</div>
            <div className="stat-label">New</div>
          </div>
          <div
            className="stat-card stat-read"
            onClick={() => setStatusFilter("read")}
          >
            <div className="stat-number">{readCount}</div>
            <div className="stat-label">Read</div>
          </div>
          <div
            className="stat-card stat-archived"
            onClick={() => setStatusFilter("archived")}
          >
            <div className="stat-number">{archivedCount}</div>
            <div className="stat-label">Archived</div>
          </div>
        </div>

        {/* Filter */}
        <div className="submissions-filter">
          <label className="admin-label">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Submissions</option>
            <option value="new">New ({newCount})</option>
            <option value="read">Read ({readCount})</option>
            <option value="archived">Archived ({archivedCount})</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading submissions...</p>
          </div>
        ) : (
          <div className="submissions-container">
            {/* Submissions List */}
            <div className="submissions-list">
              {filteredSubmissions.length === 0 ? (
                <div className="admin-empty-state">
                  <p className="admin-text">No submissions found.</p>
                  {statusFilter !== "all" && (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="admin-btn admin-btn-secondary admin-mt-sm"
                    >
                      View All Submissions
                    </button>
                  )}
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`submission-card ${
                      selectedSubmission?.id === submission.id ? "selected" : ""
                    } ${submission.status === "new" ? "unread" : ""}`}
                    onClick={() => handleViewDetails(submission)}
                  >
                    <div className="submission-card-header">
                      <div className="submission-card-title">
                        <h3>
                          {submission.firstName} {submission.lastName}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="submission-card-meta">
                        <span className="submission-email">
                          {submission.email}
                        </span>
                        <span className="submission-date">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="submission-card-body">
                      <div className="submission-field">
                        <strong>Requirement:</strong>{" "}
                        {submission.requirement || "N/A"}
                      </div>
                      {submission.message && (
                        <div className="submission-field">
                          <strong>Message:</strong>
                          <p className="submission-message-preview">
                            {submission.message.length > 100
                              ? `${submission.message.substring(0, 100)}...`
                              : submission.message}
                          </p>
                        </div>
                      )}
                      {submission.fileName && (
                        <div className="submission-field">
                          <strong>📎 File:</strong> {submission.fileName}
                        </div>
                      )}
                    </div>
                    <div className="submission-card-actions">
                      <select
                        value={submission.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(submission.id, e.target.value);
                        }}
                        className="admin-select status-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                      </select>
                      {canDelete && (
                      <button
                        className="admin-btn admin-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(submission.id);
                        }}
                      >
                        Delete
                      </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submission Details Sidebar */}
            {selectedSubmission && (
              <div className="submission-details">
                <div className="submission-details-header">
                  <h2>Submission Details</h2>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="submission-details-body">
                  <div className="detail-section">
                    <h3>Status</h3>
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedSubmission.id,
                          e.target.value
                        )
                      }
                      className="admin-select"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="detail-section">
                    <h3>Submitted</h3>
                    <p>{formatDate(selectedSubmission.submittedAt)}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Name</h3>
                    <p>
                      {selectedSubmission.firstName}{" "}
                      {selectedSubmission.lastName}
                    </p>
                  </div>

                  <div className="detail-section">
                    <h3>Email</h3>
                    <p>
                      <a href={`mailto:${selectedSubmission.email}`}>
                        {selectedSubmission.email}
                      </a>
                    </p>
                  </div>

                  {selectedSubmission.requirement && (
                    <div className="detail-section">
                      <h3>Requirement</h3>
                      <p>{selectedSubmission.requirement}</p>
                    </div>
                  )}

                  {selectedSubmission.message && (
                    <div className="detail-section">
                      <h3>Message</h3>
                      <div className="submission-message-full">
                        {selectedSubmission.message
                          .split("\n")
                          .map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              {index <
                                selectedSubmission.message.split("\n").length -
                                  1 && <br />}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* File Download Section - Always show prominently */}
                  <div
                    className="detail-section"
                    style={{
                      border: "2px solid #3b82f6",
                      borderRadius: "8px",
                      padding: "16px",
                      background: "#eff6ff",
                      marginTop: "16px",
                    }}
                  >
                    <h3
                      style={{
                        color: "#1e40af",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      📎 Uploaded File
                    </h3>
                    {(() => {
                      // Debug: Log what we're checking
                      // Enhanced debug logging
                      const debugInfo = {
                        fileId: selectedSubmission.fileId,
                        fileIdType: typeof selectedSubmission.fileId,
                        fileIdTruthy: !!selectedSubmission.fileId,
                        fileName: selectedSubmission.fileName,
                        fileNameType: typeof selectedSubmission.fileName,
                        fileNameTruthy: !!selectedSubmission.fileName,
                        fileSize: selectedSubmission.fileSize,
                        fileType: selectedSubmission.fileType,
                        allSubmissionKeys: Object.keys(selectedSubmission),
                        submissionId: selectedSubmission.id,
                        fileIdString: String(selectedSubmission.fileId || ""),
                        fileNameString: String(
                          selectedSubmission.fileName || ""
                        ),
                      };
                      console.log("🔍 File check debug (detailed):", debugInfo);
                      console.log(
                        "🔍 Full submission object (expand to see all):",
                        selectedSubmission
                      );

                      // Also log each field individually for clarity
                      console.log("🔍 Individual field checks:", {
                        "selectedSubmission.fileId": selectedSubmission.fileId,
                        "selectedSubmission.fileName":
                          selectedSubmission.fileName,
                        "selectedSubmission.fileSize":
                          selectedSubmission.fileSize,
                        "selectedSubmission.fileType":
                          selectedSubmission.fileType,
                      });

                      const hasFileId =
                        selectedSubmission.fileId &&
                        typeof selectedSubmission.fileId === "string" &&
                        selectedSubmission.fileId.trim() !== "";
                      const hasFileName =
                        selectedSubmission.fileName &&
                        typeof selectedSubmission.fileName === "string" &&
                        selectedSubmission.fileName.trim() !== "";
                      const hasFile = hasFileId || hasFileName;

                      console.log("✅ File check result:", {
                        hasFileId,
                        hasFileName,
                        hasFile,
                      });

                      // Log the actual values as strings for easy reading
                      console.log("📊 File data summary:", {
                        "fileId value":
                          selectedSubmission.fileId || "(null/undefined)",
                        "fileName value":
                          selectedSubmission.fileName || "(null/undefined)",
                        "fileSize value":
                          selectedSubmission.fileSize || "(null/undefined)",
                        "fileType value":
                          selectedSubmission.fileType || "(null/undefined)",
                        "Will show file?": hasFile ? "YES ✅" : "NO ❌",
                      });

                      if (hasFile) {
                        return (
                          <FileDownloadSection
                            fileId={selectedSubmission.fileId || null}
                            fileName={
                              selectedSubmission.fileName || "Unknown File"
                            }
                            fileSize={selectedSubmission.fileSize || null}
                          />
                        );
                      } else {
                        return (
                          <div
                            style={{
                              padding: "12px",
                              background: "#fef3c7",
                              borderRadius: "6px",
                              border: "1px solid #fde68a",
                            }}
                          >
                            <p
                              style={{
                                color: "#92400e",
                                fontSize: "14px",
                                margin: 0,
                              }}
                            >
                              <strong>⚠️ No file uploaded:</strong> This
                              submission does not include an uploaded file.
                            </p>
                            <p
                              style={{
                                color: "#78350f",
                                fontSize: "12px",
                                marginTop: "8px",
                                marginBottom: 0,
                                fontStyle: "italic",
                              }}
                            >
                              💡 Note: If you uploaded a file but don't see it
                              here, this submission may have been created before
                              the file upload feature was enabled. Please submit
                              a new form with a file to test the feature.
                            </p>
                            <details
                              style={{
                                marginTop: "8px",
                                fontSize: "11px",
                                color: "#78350f",
                              }}
                            >
                              <summary
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                Debug Info
                              </summary>
                              <pre
                                style={{
                                  marginTop: "4px",
                                  fontFamily: "monospace",
                                  fontSize: "10px",
                                  background: "#fff",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  overflow: "auto",
                                }}
                              >
                                {JSON.stringify(
                                  {
                                    fileId: selectedSubmission.fileId,
                                    fileName: selectedSubmission.fileName,
                                    fileSize: selectedSubmission.fileSize,
                                    fileType: selectedSubmission.fileType,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </details>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Show all other fields */}
                  {Object.keys(selectedSubmission)
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "firstName",
                          "lastName",
                          "email",
                          "requirement",
                          "message",
                          "status",
                          "submittedAt",
                          "createdAt",
                          "updatedAt",
                          "fileId",
                          "fileName",
                          "fileSize",
                          "fileType",
                        ].includes(key)
                    )
                    .map((key) => (
                      <div key={key} className="detail-section">
                        <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <p>{String(selectedSubmission[key])}</p>
                      </div>
                    ))}

                  <div className="detail-section">
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(selectedSubmission.id)}
                    >
                      Delete Submission
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
