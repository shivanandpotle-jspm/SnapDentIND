/**
 * Permission-based authorization middleware.
 * Uses a role → permissions map with per-user overrides.
 */

const rolePermissions = {
  admin: [
    'product:create', 'product:view', 'product:update', 'product:delete', 'product:approve',
    'user:manage', 'vendor:manage', 'payout:manage', 'analytics:view',
  ],
  vendor: [
    'product:create', 'product:view', 'product:update',
  ],
  customer: [],
};

/**
 * Get effective permissions for a user.
 * If user.permissions array is non-empty, use it (admin-assigned overrides).
 * Otherwise fall back to the role default.
 */
export const getPermissions = (user) => {
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions;
  }
  return rolePermissions[user.role] || [];
};

/**
 * Middleware: require one of the listed roles.
 * Usage: requireRole('admin') or requireRole('admin', 'vendor')
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Insufficient role.' });
  }
  next();
};

/**
 * Middleware: require a specific permission.
 * Usage: requirePermission('product:create')
 */
export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  const perms = getPermissions(req.user);
  if (!perms.includes(permission)) {
    return res.status(403).json({ success: false, error: `Permission denied: ${permission}` });
  }
  next();
};

/**
 * All available permissions (for admin UI).
 */
export const ALL_PERMISSIONS = [
  'product:create', 'product:view', 'product:update', 'product:delete', 'product:approve',
  'user:manage', 'vendor:manage', 'payout:manage', 'analytics:view',
];

export const DEFAULT_VENDOR_PERMISSIONS = rolePermissions.vendor;
