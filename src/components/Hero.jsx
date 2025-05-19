import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cities } from '../data/cities';
import { trains, additionalTrains } from '../data/trains';
import TrainList from './TrainList';
import { useNavigate } from 'react-router-dom';

// Main search form component with city suggestions and train filtering
function Hero({ appliedDiscount, onSearch }) {
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

  // Handle form submission with discount application and search history
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hero form submitted.', formData);

    const allTrains = [...trains, ...additionalTrains];
    const results = allTrains.filter(train => 
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
    );

    const discountedResults = results.map(train => {
      let discountedFare = { ...train.fare };
      if (appliedDiscount) {
        if (appliedDiscount.code === 'SENIOR10') {
          if (formData.quota !== 'senior') {
            console.log('Senior citizen discount not applied - quota not senior');
            return { ...train, fare: train.fare };
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

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/recent-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          date: formData.date,
        }),
      }).then(() => {
        if (onSearch) onSearch(formData);
      });
    } else {
      if (onSearch) onSearch(formData);
    }
  };

  const handleBookNow = (train) => {
    navigate('/book-tickets', {
      state: {
        selectedTrain: train,
        selectedClass: formData.classType || '3A',
        appliedDiscount: appliedDiscount
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
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuotaChange('general')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      formData.quota === 'general'
                        ? 'bg-[#3b63f7] text-white'
                        : 'bg-[#2a3147] text-[#7a8bbf] hover:bg-[#3b63f7] hover:text-white'
                    }`}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuotaChange('senior')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      formData.quota === 'senior'
                        ? 'bg-[#3b63f7] text-white'
                        : 'bg-[#2a3147] text-[#7a8bbf] hover:bg-[#3b63f7] hover:text-white'
                    }`}
                  >
                    Senior
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] text-white py-3 rounded-md font-semibold transition duration-200"
            >
              Search Trains
            </button>
          </form>
        </div>

        {showResults && (
          <div className="mt-8">
            <TrainList
              trains={searchResults}
              onBookNow={handleBookNow}
              appliedDiscount={appliedDiscount}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;

