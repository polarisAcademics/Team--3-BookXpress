import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cities } from '../data/cities';

function BookTickets() {
  const location = useLocation();
  const { selectedTrain, selectedClass } = location.state || {};

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    classType: '',
    quota: 'general',
  });

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update suggestions based on input
    if (name === 'from') {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(filtered);
      setShowFromSuggestions(true);
    } else if (name === 'to') {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(filtered);
      setShowToSuggestions(true);
    }
  };

  const handleSuggestionClick = (city, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: city.name
    }));
    if (field === 'from') {
      setShowFromSuggestions(false);
    } else {
      setShowToSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-white text-2xl font-semibold mb-6">Book Train Tickets</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1e2535] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative">
            <label className="block text-[#7a8bbf] mb-2">From Station</label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              placeholder="Enter city or station"
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            />
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#2a3147] rounded-md shadow-lg max-h-60 overflow-auto">
                {fromSuggestions.map((city) => (
                  <div
                    key={city.code}
                    className="px-4 py-2 text-white text-sm hover:bg-[#3b63f7] cursor-pointer"
                    onClick={() => handleSuggestionClick(city, 'from')}
                  >
                    {city.name} ({city.code})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-[#7a8bbf] mb-2">To Station</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="Enter city or station"
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            />
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#2a3147] rounded-md shadow-lg max-h-60 overflow-auto">
                {toSuggestions.map((city) => (
                  <div
                    key={city.code}
                    className="px-4 py-2 text-white text-sm hover:bg-[#3b63f7] cursor-pointer"
                    onClick={() => handleSuggestionClick(city, 'to')}
                  >
                    {city.name} ({city.code})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#7a8bbf] mb-2">Journey Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[#7a8bbf] mb-2">Class</label>
            <select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              required
              className="w-full bg-[#2a3147] text-white rounded px-3 py-2"
            >
              <option value="">Select Class</option>
              <option value="1A">First AC (1A)</option>
              <option value="2A">Second AC (2A)</option>
              <option value="3A">Third AC (3A)</option>
              <option value="SL">Sleeper (SL)</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[#7a8bbf] mb-2">Quota</label>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'General', value: 'general' },
              { label: 'Ladies', value: 'ladies' },
              { label: 'Senior Citizen', value: 'senior' },
              { label: 'Tatkal', value: 'tatkal' },
              { label: 'Premium Tatkal', value: 'premium' },
            ].map(({ label, value }) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="quota"
                  value={value}
                  checked={formData.quota === value}
                  onChange={() => setFormData(prev => ({ ...prev, quota: value }))}
                  className="accent-[#3b63f7]"
                />
                <span className="text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 rounded font-semibold"
        >
          Search Trains
        </button>
      </form>
    </div>
  );
}

export default BookTickets; 