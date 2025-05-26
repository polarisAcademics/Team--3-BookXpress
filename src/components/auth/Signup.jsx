import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const { confirmPassword, ...signupData } = formData;
        await authService.signup(signupData);
        // Optionally, show a success message here
        navigate('/login'); // Redirect to login after successful signup
      } catch (error) {
        setGeneralError(error.message || 'Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOAuthSignup = async (provider) => {
    try {
      if (provider === 'google') {
        await authService.googleAuth();
      } else if (provider === 'github') {
        await authService.githubAuth();
      }
    } catch (error) {
      setGeneralError(`Failed to sign up with ${provider}. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-theme-secondary p-8 rounded-lg shadow-xl">
        <div>
          <div className="flex justify-center items-center">
            <i className="fas fa-train text-[var(--accent-color)] text-3xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-theme-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-theme-secondary">
            Or{' '}
            <a href="/login" className="font-medium text-[var(--accent-color)] hover:text-[var(--accent-hover)]">
              sign in to your account
            </a>
          </p>
        </div>

        {generalError && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{generalError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#2a3147] text-white placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-[#4a6cf7] focus:border-[#4a6cf7] focus:z-10 sm:text-sm"
                placeholder="Full Name"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#2a3147] text-white placeholder-gray-500 focus:outline-none focus:ring-[#4a6cf7] focus:border-[#4a6cf7] focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#2a3147] text-white placeholder-gray-500 focus:outline-none focus:ring-[#4a6cf7] focus:border-[#4a6cf7] focus:z-10 sm:text-sm"
                placeholder="Password"
                disabled={loading}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#2a3147] text-white placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-[#4a6cf7] focus:border-[#4a6cf7] focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4a6cf7] hover:bg-[#3b63f7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a6cf7] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1e2535] text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignup('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-[#2a3147] text-sm font-medium text-gray-400 hover:bg-[#343e57] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <i className="fab fa-google mr-2"></i>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignup('github')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-[#2a3147] text-sm font-medium text-gray-400 hover:bg-[#343e57] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <i className="fab fa-github mr-2"></i>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup; 