const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.cookies.token; 
  if (!token) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.user.id);
    next(); // Call the next middleware or route handler
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};

// authMiddleware.js
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: 'Admin access required' });
  }
};

module.exports = auth;
