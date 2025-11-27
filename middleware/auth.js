const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Check multiple possible token locations
    const token = 
      req.header('x-auth-token') || 
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found in request headers');
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Handle both payload structures: { user: { id } } or { id }
    req.user = decoded.user || decoded;
    
    console.log('Auth successful for user ID:', req.user.id);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;