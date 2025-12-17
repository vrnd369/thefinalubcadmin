import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ROLE } from "../auth/roleConfig";

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const role = user?.role || ROLE.SUB_ADMIN;
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return (
      <Navigate
        to={`/unauthorized?from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}

