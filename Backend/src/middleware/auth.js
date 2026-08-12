const { verifyToken } = require('../utils/jwt');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, email, verificationStatus (optional) }
    next();
  } catch (err) {
    return res.status(403).json({
      status: 'fail',
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = { authenticateJWT };