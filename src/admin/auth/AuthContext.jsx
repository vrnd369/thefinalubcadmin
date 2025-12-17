import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ROLE, getBasePathForRole } from "./roleConfig";

const AuthContext = createContext(null);
const STORAGE_KEY = "ubc-admin-auth";

const defaultUser = null;

// Initialize user from localStorage immediately (synchronous)
function getInitialUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.role) return parsed;
    }
  } catch (err) {
    console.error("AuthProvider: failed to load saved session", err);
  }
  return defaultUser;
}

export function AuthProvider({ children }) {
  // Use lazy initialization - React will call getInitialUser only on mount
  const [user, setUser] = useState(() => getInitialUser());

  // Keep localStorage in sync (optional, for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.role) setUser(parsed);
          } else {
            setUser(defaultUser);
          }
        } catch (err) {
          console.error("AuthProvider: failed to sync from storage", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (role, profile = {}) => {
    const normalizedRole = role || ROLE.SUB_ADMIN;
    const nextUser = { role: normalizedRole, ...profile };
    // Update localStorage first, then state to ensure consistency
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    
    // Log login event
    try {
      const { logLogin } = await import("../services/auditLogService");
      await logLogin(nextUser);
    } catch (err) {
      console.error("Failed to log login event:", err);
      // Don't block login if audit logging fails
    }
  }, []);

  const logout = useCallback(async () => {
    // Log logout event before clearing user
    if (user) {
      try {
        const { logLogout } = await import("../services/auditLogService");
        await logLogout(user);
      } catch (err) {
        console.error("Failed to log logout event:", err);
        // Don't block logout if audit logging fails
      }
    }
    setUser(defaultUser);
    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.role),
      login,
      logout,
      basePath: getBasePathForRole(user?.role),
    }),
    [user, logout, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

