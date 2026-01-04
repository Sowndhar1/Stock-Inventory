const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Allow "test" token for development
    if (token === 'test') {
      // Create a mock user for development
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        role: 'admin',
        storeName: 'Test Store'
      };
      req.token = token;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied.' });
  }
};

// Sales staff authorization (admin or sales role)
const salesAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'sales') {
        return res.status(403).json({ error: 'Access denied. Sales privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied.' });
  }
};

// Inventory staff authorization (admin or inventory role)
const inventoryAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'inventory') {
        return res.status(403).json({ error: 'Access denied. Inventory privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied.' });
  }
};

// Check if user has any of the specified roles
const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ 
            error: `Access denied. Required roles: ${roles.join(', ')}` 
          });
        }
        next();
      });
    } catch (error) {
      res.status(403).json({ error: 'Access denied.' });
    }
  };
};

module.exports = { auth, adminAuth, salesAuth, inventoryAuth, hasRole };