import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function TravellerSettings() {
    console.log('TravellerSettings component rendering');
    const { isDarkMode } = useTheme();
    // State for managing travellers
    const [travellers, setTravellers] = useState([]);
    const [newTraveller, setNewTraveller] = useState({
        name: '',
        age: '',
        gender: '',
        idProofType: '',
        phoneNumber: '',
        idNumber: '',
        seatPreference: '',
        nationality: 'Indian', // Default to Indian
    });
    const [travellerMessage, setTravellerMessage] = useState({ type: '', text: '' });

    // State for editing traveller
    const [isEditing, setIsEditing] = useState(false);
    const [currentTraveller, setCurrentTraveller] = useState(null);

    // Fetch travellers on component mount
    useEffect(() => {
        const fetchTravellers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setTravellerMessage({ type: 'error', text: 'Authentication required to fetch travellers.' });
                    return;
                }

                const res = await fetch(`${API_BASE_URL}/api/travelers`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (res.ok) {
                    setTravellers(data);
                } else {
                    setTravellerMessage({ type: 'error', text: data.error || 'Failed to fetch travellers.' });
                }
            } catch (error) {
                console.error('Error fetching travellers:', error);
                setTravellerMessage({ type: 'error', text: 'An unexpected error occurred while fetching travellers.' });
            }
        };

        fetchTravellers();
    }, []); // Empty dependency array means this runs once on mount

    // Handlers for managing travellers
    const handleAddTraveller = async (e) => {
        e.preventDefault();
        setTravellerMessage({ type: '', text: '' });

        if (!newTraveller.name.trim() || !newTraveller.age.trim() || !newTraveller.gender.trim() || !newTraveller.phoneNumber.trim()) {
            setTravellerMessage({ type: 'error', text: 'Please fill in Name, Age, Gender, and Phone Number.' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setTravellerMessage({ type: 'error', text: 'Authentication required to add traveller.' });
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/travelers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newTraveller),
            });

            const data = await res.json();

            if (res.ok) {
                setTravellers([...travellers, data]); // Add the new traveller from the backend response
                setNewTraveller({
                    name: '',
                    age: '',
                    gender: '',
                    idProofType: '',
                    phoneNumber: '',
                    idNumber: '',
                    seatPreference: '',
                    nationality: 'Indian',
                });
                setTravellerMessage({ type: 'success', text: 'Traveller added successfully!' });
            } else {
                setTravellerMessage({ type: 'error', text: data.error || 'Failed to add traveller.' });
            }
        } catch (error) {
            console.error('Error adding traveller:', error);
            setTravellerMessage({ type: 'error', text: 'An unexpected error occurred while adding traveller.' });
        }
    };

    const handleEditTraveller = (id) => {
        // Find the traveller by id
        const travellerToEdit = travellers.find(t => t._id === id); // Use _id from backend
        if (!travellerToEdit) return;

        // Set the current traveller for editing and open the modal/form
        setCurrentTraveller({ ...travellerToEdit });
        setIsEditing(true);
    };

    const handleSaveTraveller = async (updatedTraveller) => {
        setTravellerMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setTravellerMessage({ type: 'error', text: 'Authentication required to update traveller.' });
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/travelers/${updatedTraveller._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedTraveller),
            });

            const data = await res.json();

            if (res.ok) {
                // Update the travellers state with the response from the backend
                setTravellers(travellers.map(t => t._id === data._id ? data : t));
                setTravellerMessage({ type: 'success', text: 'Traveller updated successfully!' });
                setIsEditing(false); // Close the edit form/modal
                setCurrentTraveller(null);
            } else {
                setTravellerMessage({ type: 'error', text: data.error || 'Failed to update traveller.' });
            }
        } catch (error) {
            console.error('Error updating traveller:', error);
            setTravellerMessage({ type: 'error', text: 'An unexpected error occurred while updating traveller.' });
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentTraveller(null);
        setTravellerMessage({ type: '', text: '' }); // Clear message on cancel
    };

    const handleDeleteTraveller = async (id) => {
        if (!confirm('Are you sure you want to delete this traveller?')) {
            return;
        }
        setTravellerMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setTravellerMessage({ type: 'error', text: 'Authentication required to delete traveller.' });
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/travelers/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setTravellers(travellers.filter(t => t._id !== id)); // Remove the deleted traveller from state
                setTravellerMessage({ type: 'success', text: 'Traveller deleted successfully!' });
            } else {
                const data = await res.json();
                setTravellerMessage({ type: 'error', text: data.error || 'Failed to delete traveller.' });
            }
        } catch (error) {
            console.error('Error deleting traveller:', error);
            setTravellerMessage({ type: 'error', text: 'An unexpected error occurred while deleting traveller.' });
        }
    };

    return (
        <div className={`${isDarkMode ? 'bg-[#1e2535]' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Traveller List</h2>
            {travellerMessage.text && (
                <div
                    className={`p-4 mb-4 rounded-md ${
                        travellerMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {travellerMessage.text}
                </div>
            )}
            <form onSubmit={handleAddTraveller} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="travellerName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Name</label>
                        <input
                            type="text"
                            id="travellerName"
                            value={newTraveller.name}
                            onChange={(e) => setNewTraveller({ ...newTraveller, name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="Enter name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="travellerAge" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Age</label>
                        <input
                            type="number"
                            id="travellerAge"
                            value={newTraveller.age}
                            onChange={(e) => setNewTraveller({ ...newTraveller, age: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="Enter age"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="travellerGender" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Gender</label>
                        <select
                            id="travellerGender"
                            value={newTraveller.gender}
                            onChange={(e) => setNewTraveller({ ...newTraveller, gender: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] text-theme-primary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="idProofType" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>ID Proof Type</label>
                        <input
                            type="text"
                            id="idProofType"
                            value={newTraveller.idProofType}
                            onChange={(e) => setNewTraveller({ ...newTraveller, idProofType: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="e.g., Aadhaar Card, Passport"
                        />
                    </div>
                     <div>
                        <label htmlFor="travellerPhone" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Phone Number</label>
                        <input
                            type="text"
                            id="travellerPhone"
                            value={newTraveller.phoneNumber}
                            onChange={(e) => setNewTraveller({ ...newTraveller, phoneNumber: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="Enter phone number"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="seatPreference" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Seat Preference</label>
                        <input
                            type="text"
                            id="seatPreference"
                            value={newTraveller.seatPreference}
                            onChange={(e) => setNewTraveller({ ...newTraveller, seatPreference: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="e.g., Window, Aisle"
                        />
                    </div>
                     <div>
                        <label htmlFor="nationality" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Nationality</label>
                         <input
                            type="text"
                            id="nationality"
                            value={newTraveller.nationality}
                            onChange={(e) => setNewTraveller({ ...newTraveller, nationality: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            placeholder="Enter nationality"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-[#4a6cf7] hover:bg-[#3b63f7] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                    Add Traveller
                </button>
            </form>

            {travellers.length > 0 && (
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-[#2a3147] text-white' : 'bg-gray-100 text-gray-800'}`}><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">S. No.</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Age</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Gender</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Proof Type</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone Number</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Number</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Seat Preference</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nationality</th><th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th></tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-[#1e2535]' : 'divide-gray-200 bg-white'}`}>
                            {travellers.map((traveller, index) => (
                                <tr key={traveller._id}>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{index + 1}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.name}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.age}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.gender}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.idProofType}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.phoneNumber}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.idNumber}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.seatPreference}</td>
                                    <td className={`px-4 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{traveller.nationality}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditTraveller(traveller._id)} // Use _id for editing
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTraveller(traveller._id)} // Use _id for deleting
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {travellers.length === 0 && (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No travellers added yet.</p>
            )}

            {/* Edit Traveller Modal/Form */}
            {isEditing && currentTraveller && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${isDarkMode ? 'bg-[#1e2535]' : 'bg-white'}`}>
                        <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Edit Traveller</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveTraveller(currentTraveller); }} className="space-y-4">
                            <div>
                                <label htmlFor="editTravellerName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Name</label>
                                <input
                                    type="text"
                                    id="editTravellerName"
                                    value={currentTraveller.name}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, name: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="editTravellerAge" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Age</label>
                                <input
                                    type="number"
                                    id="editTravellerAge"
                                    value={currentTraveller.age}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, age: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="editTravellerGender" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Gender</label>
                                <select
                                    id="editTravellerGender"
                                    value={currentTraveller.gender}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, gender: e.target.value })}
                                     className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] text-theme-primary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="editIdProofType" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>ID Proof Type</label>
                                <input
                                    type="text"
                                    id="editIdProofType"
                                    value={currentTraveller.idProofType}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, idProofType: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="e.g., Aadhaar Card, Passport"
                                />
                            </div>
                             <div>
                                <label htmlFor="editPhoneNumber" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Phone Number</label>
                                <input
                                    type="text"
                                    id="editPhoneNumber"
                                    value={currentTraveller.phoneNumber}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, phoneNumber: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="editIdNumber" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>ID Number</label>
                                <input
                                    type="text"
                                    id="editIdNumber"
                                    value={currentTraveller.idNumber}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, idNumber: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="Enter ID number"
                                />
                            </div>
                             <div>
                                <label htmlFor="editSeatPreference" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Seat Preference</label>
                                <input
                                    type="text"
                                    id="editSeatPreference"
                                    value={currentTraveller.seatPreference}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, seatPreference: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="e.g., Window, Aisle"
                                />
                            </div>
                             <div>
                                <label htmlFor="editNationality" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-black'}`}>Nationality</label>
                                <input
                                    type="text"
                                    id="editNationality"
                                    value={currentTraveller.nationality}
                                    onChange={(e) => setCurrentTraveller({ ...currentTraveller, nationality: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? 'bg-theme-primary text-theme-primary border-gray-600 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] placeholder:text-theme-secondary' : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    placeholder="Enter nationality"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#4a6cf7] hover:bg-[#3b63f7] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TravellerSettings; 