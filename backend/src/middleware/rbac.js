/**
 * Authorize specific roles
 * E.g., authorize('admin') or authorize('admin', 'user')
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required prior to authorization.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}

/**
 * Strict server-side check preventing read-only users from modifying any data
 */
export function preventReadOnlyMutations(req, res, next) {
  if (req.user && req.user.role === 'read-only') {
    return res.status(403).json({
      success: false,
      error: 'Read-only access: You do not have permission to create, edit, or delete financial records.'
    });
  }
  next();
}
