import { useAuth } from "../auth/useAuth";
import { logCreate, logUpdate, logDelete } from "../services/auditLogService";

/**
 * Hook to easily log audit events with current user context
 */
export function useAuditLog() {
  const { user } = useAuth();

  const logCreateOperation = async (module, itemName, itemId = null) => {
    if (!user) return;
    try {
      await logCreate(user, module, itemName, itemId);
    } catch (err) {
      console.error("Failed to log create operation:", err);
    }
  };

  const logUpdateOperation = async (module, itemName, itemId = null) => {
    if (!user) return;
    try {
      await logUpdate(user, module, itemName, itemId);
    } catch (err) {
      console.error("Failed to log update operation:", err);
    }
  };

  const logDeleteOperation = async (module, itemName, itemId = null) => {
    if (!user) return;
    try {
      await logDelete(user, module, itemName, itemId);
    } catch (err) {
      console.error("Failed to log delete operation:", err);
    }
  };

  return {
    logCreate: logCreateOperation,
    logUpdate: logUpdateOperation,
    logDelete: logDeleteOperation,
  };
}

