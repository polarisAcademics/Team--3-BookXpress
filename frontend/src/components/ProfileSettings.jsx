import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function ProfileSettings() {
    console.log('ProfileSettings component rendering');
    const { user, updateUser } = useAuth();
    const { isDarkMode } = useTheme();
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [profileMsg, setProfileMsg] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);

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

    return (
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
    );
}

export default ProfileSettings; 