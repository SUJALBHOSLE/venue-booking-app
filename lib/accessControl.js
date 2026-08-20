/**
 * Access Control & Dynamic User Rights Management
 * Default Outlook ID mappings:
 * - Admins: sujal.bhosle1@vsit.edu.in, asif.rampurawala@vsit.edu.in
 * - Moderators: sujal.bhosle@vsit.edu.in, media.admin@vsit.edu.in
 * - Faculty: All other official institute logins
 */

export const INITIAL_USER_ROLES = {
  'sujal.bhosle1@vsit.edu.in': { role: 'admin', name: 'Sujal Bhosle (Admin)', email: 'sujal.bhosle1@vsit.edu.in', addedAt: '2026-08-20' },
  'asif.rampurawala@vsit.edu.in': { role: 'admin', name: 'Dr. Asif Rampurawala (Admin)', email: 'asif.rampurawala@vsit.edu.in', addedAt: '2026-08-20' },
  'sujal.bhosle@vsit.edu.in': { role: 'moderator', name: 'Sujal Bhosle (Moderator)', email: 'sujal.bhosle@vsit.edu.in', addedAt: '2026-08-20' },
  'media.admin@vsit.edu.in': { role: 'moderator', name: 'Media Admin (Moderator)', email: 'media.admin@vsit.edu.in', addedAt: '2026-08-20' }
};

const STORAGE_KEY = 'vdt_user_roles_registry';

/**
 * Get all registered user roles from localStorage with fallback to default roles
 */
export const getUserRolesRegistry = () => {
  if (typeof window === 'undefined') return INITIAL_USER_ROLES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_USER_ROLES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading user roles registry:", e);
  }
  return INITIAL_USER_ROLES;
};

/**
 * Save updated user roles registry
 */
export const saveUserRolesRegistry = (registry) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error("Error saving user roles registry:", e);
  }
};

/**
 * Resolve role for a given email address
 */
export const resolveUserRole = (email) => {
  if (!email) return 'faculty';
  const cleanEmail = email.trim().toLowerCase();
  const registry = getUserRolesRegistry();
  
  if (registry[cleanEmail]) {
    return registry[cleanEmail].role;
  }

  // Default to faculty for all other valid logins
  return 'faculty';
};

/**
 * Add or update a user's role in the registry (Admin action)
 */
export const setUserRoleRights = (email, role, name = '') => {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const registry = getUserRolesRegistry();
  
  const updated = {
    ...registry,
    [cleanEmail]: {
      email: cleanEmail,
      role: role.toLowerCase(),
      name: name || cleanEmail.split('@')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
  };

  saveUserRolesRegistry(updated);
  return updated;
};

/**
 * Remove custom user role rights (reverts to default)
 */
export const removeUserRoleRights = (email) => {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const registry = getUserRolesRegistry();
  
  const updated = { ...registry };
  delete updated[cleanEmail];
  
  saveUserRolesRegistry(updated);
  return updated;
};
