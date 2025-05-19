import React, { useState, useRef, useEffect } from 'react';
import { cities } from '../data/cities';
import { trains } from '../data/trains';
import TrainList from './TrainList';

function Hero() {
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

  const handleQuotaChange = (quota) => {
    setFormData((prev) => ({
      ...prev,
      quota,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter trains based on from and to cities
    const filteredTrains = trains.filter(train => 
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
    );
    setSearchResults(filteredTrains);
    setShowResults(true);
  };

  return (
    <section className="bg-[#3b63f7] px-4 sm:px-6 md:px-10 lg:px-16 py-10">
      <h2 className="text-white font-semibold text-center text-sm sm:text-lg md:text-xl mb-6">
        Find and Book Train Tickets
      </h2>
      <form className="max-w-5xl mx-auto bg-[#1e2535] rounded-md p-4 shadow-lg" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="relative" ref={fromRef}>
            <label htmlFor="from" className="sr-only">From</label>
            <input
              id="from"
              name="from"
              type="text"
              placeholder="Enter city or station"
              value={formData.from}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
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
          <div className="relative" ref={toRef}>
            <label htmlFor="to" className="sr-only">To</label>
            <input
              id="to"
              name="to"
              type="text"
              placeholder="Enter city or station"
              value={formData.to}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
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
            <label htmlFor="date" className="sr-only">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="classType" className="sr-only">Class</label>
            <select
              id="classType"
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2"
            >
              <option value="" disabled>Select Class</option>
              <option value="first">First Class</option>
              <option value="second">Second Class</option>
              <option value="third">Third Class</option>
            </select>
          </div>
        </div>

        <fieldset className="mb-4 text-xs sm:text-sm text-white/80 flex flex-wrap gap-4">
          <legend className="sr-only">Quotas</legend>
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
                onChange={() => handleQuotaChange(value)}
                className="accent-[#3b63f7]"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2"
        >
          <i className="fas fa-search"></i>
          <span>Search Trains</span>
        </button>
      </form>

      {showResults && (
        <div className="max-w-5xl mx-auto mt-8">
          <TrainList 
            trains={searchResults} 
            selectedClass={formData.classType || '3A'} 
          />
        </div>
      )}
    </section>
  );
}

export default Hero;
