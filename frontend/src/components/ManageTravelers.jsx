import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ManageTravelers() {
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    berthPreference: 'lower'
  });

  // Fetch travelers on component mount
  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/travelers`);
      setTravelers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch travelers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/travelers`, formData);
      setTravelers(prev => [...prev, response.data]);
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        berthPreference: 'lower'
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save traveler');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/travelers/${id}`);
      setTravelers(prev => prev.filter(t => t._id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete traveler');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/travelers/${id}/set-default`);
      setTravelers(prev => prev.map(t => 
        t._id === id ? { ...t, isDefault: true } : { ...t, isDefault: false }
      ));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default traveler');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4a6cf7]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Manage Saved Travelers</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add New Traveler Form */}
      <div className="bg-[#1e2535] rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Traveler</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#7a8bbf] mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#2a3147] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                required
              />
            </div>
            <div>
              <label className="block text-[#7a8bbf] mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full bg-[#2a3147] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                min="1"
                max="120"
                required
              />
            </div>
            <div>
              <label className="block text-[#7a8bbf] mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-[#2a3147] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[#7a8bbf] mb-2">Berth Preference</label>
              <select
                name="berthPreference"
                value={formData.berthPreference}
                onChange={handleInputChange}
                className="w-full bg-[#2a3147] text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
              >
                <option value="lower">Lower</option>
                <option value="middle">Middle</option>
                <option value="upper">Upper</option>
                <option value="side-lower">Side Lower</option>
                <option value="side-upper">Side Upper</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#3b63f7] hover:bg-[#2f54e0] text-white px-6 py-2 rounded"
          >
            Add Traveler
          </button>
        </form>
      </div>

      {/* List of Saved Travelers */}
      <div className="bg-[#1e2535] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Saved Travelers</h2>
        {travelers.length === 0 ? (
          <p className="text-[#7a8bbf]">No saved travelers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelers.map(traveler => (
              <div
                key={traveler._id}
                className={`bg-[#2a3147] p-4 rounded-lg ${
                  traveler.isDefault ? 'border-2 border-[#3b63f7]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">{traveler.name}</h3>
                  {traveler.isDefault && (
                    <span className="bg-[#3b63f7] text-white text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[#7a8bbf] text-sm mb-2">
                  Age: {traveler.age} | Gender: {traveler.gender}
                </p>
                <p className="text-[#7a8bbf] text-sm mb-4">
                  Berth Preference: {traveler.berthPreference}
                </p>
                <div className="flex space-x-2">
                  {!traveler.isDefault && (
                    <button
                      onClick={() => handleSetDefault(traveler._id)}
                      className="text-[#3b63f7] hover:text-[#2f54e0] text-sm"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(traveler._id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTravelers; 