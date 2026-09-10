const db = require('../db');

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
const requireVerifiedAccount = async (req, res, next) => {
  // Students and Admins do not require manual verification
  if (req.user.role === 'student' || req.user.role === 'admin') {
    return next();
  }

  try {
    const table = req.user.role === 'property_owner' ? 'PROPERTY_OWNER' : 'MEAL_PROVIDER';
    const idCol = req.user.role === 'property_owner' ? 'owner_id' : 'provider_id';

    const result = await db.query(
      `SELECT verification_status, is_active FROM ${table} WHERE ${idCol} = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'User account not found.' });
    }

    const user = result.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({
        status: 'fail',
        message: 'Account has been suspended by an administrator.',
      });
    }

    if (user.verification_status !== 'verified') {
      return res.status(403).json({
        status: 'fail',
        message: 'Account pending admin verification. Action not allowed until approved.',
      });
    }

    req.user.verificationStatus = user.verification_status;
    next();
  } catch (err) {
    console.error('requireVerifiedAccount Error:', err);
    res.status(500).json({ status: 'error', message: 'Verification check failed.' });
  }
};

module.exports = {
  authorizeRoles,
  requireVerifiedAccount,
};