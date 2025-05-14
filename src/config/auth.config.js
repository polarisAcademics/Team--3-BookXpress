export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: import.meta.env.VITE_JWT_SECRET || 'your-secret-key', // Replace with a secure secret key in production
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
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
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