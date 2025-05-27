import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Settings() {
  console.log('Settings component rendering');
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // State for password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg(''); // Clear previous messages

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('phone', profile.phone);
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('profilePicture', fileInputRef.current.files[0]);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileMsg('Not authenticated. Please log in again.');
        return;
      }

      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setProfileMsg('Profile updated successfully');
        updateUser(data.user); // Update user context
      } else {
        setProfileMsg(data.error || data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Frontend profile update error:', error);
      setProfileMsg('An unexpected error occurred.');
    }
    // Clear message after a few seconds
    setTimeout(() => setProfileMsg(''), 5000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Clear previous messages

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get the JWT token
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated. Please log in again.' });
        return;
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token
        },
        body: JSON.stringify({ currentPassword, newPassword }), // Send password data
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Display error message from backend
        setMessage({ type: 'error', text: data.error || data.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Frontend password change error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {console.log('Rendering Settings JSX')}
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>Settings</h1>
      
      {/* Profile Information Section */}
      <div className={`${isDarkMode ? 'bg-[#1e2535]' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Profile Information</h2>
        {profileMsg && (
           <div className="p-4 mb-4 rounded-md bg-green-100 text-green-700">
             {profileMsg}
           </div>
        )}
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Display Name</label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Email Address</label>
            <input
              type="email"
              id="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
              disabled // Email is typically not changeable via settings
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Phone Number</label>
            <input
              type="text"
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
            />
          </div>
          <div className="mb-4">
             <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Profile Picture</label>
             <div className="flex items-center space-x-4">
               {profileImage && (
                  <img src={profileImage} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover" />
               )}
               <button
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm"
               >
                 Change Picture
               </button>
               <input
                 type="file"
                 ref={fileInputRef}
                 onChange={handleProfileImageChange}
                 accept="image/*"
                 className="hidden"
               />
             </div>
           </div>
          <button
            type="submit"
            className="w-full bg-[#4a6cf7] hover:bg-[#3b63f7] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className={`${isDarkMode ? 'bg-[#1e2535]' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Change Password</h2>
        
        {message.text && (
          <div
            className={`p-4 mb-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label htmlFor="currentPassword" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] pr-10 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
              >
                <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="newPassword" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
              New Password
            </label>
             <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] pr-10 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
                required
              />
               <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
              >
                <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>
              Confirm New Password
            </label>
             <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a6cf7] pr-10 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}
                required
              />
               <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4a6cf7] hover:bg-[#3b63f7] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings; 