import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { useTheme } from '../context/ThemeContext';
import ProfileSettings from './ProfileSettings'; // Import new components
import PasswordSettings from './PasswordSettings';
import TravellerSettings from './TravellerSettings';

function Settings() {
  console.log('Settings component rendering');
  const { isDarkMode } = useTheme();
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Get navigate function

  // Determine the active section based on the hash in the URL
  const [activeSection, setActiveSection] = useState('#profile'); // Default to profile

  useEffect(() => {
    if (location.hash) {
      setActiveSection(location.hash);
    } else {
      // If no hash, redirect to #profile
       navigate('#profile', { replace: true });
    }
  }, [location.hash, navigate]); // Update active section when hash changes

  // Function to render the active section component
  const renderSection = () => {
    switch (activeSection) {
      case '#profile':
        return <ProfileSettings />;
      case '#password':
        return <PasswordSettings />;
      case '#travellers':
        return <TravellerSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      {console.log('Rendering Settings JSX', { activeSection })}

      {/* Left-hand navigation menu */}
      <div className={`md:w-1/4 rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-[#1e2535]' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Settings Menu</h2>
        <nav>
          <ul>
            <li>
              <a
                href="#profile"
                onClick={() => setActiveSection('#profile')}
                className={`block py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeSection === '#profile'
                    ? 'bg-[#4a6cf7] text-white'
                    : `${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                }`}
              >
                Profile Information
              </a>
            </li>
            <li className="mt-2">
              <a
                href="#password"
                onClick={() => setActiveSection('#password')}
                className={`block py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeSection === '#password'
                    ? 'bg-[#4a6cf7] text-white'
                    : `${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                }`}
              >
                Change Password
              </a>
            </li>
            <li className="mt-2">
              <a
                href="#travellers"
                onClick={() => setActiveSection('#travellers')}
                className={`block py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeSection === '#travellers'
                    ? 'bg-[#4a6cf7] text-white'
                    : `${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                }`}
              >
                Traveller List
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Right-hand content area */}
      <div className="md:w-3/4">
        {renderSection()}
      </div>
    </div>
  );
}

export default Settings; 