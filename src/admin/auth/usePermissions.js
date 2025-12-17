import { useAuth } from "./useAuth";
import { ROLE_PERMISSIONS, ROLE } from "./roleConfig";

/**
 * Hook to get current user's permissions
 * @returns {Object} Permission object with canDelete, canCreate, canEdit, etc.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || ROLE.SUB_ADMIN;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLE.SUB_ADMIN];

  return {
    role,
    canDelete: permissions.canDelete || false,
    canCreate: true, // All roles can now create new items (including Sub Admin)
    canEdit: true, // All roles can edit
    canManageUsers: permissions.canManageUsers || false,
    canMigrateData: role === ROLE.SUPER_ADMIN, // Only super admin can migrate
    ...permissions,
  };
}

