import React from "react";
function Footer() {
  return (
    <footer className="bg-[#1e2535] text-white text-sm px-4 sm:px-6 lg:px-16 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Logo and Description */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <i className="fas fa-train text-[#4a6cf7] text-lg" aria-hidden="true"></i>
            <span className="font-semibold">BookXpress</span>
          </div>
          <p className="text-white/70 text-xs max-w-[220px]">
            Your trusted partner for hassle-free train bookings across the country.
          </p>
          <div className="flex space-x-4 mt-4 text-white/70">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <i className="fab fa-facebook-f" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <i className="fab fa-twitter" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white">
              <i className="fab fa-instagram" aria-hidden="true"></i>
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-white">
              <i className="fab fa-youtube" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h6 className="font-semibold mb-3">Quick Links</h6>
          <ul className="space-y-2 text-white/70">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">My Bookings</a></li>
            <li><a href="#" className="hover:text-white">PNR Status</a></li>
            <li><a href="#" className="hover:text-white">Cancellations</a></li>
            <li><a href="#" className="hover:text-white">Refunds</a></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h6 className="font-semibold mb-3">Information</h6>
          <ul className="space-y-2 text-white/70">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">FAQs</a></li>
          </ul>
        </div>

        {/* App Download Info */}
        <div>
          <h6 className="font-semibold mb-3">Download Our App</h6>
          <p className="text-white/70 text-xs max-w-[220px]">
            Book tickets, check PNR status, and get instant updates on your mobile.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
