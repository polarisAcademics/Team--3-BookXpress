export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: import.meta.env.VITE_JWT_SECRET || '2c7c38fa6176b7db559c2f9e86f9b53d33125685022574386639ad43468b019dd061be65ba76e377253f2c44fcf640153686cd896f11bc30b3fe3eab3f39e3b2', // Replace with a secure secret key in production
    expiresIn: '24h',
  },
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
    },
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback',
    },
  },
  
  // API Configuration
  api: {
    baseUrl: `https://bookxpress.onrender.com`,
    endpoints: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      logout: '/api/auth/logout',
      refreshToken: '/api/auth/refresh-token',
      googleAuth: '/api/auth/google',
      githubAuth: '/api/auth/github',
    },
  },
}; 