import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { getAuditLogs, getLoginStats } from "../../services/auditLogService";
import { useAuth } from "../../auth/useAuth";
import { ROLE } from "../../auth/roleConfig";
import "./AuditLogs.css";

export default function AuditLogs() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "all", // 'all', 'login', 'logout', 'create', 'update', 'delete'
    role: "all", // 'all', 'super_admin', 'admin', 'sub_admin'
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {};

      // Apply role filter based on current user's role
      if (currentUser?.role === ROLE.SUPER_ADMIN) {
        // Super Admin can see all roles
        if (filters.role !== "all") {
          filterParams.role = filters.role;
        }
      } else if (currentUser?.role === ROLE.ADMIN) {
        // Admin can only see sub_admin logs
        filterParams.role = ROLE.SUB_ADMIN;
      } else {
        // Sub Admin cannot access this page (should be protected by route)
        setError("You don't have permission to view audit logs.");
        setLoading(false);
        return;
      }

      // Apply type filter
      if (filters.type !== "all") {
        filterParams.type = filters.type;
      }

      // Apply date filters
      if (filters.startDate) {
        filterParams.startDate = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filterParams.endDate = endDate;
      }

      const data = await getAuditLogs(filterParams);
      setLogs(data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const filterParams = {};

      // Apply role filter based on current user's role
      if (currentUser?.role === ROLE.SUPER_ADMIN) {
        if (filters.role !== "all") {
          filterParams.role = filters.role;
        }
      } else if (currentUser?.role === ROLE.ADMIN) {
        filterParams.role = ROLE.SUB_ADMIN;
      }

      const data = await getLoginStats(filterParams);
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Don't show error for stats, just log it
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLE.SUPER_ADMIN:
        return "#dc2626"; // red
      case ROLE.ADMIN:
        return "#2563eb"; // blue
      case ROLE.SUB_ADMIN:
        return "#059669"; // green
      default:
        return "#64748b"; // gray
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLE.SUPER_ADMIN:
        return "Super Admin";
      case ROLE.ADMIN:
        return "Admin";
      case ROLE.SUB_ADMIN:
        return "Sub Admin";
      default:
        return role || "Unknown";
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "login":
        return "🔓";
      case "logout":
        return "🔒";
      case "create":
        return "➕";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      default:
        return "📝";
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "login":
        return "#10b981"; // green
      case "logout":
        return "#ef4444"; // red
      case "create":
        return "#3b82f6"; // blue
      case "update":
        return "#f59e0b"; // amber
      case "delete":
        return "#dc2626"; // red
      default:
        return "#64748b"; // gray
    }
  };

  return (
    <AdminLayout currentPage="audit-logs">
      <div className="audit-logs">
        <div className="audit-logs-header">
          <div>
            <h1 className="admin-heading-1">Audit Logs</h1>
            <p className="admin-text-sm admin-mt-sm">
              {currentUser?.role === ROLE.SUPER_ADMIN
                ? "View login and activity logs for all admin users."
                : "View login logs for Sub Admin users."}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="audit-stats-grid">
            <div className="stat-card admin-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalLogins}</div>
                <div className="stat-label">Total Logins</div>
              </div>
            </div>
            {Object.entries(stats.byRole).map(([role, count]) => (
              <div key={role} className="stat-card admin-card">
                <div className="stat-icon">👤</div>
                <div className="stat-content">
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{getRoleLabel(role)} Logins</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="audit-filters admin-card">
          <h2 className="admin-heading-3">Filters</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="admin-label">Event Type</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="admin-select"
              >
                <option value="all">All Events</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create Operations</option>
                <option value="update">Update Operations</option>
                <option value="delete">Delete Operations</option>
              </select>
            </div>

            {currentUser?.role === ROLE.SUPER_ADMIN && (
              <div className="filter-group">
                <label className="admin-label">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value })
                  }
                  className="admin-select"
                >
                  <option value="all">All Roles</option>
                  <option value={ROLE.SUPER_ADMIN}>Super Admin</option>
                  <option value={ROLE.ADMIN}>Admin</option>
                  <option value={ROLE.SUB_ADMIN}>Sub Admin</option>
                </select>
              </div>
            )}

            <div className="filter-group">
              <label className="admin-label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="admin-input"
              />
            </div>

            <div className="filter-group">
              <label className="admin-label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="admin-input"
              />
            </div>

            <div className="filter-group">
              <button
                onClick={() =>
                  setFilters({
                    type: "all",
                    role: "all",
                    startDate: "",
                    endDate: "",
                  })
                }
                className="admin-btn admin-btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="admin-alert admin-alert-error">{error}</div>
        ) : (
          <div className="audit-logs-table admin-card">
            <div className="table-header">
              <h2 className="admin-heading-3">
                Logs ({logs.length} {logs.length === 1 ? "entry" : "entries"})
              </h2>
            </div>

            {logs.length === 0 ? (
              <div className="admin-empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Logs Found</h3>
                <p className="admin-text-sm admin-mt-sm">
                  No audit logs match your current filters.
                </p>
              </div>
            ) : (
              <div className="logs-container">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="log-time">{formatDate(log.timestamp || log.createdAt)}</td>
                        <td>
                          <span
                            className="event-badge"
                            style={{
                              backgroundColor: getEventColor(log.type),
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {getEventIcon(log.type)} {log.type?.toUpperCase() || "Unknown"}
                          </span>
                        </td>
                        <td className="log-user">
                          {log.name || "N/A"}
                        </td>
                        <td>
                          <span
                            className="role-badge"
                            style={{
                              backgroundColor: getRoleBadgeColor(log.role),
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {getRoleLabel(log.role)}
                          </span>
                        </td>
                        <td className="log-details">
                          {log.module && (
                            <div style={{ fontSize: "11px", color: "var(--admin-text-light)", marginBottom: "2px" }}>
                              <strong>Module:</strong> {log.module}
                            </div>
                          )}
                          {log.itemName && (
                            <div style={{ fontSize: "12px", color: "var(--admin-text)" }}>
                              {log.itemName}
                            </div>
                          )}
                          {!log.module && !log.itemName && "N/A"}
                        </td>
                        <td className="log-email">{log.email || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

