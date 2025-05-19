import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cities } from '../data/cities'; // Keep cities for now if needed for suggestions in BookTickets

// const API_BASE_URL = 'http://localhost:3000'; // API call moved to Hero.jsx

function BookTickets() {
  const location = useLocation();
  // Receive selected train details from navigation state if coming from Hero search results
  const { selectedTrain, selectedClass, searchFormData } = location.state || {};

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    classType: '',
    quota: 'general',
  });

  // Initialize form data if coming from Hero search (optional - depending on UX flow)
  useEffect(() => {
    if (searchFormData) {
      setFormData(searchFormData);
    }
  }, [searchFormData]);

  // Suggestions state and handlers - Keep if you want suggestions on this page too
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

    // Suggestions logic - Keep if you want suggestions on this page
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

  // Handle actual booking submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log('Booking form submitted:', formData);
    // Implement booking API call here
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-white text-2xl font-semibold mb-6">Book Train Tickets</h1>

      {/* Display selected train details if coming from search results (optional) */}
      {selectedTrain && (
          <div className="bg-[#2a3147] rounded-lg p-4 mb-6 text-white">
              <h3 className="font-semibold text-lg">{selectedTrain.trainName || selectedTrain.name} ({selectedTrain.trainNumber || selectedTrain.id})</h3>
              <p className="text-sm text-[#7a8bbf]">Route: {selectedTrain.origin || selectedTrain.from} to {selectedTrain.destination || selectedTrain.to}</p>
              {/* Add other relevant train details */} {/* Ensure property names match the API response/train object structure */}
          </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleBookingSubmit} className="bg-[#1e2535] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* From Station Input */}
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

          {/* To Station Input */}
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

          {/* Journey Date Input */}
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

          {/* Class Select */}
          <div>
            <label className="block text-[#7a8bbf] mb-2">Class</label>
            <select
              name="classType"
              value={formData.classType} // Keep classType in state for booking
              onChange={handleChange} // Use handleChange
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

        {/* Quota Radios */}
        <div className="mb-6">
          <label className="block text-[#7a8bbf] mb-2">Quota</label>
          <div className="flex flex-wrap gap-4">
            {[/* ... radio options ... */].map(({ label, value }) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="quota"
                  value={value} // Keep quota in state for booking
                  checked={formData.quota === value}
                  onChange={() => setFormData(prev => ({ ...prev, quota: value }))} // Keep handling quota change
                  className="accent-[#3b63f7]"
                />
                <span className="text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Book Tickets Button */}
        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 rounded font-semibold"
        >
          Book Tickets
        </button>
      </form>
    </div>
  );
}

export default BookTickets; 