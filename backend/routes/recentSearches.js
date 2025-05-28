import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Use the same JWT secret as in auth.routes.js
const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGFyc2hpdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODMyOTQxNn0.YP1jIFH38LEkEdXailiPB_EZzKpcixQcLqxODG0Bb7c';

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