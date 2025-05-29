import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/live-status', label: 'Train Routes' },
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
              <span className={`font-semibold text-xl ${isDarkMode ? 'text-white' : 'text-black'}`}>BookXpress</span>
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
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-[#2a3147] hover:text-white'
                      : 'text-black hover:bg-gray-200 hover:text-gray-800'
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
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#4a6cf7] flex items-center justify-center">
                      <i className="fas fa-user text-white"></i>
                    </div>
                  )}
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`}>{user.name}</span>
                  <i className={`fas fa-chevron-${isProfileMenuOpen ? 'up' : 'down'} text-sm`}></i>
                </button>

                {isProfileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-black' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50`}>
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-[#2a3147] hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-black'}`}
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-500 hover:bg-[#2a3147] hover:text-red-400' : 'text-red-600 hover:bg-gray-200 hover:text-red-700'}`}
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-[#2a3147] hover:text-white'
                    : 'text-black hover:bg-gray-200 hover:text-gray-800'
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
              <div className="flex items-center space-x-2 mb-2">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#4a6cf7] flex items-center justify-center">
                    <i className="fas fa-user text-white"></i>
                  </div>
                )}
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-black'}`}>{user.name}</span>
              </div>
              <Link
                to="/settings"
                className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-[#2a3147] hover:text-white' : 'text-gray-700 hover:bg-gray-200 hover:text-black'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-cog mr-2"></i>
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-500 hover:bg-[#2a3147] hover:text-red-400' : 'text-red-600 hover:bg-gray-200 hover:text-red-700'}`}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
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
