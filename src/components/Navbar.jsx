import React from 'react';

function Navbar() {
  return (
    <nav className="bg-[#1e2535] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <i className="fas fa-train text-[#4a6cf7] text-lg" aria-hidden="true"></i>
        <span className="font-semibold text-white text-sm sm:text-base">BookXpress</span>
      </div>

      {/* Navigation Links */}
      <ul className="hidden md:flex space-x-8 text-xs sm:text-sm text-white/80 font-normal">
        <li><a href="#" className="hover:text-white" aria-label="Go to Home page">Home</a></li>
        <li><a href="#" className="hover:text-white" aria-label="View your bookings">My Bookings</a></li>
        <li><a href="#" className="hover:text-white" aria-label="Go to Profile">Profile</a></li>
        <li><a href="#" className="hover:text-white" aria-label="Contact Support">Support</a></li>
      </ul>

      {/* Actions: Dark mode, Login, Register */}
      <div className="flex items-center space-x-4 text-xs sm:text-sm">
        <button
          aria-label="Toggle dark mode"
          className="text-white/80 hover:text-white"
        >
          <i className="fas fa-sun" aria-hidden="true"></i>
        </button>
        <a href="#" className="text-white/80 hover:text-white" aria-label="Login to your account">
          Login
        </a>
        <a
          href="#"
          className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-3 py-1 text-white text-xs sm:text-sm font-semibold"
          aria-label="Register a new account"
        >
          Register
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
