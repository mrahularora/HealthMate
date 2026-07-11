const jwt = require('jsonwebtoken');

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized for this resource' });
  }

  next();
};

// Middleware to protect routes
exports.protect = (req, res, next) => {
  let token;

  // Check for token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 

  // Check for token in cookies
  if (!token && req.cookies.token) {
    token = req.cookies.token;
  }

  // If token is not found, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing. Add it to server/.env before using protected routes.');
    }

    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error('Token verification failed:', error); // Log the error for monitoring

    // Check if the error is due to token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    }

    return res.status(403).json({ message: 'Not authorized, token failed' });
  }
};
