import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cities } from '../data/cities';
import { trains, additionalTrains } from '../data/trains';
import TrainList from './TrainList';
import { useNavigate } from 'react-router-dom';

// const API_BASE_URL = 'http://localhost:3000'; // API call moved to Hero.jsx

function Hero({ appliedDiscount }) {
  console.log('Hero rendering with appliedDiscount prop:', appliedDiscount);
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
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update suggestions based on input (still using cities data here if needed for Hero form)
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

  const handleQuotaChange = (quota) => {
    setFormData((prev) => ({
      ...prev,
      quota,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hero form submitted.', formData);

    const allTrains = [...trains, ...additionalTrains];
    const results = allTrains.filter(train => 
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
    );

    // Apply discount to search results
    const discountedResults = results.map(train => {
      let discountedFare = { ...train.fare };
      if (appliedDiscount) {
        // Only apply senior citizen discount if senior citizen quota is selected
        if (appliedDiscount.code === 'SENIOR10') {
          if (formData.quota !== 'senior') {
            console.log('Senior citizen discount not applied - quota not senior');
            return { ...train, fare: train.fare }; // Return original fare without discount
          }
          console.log('Senior citizen discount applied - quota is senior');
        }
        
        discountedFare = Object.keys(train.fare).reduce((acc, className) => {
          let baseFare = train.fare[className];
          if (appliedDiscount.type === 'percent') {
            baseFare = baseFare * (1 - appliedDiscount.value / 100);
          } else if (appliedDiscount.type === 'flat') {
            baseFare = Math.max(0, baseFare - appliedDiscount.value);
          }
          acc[className] = Math.round(baseFare);
          return acc;
        }, {});
      }
      return { ...train, fare: discountedFare };
    });

    setSearchResults(discountedResults);
    setShowResults(true);
    console.log('Hero search results after filtering and applying discount:', discountedResults);
  };

  const handleBookNow = (train) => {
    navigate('/book-tickets', {
      state: {
        selectedTrain: train,
        selectedClass: formData.classType || '3A',
        appliedDiscount: appliedDiscount // Pass appliedDiscount
      }
    });
  };

  return (
    <section className="relative bg-[#161f2e] py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold leading-tight mb-4">Find and Book Your Train Tickets</h1>
          <p className="text-[#7a8bbf] text-lg">Search across various routes and book your journey seamlessly.</p>
        </div>

        <div className="bg-[#1e2535] rounded-lg p-8 shadow-xl max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={fromRef}>
                <label className="block text-[#7a8bbf] text-sm font-medium mb-2">From Station</label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  onFocus={() => setShowFromSuggestions(true)}
                  placeholder="Enter city or station"
                  className="w-full bg-[#2a3147] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                  required
                />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-[#2a3147] rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {fromSuggestions.map((city) => (
                      <div
                        key={city.code}
                        className="px-4 py-2 text-sm text-white hover:bg-[#3b63f7] cursor-pointer"
                        onClick={() => handleSuggestionClick(city, 'from')}
                      >
                        {city.name} ({city.code})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={toRef}>
                <label className="block text-[#7a8bbf] text-sm font-medium mb-2">To Station</label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  onFocus={() => setShowToSuggestions(true)}
                  placeholder="Enter city or station"
                  className="w-full bg-[#2a3147] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                  required
                />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-[#2a3147] rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {toSuggestions.map((city) => (
                      <div
                        key={city.code}
                        className="px-4 py-2 text-sm text-white hover:bg-[#3b63f7] cursor-pointer"
                        onClick={() => handleSuggestionClick(city, 'to')}
                      >
                        {city.name} ({city.code})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[#7a8bbf] text-sm font-medium mb-2">Journey Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#2a3147] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#7a8bbf] text-sm font-medium mb-2">Class</label>
                <select
                  name="classType"
                  value={formData.classType}
                  onChange={handleChange}
                  className="w-full bg-[#2a3147] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="1A">First AC (1A)</option>
                  <option value="2A">Second AC (2A)</option>
                  <option value="3A">Third AC (3A)</option>
                  <option value="SL">Sleeper (SL)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#7a8bbf] text-sm font-medium mb-2">Quota</label>
                <select
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  className="w-full bg-[#2a3147] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b63f7]"
                >
                  <option value="general">General</option>
                  <option value="ladies">Ladies</option>
                  <option value="senior">Senior Citizen</option>
                  <option value="tatkal">Tatkal</option>
                  <option value="premium">Premium Tatkal</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-[#3b63f7] hover:bg-[#2f54e0] text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b63f7] focus:ring-offset-2"
              >
                Search Trains
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Display Search Results */}
      {showResults && (
        <div className="max-w-5xl mx-auto mt-8">
          <h3 className="text-white text-xl font-semibold mb-4">Search Results</h3>
           <TrainList 
             trains={searchResults}
             selectedClass={formData.classType || '3A'}
             appliedDiscount={appliedDiscount}
             quota={formData.quota}
             onBookNow={handleBookNow}
           />
         {searchResults.length === 0 && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg">
                <p>No trains found for the selected route.</p>
            </div>
         )}
        </div>
      )}
    </section>
  );
}

export default Hero;
