import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#1e2535] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          <i className="fas fa-train text-[#4a6cf7] text-lg" aria-hidden="true"></i>
          <span className="font-semibold text-white text-sm sm:text-base">BookXpress</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="hidden md:flex space-x-8 text-xs sm:text-sm text-white/80 font-normal">
        <li>
          <Link to="/" className="hover:text-white" aria-label="Go to Home page">
            Home
          </Link>
        </li>
        {user && (
          <>
            <li>
              <Link to="/bookings" className="hover:text-white" aria-label="View your bookings">
                My Bookings
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-white" aria-label="Go to Profile">
                Profile
              </Link>
            </li>
          </>
        )}
        <li>
          <Link to="/support" className="hover:text-white" aria-label="Contact Support">
            Support
          </Link>
        </li>
      </ul>

      {/* Actions: Dark mode, Login/Logout */}
      <div className="flex items-center space-x-4 text-xs sm:text-sm">
        <button
          aria-label="Toggle dark mode"
          className="text-white/80 hover:text-white"
        >
          <i className="fas fa-sun" aria-hidden="true"></i>
        </button>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-white/80">
              Welcome, {user.name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white"
              aria-label="Logout from your account"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-white/80 hover:text-white"
              aria-label="Login to your account"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-3 py-1 text-white text-xs sm:text-sm font-semibold"
              aria-label="Register a new account"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
