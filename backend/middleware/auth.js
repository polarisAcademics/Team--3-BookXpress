import jwt from 'jsonwebtoken';

// Use the same JWT secret as in auth.routes.js
const JWT_SECRET = process.env.JWT_SECRET || '2c7c38fa6176b7db559c2f9e86f9b53d33125685022574386639ad43468b019dd061be65ba76e377253f2c44fcf640153686cd896f11bc30b3fe3eab3f39e3b2';

// Special middleware for login route that allows requests without token
export const authenticateLogin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);

  if (!authHeader) {
    // No token provided, allow the request to proceed
    console.log('No authorization header, proceeding with login');
    return next();
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    // No token provided, allow the request to proceed
    console.log('No token in auth header, proceeding with login');
    return next();
  }

  try {
    // Decode token without verification first to check its contents
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expired at:', new Date(decoded.exp * 1000));
      // Token expired, allow the request to proceed
      return next();
    }

    // Now verify the token
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful. User:', verified);
    
    // Add user information to the request
    req.user = {
      _id: verified.userId,  // Use userId from the token
      userId: verified.userId  // Also include userId for backward compatibility
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    
    // Token invalid, allow the request to proceed
    next();
  }
};

// Regular auth middleware for protected routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);

  if (!authHeader) {
    console.log('No authorization header');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    console.log('No token in auth header');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Decode token without verification first to check its contents
    const decoded = jwt.decode(token);
    console.log('Decoded token:', decoded);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token expired at:', new Date(decoded.exp * 1000));
      return res.status(401).json({ 
        error: 'Token expired',
        expiredAt: new Date(decoded.exp * 1000)
      });
    }

    // Now verify the token
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verification successful. User:', verified);
    
    // Add user information to the request
    req.user = {
      _id: verified.userId,  // Use userId from the token
      userId: verified.userId  // Also include userId for backward compatibility
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        expiredAt: error.expiredAt
      });
    }
    
    res.status(401).json({ 
      error: 'Invalid token',
      details: error.message
    });
  }
}; 