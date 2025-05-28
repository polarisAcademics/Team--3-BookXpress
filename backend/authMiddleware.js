import jwt from 'jsonwebtoken';
import User from './models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGFyc2hpdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODMyOTQxNn0.YP1jIFH38LEkEdXailiPB_EZzKpcixQcLqxODG0Bb7c';
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default auth; 