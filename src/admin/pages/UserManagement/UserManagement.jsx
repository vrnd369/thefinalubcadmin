import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../../services/userService";
import { useAuth } from "../../auth/useAuth";
import { ROLE } from "../../auth/roleConfig";
import { useAuditLog } from "../../hooks/useAuditLog";
import "./UserManagement.css";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { logCreate, logUpdate, logDelete } = useAuditLog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLE.ADMIN,
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Password validation function
  const validatePassword = (password) => {
    if (!password || password.trim().length === 0) {
      return { valid: false, error: "Password is required." };
    }

    const pwd = password.trim();

    if (pwd.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters long (12+ recommended for better security)." };
    }

    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, error: "Password must contain at least one uppercase letter." };
    }

    if (!/[a-z]/.test(pwd)) {
      return { valid: false, error: "Password must contain at least one lowercase letter." };
    }

    if (!/[0-9]/.test(pwd)) {
      return { valid: false, error: "Password must contain at least one number." };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) {
      return { valid: false, error: "Password must contain at least one special character (!@#$%^&*...)." };
    }

    return { valid: true, error: null };
  };

  // Calculate password strength
  const getPasswordStrength = (password) => {
    if (!password || password.length === 0) return { strength: 0, label: "", color: "" };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      long: password.length >= 12,
    };

    strength += checks.length ? 1 : 0;
    strength += checks.uppercase ? 1 : 0;
    strength += checks.lowercase ? 1 : 0;
    strength += checks.number ? 1 : 0;
    strength += checks.special ? 1 : 0;
    strength += checks.long ? 1 : 0;

    if (strength <= 2) return { strength, label: "Weak", color: "#dc2626" };
    if (strength <= 4) return { strength, label: "Medium", color: "#f59e0b" };
    if (strength <= 5) return { strength, label: "Good", color: "#3b82f6" };
    return { strength, label: "Strong", color: "#10b981" };
  };

  // Get password requirements checklist
  const getPasswordRequirements = (password) => {
    if (!password) password = "";
    const requirements = [
      {
        text: "At least 8 characters long (12+ recommended for better security)",
        met: password.length >= 8,
        recommended: password.length >= 12,
      },
      {
        text: "At least one uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        text: "At least one lowercase letter (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        text: "At least one number (0-9)",
        met: /[0-9]/.test(password),
      },
      {
        text: "At least one special character (!@#$%^&*...)",
        met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      },
    ];
    
    // Add bonus requirement for 12+ characters
    if (password.length > 0) {
      requirements.push({
        text: "12+ characters (recommended for maximum security)",
        met: password.length >= 12,
        bonus: true,
      });
    }
    
    return requirements;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: ROLE.ADMIN,
      isActive: true,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (user) => {
    // Prevent non-Super Admins from editing Super Admin users
    if (user.role === ROLE.SUPER_ADMIN && currentUser?.role !== ROLE.SUPER_ADMIN) {
      setError("Only Super Admin can edit Super Admin accounts.");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
      role: user.role || ROLE.ADMIN,
      isActive: user.isActive !== false,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }

    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === ROLE.SUPER_ADMIN && currentUser?.role !== ROLE.SUPER_ADMIN) {
      setError("Only Super Admin can delete Super Admin accounts.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this admin user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const userToDelete = users.find(u => u.id === id);
      const userName = userToDelete ? (userToDelete.name || userToDelete.email) : `User (ID: ${id})`;
      await deleteAdminUser(id);
      await logDelete("users", `User: ${userName}`, id);
      setSuccess("User deleted successfully!");
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    // Only Super Admin can create/edit Super Admin users
    if (formData.role === ROLE.SUPER_ADMIN && currentUser?.role !== ROLE.SUPER_ADMIN) {
      setError("Only Super Admin can create or edit Super Admin accounts.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Password is required for new users.");
      return;
    }

    // Validate password strength if provided
    if (formData.password && formData.password.trim()) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.error);
        return;
      }
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          isActive: formData.isActive,
        };

        // Only update password if provided
        if (formData.password.trim()) {
          updateData.password = formData.password.trim(); // Trim password to avoid whitespace issues
        }

        await updateAdminUser(editingUser.id, updateData);
        await logUpdate("users", `User: ${updateData.name || updateData.email || editingUser.email}`, editingUser.id);
        setSuccess("User updated successfully!");
      } else {
        // Create new user
        const newUser = await createAdminUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(), // Trim password to avoid whitespace issues
          role: formData.role,
          isActive: formData.isActive,
          createdBy: currentUser?.email || currentUser?.id || null,
        });
        await logCreate("users", `User: ${formData.name.trim() || formData.email.trim()} (${formData.role})`, newUser.id);
        setSuccess("User created successfully!");
      }

      await fetchUsers();
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: ROLE.ADMIN,
        isActive: true,
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.message || "Failed to save user. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: ROLE.ADMIN,
      isActive: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleToggleActive = async (user) => {
    if (user.id === currentUser?.id) {
      setError("You cannot deactivate your own account.");
      return;
    }

    if (user.role === ROLE.SUPER_ADMIN && currentUser?.role !== ROLE.SUPER_ADMIN) {
      setError("Only Super Admin can deactivate Super Admin accounts.");
      return;
    }

    try {
      await updateAdminUser(user.id, { isActive: !user.isActive });
      setSuccess(
        `User ${user.isActive ? "deactivated" : "activated"} successfully!`
      );
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError(err.message || "Failed to update user status.");
      setTimeout(() => setError(null), 5000);
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
        return role;
    }
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

  return (
    <AdminLayout currentPage="user-management">
      <div className="user-management">
        <div className="user-management-header">
          <div>
            <h1 className="admin-heading-1">User Management</h1>
            <p className="admin-text-sm admin-mt-sm">
              {currentUser?.role === ROLE.SUPER_ADMIN
                ? "Create and manage Super Admin, Admin, and Sub Admin accounts. Only Super Admin can access this page."
                : "Create and manage Admin and Sub Admin accounts. Only Super Admin can access this page."}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="admin-btn admin-btn-primary"
            disabled={showForm}
          >
            + Create New User
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="admin-alert admin-alert-success">{success}</div>
        )}
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {/* User Form */}
        {showForm && (
          <div className="user-form-container admin-card">
            <h2 className="admin-heading-2">
              {editingUser ? "Edit User" : "Create New User"}
            </h2>
            <form onSubmit={handleSave} className="user-form">
              <div className="form-group">
                <label className="admin-label">
                  Name (Optional)
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="admin-input"
                    placeholder="John Doe"
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="admin-label">
                  Email *
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="admin-input"
                    placeholder="user@example.com"
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="admin-label">
                  {editingUser ? "New Password (leave empty to keep current)" : "Password *"}
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="admin-input"
                    placeholder={editingUser ? "Enter new password" : "Min 8 chars (12+ recommended): Aa1@..."}
                    required={!editingUser}
                    minLength={editingUser ? 0 : 8}
                  />
                </label>
                {formData.password && formData.password.length > 0 && (
                  <div style={{ marginTop: "8px", marginBottom: "8px" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: "500",
                      marginBottom: "8px"
                    }}>
                      <span>Strength:</span>
                      <span style={{ 
                        color: getPasswordStrength(formData.password).color,
                        fontWeight: "600"
                      }}>
                        {getPasswordStrength(formData.password).label}
                      </span>
                      <div style={{
                        flex: 1,
                        height: "4px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "2px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${(getPasswordStrength(formData.password).strength / 6) * 100}%`,
                          height: "100%",
                          backgroundColor: getPasswordStrength(formData.password).color,
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      fontSize: "12px"
                    }}>
                      <div style={{ fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
                        Password Requirements:
                      </div>
                      {getPasswordRequirements(formData.password).map((req, index) => (
                        <div 
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "4px",
                            color: req.met ? "#10b981" : req.bonus ? "#3b82f6" : "#6b7280"
                          }}
                        >
                          <span style={{ fontSize: "14px" }}>
                            {req.met ? "✓" : req.bonus ? "★" : "○"}
                          </span>
                          <span style={{
                            textDecoration: req.met ? "none" : "none",
                            fontWeight: req.met ? "500" : req.bonus ? "500" : "400",
                            fontStyle: req.bonus && !req.met ? "italic" : "normal"
                          }}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <small className="form-hint">
                  {editingUser ? (
                    <>
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Leave empty to keep the current password</strong>
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <strong>If changing password, it must meet all requirements (12+ characters recommended for better security):</strong>
                        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                          <li>At least 8 characters long (12+ recommended)</li>
                          <li>At least one uppercase letter (A-Z)</li>
                          <li>At least one lowercase letter (a-z)</li>
                          <li>At least one number (0-9)</li>
                          <li>At least one special character (!@#$%^&*...)</li>
                          <li style={{ color: "#3b82f6", fontWeight: "500" }}>★ 12+ characters for maximum security (recommended)</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>Password must meet all requirements (12+ characters recommended for better security):</strong>
                      <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                        <li>At least 8 characters long (12+ recommended)</li>
                        <li>At least one uppercase letter (A-Z)</li>
                        <li>At least one lowercase letter (a-z)</li>
                        <li>At least one number (0-9)</li>
                        <li>At least one special character (!@#$%^&*...)</li>
                        <li style={{ color: "#3b82f6", fontWeight: "500" }}>★ 12+ characters for maximum security (recommended)</li>
                      </ul>
                    </>
                  )}
                </small>
              </div>

              <div className="form-group">
                <label className="admin-label">
                  Role *
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="admin-select"
                    required
                  >
                    {currentUser?.role === ROLE.SUPER_ADMIN && (
                      <option value={ROLE.SUPER_ADMIN}>Super Admin</option>
                    )}
                    <option value={ROLE.ADMIN}>Admin</option>
                    <option value={ROLE.SUB_ADMIN}>Sub Admin</option>
                  </select>
                </label>
                <small className="form-hint">
                  {currentUser?.role === ROLE.SUPER_ADMIN
                    ? "Super Admin can create Super Admin, Admin, and Sub Admin accounts."
                    : "Only Super Admin can create Super Admin accounts."}
                </small>
              </div>

              <div className="form-group">
                <label className="admin-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span>Active (User can login)</span>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading users...</p>
          </div>
        ) : (
          <div className="users-list">
            {users.length === 0 ? (
              <div className="admin-empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Users Yet</h3>
                <p className="admin-text-sm admin-mt-sm">
                  Create your first admin user to get started.
                </p>
              </div>
            ) : (
              <div className="users-grid">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="user-card admin-card">
                    <div className="user-card-header">
                      <div>
                        <h3 className="user-card-name">
                          {user.name || user.email}
                        </h3>
                        <p className="user-card-email">{user.email}</p>
                        <div
                          className="user-role-badge"
                          style={{
                            backgroundColor: getRoleBadgeColor(user.role),
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block",
                            marginTop: "8px",
                          }}
                        >
                          {getRoleLabel(user.role)}
                        </div>
                      </div>
                      <div className="user-status">
                        {user.isActive ? (
                          <span className="user-status-active">● Active</span>
                        ) : (
                          <span className="user-status-inactive">
                            ● Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="user-card-meta">
                      <div className="user-meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">
                          {user.createdAt?.toDate
                            ? new Date(user.createdAt.toDate()).toLocaleDateString()
                            : user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {user.createdBy && (
                        <div className="user-meta-item">
                          <span className="meta-label">Created by:</span>
                          <span className="meta-value">{user.createdBy}</span>
                        </div>
                      )}
                    </div>

                    <div className="user-card-actions">
                      <button
                        onClick={() => handleEdit(user)}
                        className="admin-btn admin-btn-secondary"
                        disabled={
                          user.role === ROLE.SUPER_ADMIN &&
                          currentUser?.role !== ROLE.SUPER_ADMIN
                        }
                        title={
                          user.role === ROLE.SUPER_ADMIN &&
                          currentUser?.role !== ROLE.SUPER_ADMIN
                            ? "Only Super Admin can edit Super Admin accounts"
                            : ""
                        }
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="admin-btn admin-btn-secondary"
                        disabled={
                          user.id === currentUser?.id ||
                          (user.role === ROLE.SUPER_ADMIN &&
                            currentUser?.role !== ROLE.SUPER_ADMIN)
                        }
                        title={
                          user.id === currentUser?.id
                            ? "Cannot deactivate your own account"
                            : user.role === ROLE.SUPER_ADMIN &&
                              currentUser?.role !== ROLE.SUPER_ADMIN
                            ? "Only Super Admin can deactivate Super Admin accounts"
                            : ""
                        }
                      >
                        {user.isActive ? "👁️‍🗨️ Deactivate" : "👁️ Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="admin-btn admin-btn-danger"
                        disabled={
                          user.id === currentUser?.id ||
                          (user.role === ROLE.SUPER_ADMIN &&
                            currentUser?.role !== ROLE.SUPER_ADMIN)
                        }
                        title={
                          user.id === currentUser?.id
                            ? "Cannot delete your own account"
                            : user.role === ROLE.SUPER_ADMIN &&
                              currentUser?.role !== ROLE.SUPER_ADMIN
                            ? "Only Super Admin can delete Super Admin accounts"
                            : ""
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

