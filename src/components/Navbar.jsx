import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/live-status', label: 'Live Train Status' },
    { path: '/book-tickets', label: 'Book Tickets' },
    { path: '/my-bookings', label: 'My Bookings' },
  ];

  return (
    <nav className="bg-theme-secondary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <i className="fas fa-train text-[#4a6cf7] text-2xl mr-2"></i>
              <span className="text-white font-semibold text-xl">BookXpress</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-[#4a6cf7] text-white'
                    : 'text-gray-300 hover:bg-[#2a3147] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-300 hover:bg-[#2a3147] hover:text-white transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-yellow-400"></i>
              ) : (
                <i className="fas fa-moon text-gray-400"></i>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center ml-4">
                <span className="text-gray-300 mr-4">
                  <i className="fas fa-user mr-2"></i>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center ml-4 space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:bg-[#2a3147] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#4a6cf7] hover:bg-[#3b63f7] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <i className={`fas fa-${isMobileMenuOpen ? 'times' : 'bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1e2535] pb-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-[#4a6cf7] text-white'
                  : 'text-gray-300 hover:bg-[#2a3147] hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Theme Toggle Button in Mobile Menu */}
          <button
            onClick={toggleTheme}
            className="w-full px-4 py-2 text-left text-sm font-medium text-gray-300 hover:bg-[#2a3147] hover:text-white"
          >
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} mr-2`}></i>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          {user ? (
            <div className="px-4 py-2">
              <div className="text-gray-300 mb-2">
                <i className="fas fa-user mr-2"></i>
                {user.name}
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 space-y-2">
              <Link
                to="/login"
                className="block text-gray-300 hover:bg-[#2a3147] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block bg-[#4a6cf7] hover:bg-[#3b63f7] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
