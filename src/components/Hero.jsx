import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cities } from '../data/cities';
import { trains, additionalTrains } from '../data/trains';
import TrainList from './TrainList';
import { useNavigate } from 'react-router-dom';
import { trainsService } from '../services/trains.service';

// const API_BASE_URL = 'http://localhost:3000'; // API call moved to Hero.jsx

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // Function to fetch station suggestions
  const fetchStationSuggestions = async (query, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/stations/autocomplete?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching station suggestions:', error);
      setSuggestions([]);
    }
  };

  // Handle input changes with debounced suggestions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Fetch suggestions for the changed field
    if (name === 'from') {
      fetchStationSuggestions(value, setFromSuggestions);
      setShowFromSuggestions(true);
    } else if (name === 'to') {
      fetchStationSuggestions(value, setToSuggestions);
      setShowToSuggestions(true);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: suggestion.station
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await trainsService.getTrainsBetweenStations(
        formData.from,
        formData.to,
        formData.date
      );

      if (!response.status) {
        throw new Error(response.message || 'Failed to fetch trains');
      }

      // Transform the API response to match TrainList's expected format
      const transformedTrains = response.trains.map(train => ({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        fromStation: {
          name: train.fromStation.name,
          departure: train.fromStation.departure
        },
        toStation: {
          name: train.toStation.name,
          arrival: train.toStation.arrival
        },
        duration: train.duration,
        availableClasses: train.availableClasses,
        runningDays: train.runningDays,
        trainType: train.trainType,
        fare: {
          '1A': 1500,
          '2A': 800,
          '3A': 500,
          'SL': 250
        }
      }));

      setSearchResults(transformedTrains);
      setShowResults(true);

      // Save search to backend and update recent searches
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:3000/api/recent-searches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            from: formData.from,
            to: formData.to,
            date: formData.date,
          }),
        });
      } catch (err) {
        console.warn('Failed to save recent search:', err);
        // Continue execution even if saving recent search fails
      }
      
      if (onSearch) onSearch(formData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search trains');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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
    <section className="relative bg-theme-primary py-20 text-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold leading-tight mb-4">Find and Book Your Train Tickets</h1>
          <p className="text-theme-secondary text-lg">Search across various routes and book your journey seamlessly.</p>
        </div>

        <div className="bg-theme-secondary rounded-lg p-8 shadow-xl max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={fromRef}>
                <label className="block text-theme-secondary text-sm font-medium mb-2">From Station</label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  onFocus={() => setShowFromSuggestions(true)}
                  placeholder="Enter city or station"
                  className="w-full bg-theme-primary text-theme-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  required
                />
                {showFromSuggestions && fromSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-theme-primary rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {fromSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm text-theme-primary hover:bg-[var(--accent-color)] hover:text-white cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion, 'from')}
                      >
                        <div className="font-medium">{suggestion.station}</div>
                        <div className="text-sm text-gray-500">{suggestion.city} ({suggestion.code})</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={toRef}>
                <label className="block text-theme-secondary text-sm font-medium mb-2">To Station</label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  onFocus={() => setShowToSuggestions(true)}
                  placeholder="Enter city or station"
                  className="w-full bg-theme-primary text-theme-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  required
                />
                {showToSuggestions && toSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-theme-primary rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {toSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm text-theme-primary hover:bg-[var(--accent-color)] hover:text-white cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion, 'to')}
                      >
                        <div className="font-medium">{suggestion.station}</div>
                        <div className="text-sm text-gray-500">{suggestion.city} ({suggestion.code})</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Journey Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary text-theme-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  required
                />
              </div>
              <div>
                <label className="block text-theme-secondary text-sm font-medium mb-2">Class</label>
                <select
                  name="classType"
                  value={formData.classType}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary text-theme-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
                <label className="block text-theme-secondary text-sm font-medium mb-2">Quota</label>
                <select
                  name="quota"
                  value={formData.quota}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary text-theme-primary rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
                className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Trains'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Display Search Results */}
      {showResults && (
        <div className="max-w-5xl mx-auto mt-8">
          <h3 className="text-white text-xl font-semibold mb-4">Search Results</h3>
          {error ? (
            <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default Hero;
