export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    // Super Admins have all access
    if (req.user.role === 'SUPER_ADMIN') return next();
    
    // Gym Owners (Tenants) have no 'role' specified in their token, they have full access
    if (!req.user.role) return next();

    // Staff access check
    if (req.user.role === 'STAFF') {
      const perms = req.user.permissions || [];
      if (!perms.includes(requiredPermission)) {
        return res.status(403).json({ error: `Access Denied. Missing clearance: ${requiredPermission}` });
      }
      return next();
    }

    // Default deny for Members, Trainers attempting to hit protected admin endpoints
    return res.status(403).json({ error: "Access Denied. Insufficient privileges." });
  };
};

export const requireGymOwner = (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') return next();
  if (!req.user.role) return next();
  return res.status(403).json({ error: "Access Denied. Only Gym Owners can perform this action." });
};
