const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.body?.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Token is valid but user no longer exists.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'User account not verified.' });
    }

    // Add user info to request
    req.user = decoded;
    req.userProfile = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Server error during authentication.' });
    }
  }
};

// Optional auth middleware for routes that can work with or without authentication
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.body?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (user && user.isVerified) {
        req.user = decoded;
        req.userProfile = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin-only middleware
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token ||
                  req.body?.token;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Token is valid but user no longer exists.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'User account not verified.' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = decoded;
    req.userProfile = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else {
      console.error('Admin auth middleware error:', error);
      return res.status(500).json({ error: 'Server error during authentication.' });
    }
  }
};

module.exports = { auth, optionalAuth, adminAuth };
