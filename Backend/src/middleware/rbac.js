// Restrict route access to specific roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Forbidden. Role '${req.user?.role}' does not have permission to perform this action.`,
      });
    }
    next();
  };
};

// Enforce that Property Owners & Meal Providers are verified by Admin
const requireVerifiedAccount = (req, res, next) => {
  // Students and Admins do not require manual verification
  if (req.user.role === 'student' || req.user.role === 'admin') {
    return next();
  }

  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({
      status: 'fail',
      message: 'Account pending admin verification. Action not allowed until approved.',
    });
  }

  next();
};

module.exports = {
  authorizeRoles,
  requireVerifiedAccount,
};