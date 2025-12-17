import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/admin-global.css";

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = new URLSearchParams(location.search).get("from") || "/";

  return (
    <div className="login-page">
      <div className="login-card admin-card">
        <h1 className="admin-heading-2">Unauthorized</h1>
        <p className="admin-text-sm admin-mb-md">
          You do not have permission to access {from}.
        </p>
        <div className="admin-flex admin-gap-sm">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Switch Role
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

