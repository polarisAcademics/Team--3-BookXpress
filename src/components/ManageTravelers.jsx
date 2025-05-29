import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://bookxpress.onrender.com';

function ManageTravelers() {
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    berthPreference: 'lower'
  });

  // Fetch travelers on component mount
  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view saved travelers');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/travelers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch travelers');
      }

      const data = await response.json();
      setTravelers(data);
      setError(null);
    } catch (error) {
      setError(error.message);
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to save travelers');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/travelers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save traveler');
      }

      const savedTraveler = await response.json();
      setTravelers(prev => [...prev, savedTraveler]);
      setFormData({
        name: '',
        age: '',
        gender: 'male',
        berthPreference: 'lower'
      });
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete travelers');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/travelers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete traveler');
      }

      setTravelers(prev => prev.filter(t => t._id !== id));
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to set default traveler');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/travelers/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to set default traveler');
      }

      const updatedTraveler = await response.json();
      setTravelers(prev => prev.map(t => 
        t._id === id ? { ...t, isDefault: true } : { ...t, isDefault: false }
      ));
      setError(null);
    } catch (error) {
      setError(error.message);
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
                <option value="male">Male</option>
                <option value="female">Female</option>
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