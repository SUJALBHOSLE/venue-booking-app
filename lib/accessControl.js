export const INITIAL_USER_ROLES = {
  'sujal.bhosle1@vsit.edu.in': { role: 'admin', name: 'Sujal Bhosle (Admin)', email: 'sujal.bhosle1@vsit.edu.in', addedAt: '2026-08-20' },
  'asif.rampurawala@vsit.edu.in': { role: 'admin', name: 'Dr. Asif Rampurawala (Admin)', email: 'asif.rampurawala@vsit.edu.in', addedAt: '2026-08-20' },
  'sujal.bhosle@vsit.edu.in': { role: 'moderator', name: 'Sujal Bhosle (Moderator)', email: 'sujal.bhosle@vsit.edu.in', addedAt: '2026-08-20' },
  'media.admin@vsit.edu.in': { role: 'moderator', name: 'Media Admin (Moderator)', email: 'media.admin@vsit.edu.in', addedAt: '2026-08-20' }
};

const ROLES_STORAGE_KEY = 'vdt_user_roles_registry';
const PROFILES_STORAGE_KEY = 'vdt_user_profiles_registry';

export const getUserRolesRegistry = () => {
  if (typeof window === 'undefined') return INITIAL_USER_ROLES;
  try {
    const saved = localStorage.getItem(ROLES_STORAGE_KEY) || sessionStorage.getItem(ROLES_STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_USER_ROLES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Error reading roles registry:", e);
  }
  return INITIAL_USER_ROLES;
};

export const saveUserRolesRegistry = (registry) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(registry);
    localStorage.setItem(ROLES_STORAGE_KEY, serialized);
    sessionStorage.setItem(ROLES_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Error saving roles registry:", e);
  }
};

export const resolveUserRole = (email) => {
  if (!email) return 'faculty';
  const cleanEmail = email.trim().toLowerCase();
  const registry = getUserRolesRegistry();
  if (registry[cleanEmail]) {
    return registry[cleanEmail].role;
  }
  return 'faculty';
};

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

export const removeUserRoleRights = (email) => {
  if (!email) return;
  const cleanEmail = email.trim().toLowerCase();
  const registry = getUserRolesRegistry();
  const updated = { ...registry };
  delete updated[cleanEmail];
  saveUserRolesRegistry(updated);
  return updated;
};

export const getAllUserProfiles = () => {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(PROFILES_STORAGE_KEY) || sessionStorage.getItem(PROFILES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading profiles registry:", e);
  }
  return {};
};

export const getUserProfile = (email) => {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const profiles = getAllUserProfiles();
  return profiles[cleanEmail] || null;
};

export const saveUserProfile = (email, profileData) => {
  if (!email || !profileData) return;
  const cleanEmail = email.trim().toLowerCase();
  const profiles = getAllUserProfiles();
  const updated = {
    ...profiles,
    [cleanEmail]: {
      ...profileData,
      email: cleanEmail,
      isCompleted: true,
      isLocked: true,
      updatedAt: new Date().toISOString()
    }
  };
  try {
    const serialized = JSON.stringify(updated);
    localStorage.setItem(PROFILES_STORAGE_KEY, serialized);
    sessionStorage.setItem(PROFILES_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Error saving profile:", e);
  }
  return updated[cleanEmail];
};

export const adminUpdateUserProfile = (email, updatedProfileData) => {
  if (!email || !updatedProfileData) return;
  const cleanEmail = email.trim().toLowerCase();
  const profiles = getAllUserProfiles();
  const updated = {
    ...profiles,
    [cleanEmail]: {
      ...profiles[cleanEmail],
      ...updatedProfileData,
      email: cleanEmail,
      updatedByAdminAt: new Date().toISOString()
    }
  };
  try {
    const serialized = JSON.stringify(updated);
    localStorage.setItem(PROFILES_STORAGE_KEY, serialized);
    sessionStorage.setItem(PROFILES_STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Error updating profile by admin:", e);
  }
  return updated;
};
