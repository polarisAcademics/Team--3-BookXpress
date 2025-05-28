import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Define a consistent JWT secret
const JWT_SECRET = '2c7c38fa6176b7db559c2f9e86f9b53d33125685022574386639ad43468b019dd061be65ba76e377253f2c44fcf640153686cd896f11bc30b3fe3eab3f39e3b2';

// Simple JWT authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

// Get recent searches for logged-in user
router.get('/', authenticate, async (req, res) => {
  if (!req.user) {
    return res.json([]); // Return empty array for unauthenticated users
  }
  
  const user = await User.findById(req.user.id);
  if (!user) return res.json([]); // Return empty array if user not found
  
  res.json(user.recentSearches.slice(-10).reverse());
});

// Add a recent search for logged-in user
router.post('/', authenticate, async (req, res) => {
  if (!req.user) {
    return res.json({ success: true }); // Silently succeed for unauthenticated users
  }
  
  const { from, to, date } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.json({ success: true }); // Silently succeed if user not found
  
  user.recentSearches.push({ from, to, date });
  if (user.recentSearches.length > 10) user.recentSearches = user.recentSearches.slice(-10);
  await user.save();
  res.json({ success: true });
});

export default router; 