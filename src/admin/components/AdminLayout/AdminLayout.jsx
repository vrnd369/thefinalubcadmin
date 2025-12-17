import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { useAuth } from "../../auth/useAuth";
import "../../styles/admin-global.css";
import "./AdminLayout.css";

export default function AdminLayout({
  children,
  currentPage = "dashboard",
  basePath,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, basePath: roleBasePath } = useAuth();
  const resolvedBasePath = basePath || roleBasePath || "/admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <Sidebar
        currentPage={currentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        basePath={resolvedBasePath}
      />
      <div className="admin-main-content">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1 className="admin-heading-2">
              CMS Dashboard {user?.role ? `(${user.role})` : ""}
            </h1>
            <div className="admin-header-actions">
              <button
                onClick={() => navigate("/")}
                className="admin-btn admin-btn-secondary"
              >
                ← Back to Website
              </button>
              <button
                onClick={handleLogout}
                className="admin-btn admin-btn-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

