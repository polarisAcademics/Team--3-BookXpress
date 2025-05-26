import jwt from 'jsonwebtoken';
import User from './models/user.model.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '2c7c38fa6176b7db559c2f9e86f9b53d33125685022574386639ad43468b019dd061be65ba76e377253f2c44fcf640153686cd896f11bc30b3fe3eab3f39e3b2');
    req.user = { id: decoded.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default auth; 