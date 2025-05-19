import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cities } from '../data/cities';
import { trains, additionalTrains } from '../data/trains';
import TrainList from './TrainList';
import { useNavigate } from 'react-router-dom';

// Convert Navbar from HTML script
function Navbar() {
  return (
    <nav className="bg-[#1e2535] flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3">
      <div className="flex items-center space-x-2">
        <i className="fas fa-train text-[#4a6cf7] text-lg"></i>
        <span className="font-semibold text-white text-sm sm:text-base">BookXpress</span>
      </div>
      <ul className="hidden md:flex space-x-8 text-xs sm:text-sm text-white/80 font-normal">
        <li><a href="#" className="hover:text-white">Home</a></li>
        <li><a href="#" className="hover:text-white">My Bookings</a></li>
        <li><a href="#" className="hover:text-white">Profile</a></li>
        <li><a href="#" className="hover:text-white">Support</a></li>
      </ul>
      <div className="flex items-center space-x-4 text-xs sm:text-sm">
        <button aria-label="Toggle dark mode" className="text-white/80 hover:text-white">
          <i className="fas fa-sun"></i>
        </button>
        <a href="#" className="text-white/80 hover:text-white">Login</a>
        <a href="#" className="bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded px-3 py-1 text-white text-xs sm:text-sm font-semibold">Register</a>
      </div>
    </nav>
  );
}

// Convert Hero from HTML script
function Hero() {
  const [quota, setQuota] = useState("general");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hero form submitted.', formData);

    const allTrains = [...trains, ...additionalTrains];
    const results = allTrains.filter(train =>
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
    );

    setSearchResults(results);
    setShowResults(true);
    console.log('Hero search results after filtering:', results);
  };

  const navigate = useNavigate();

  const handleBookNow = (train) => {
    navigate('/book-tickets', {
      state: {
        selectedTrain: train,
        selectedClass: formData.classType || '3A',
      }
    });
  };


  return (
    <section className="bg-[#3b63f7] px-4 sm:px-6 md:px-10 lg:px-16 py-10">
      <h2 className="text-white font-semibold text-center text-sm sm:text-lg md:text-xl mb-6">
        Find and Book Train Tickets
      </h2>
      <form className="max-w-5xl mx-auto bg-[#1e2535] rounded-md p-4 shadow-lg" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label htmlFor="from" className="sr-only">From</label>
            <input
              id="from"
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              onFocus={() => setShowFromSuggestions(true)}
              placeholder="Enter city or station"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
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
          <div>
            <label htmlFor="to" className="sr-only">To</label>
            <input
              id="to"
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              onFocus={() => setShowToSuggestions(true)}
              placeholder="Enter city or station"
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
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
          <div>
            <label htmlFor="date" className="sr-only">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            />
          </div>
          <div>
            <label htmlFor="class" className="sr-only">Class</label>
            <select
              id="class"
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
            >
              <option value="" disabled>Select Class</option>
              <option value="1A">First AC (1A)</option>
              <option value="2A">Second AC (2A)</option>
              <option value="3A">Third AC (3A)</option>
              <option value="SL">Sleeper (SL)</option>
            </select>
          </div>
        </div>
        <fieldset className="mb-4 text-xs sm:text-sm text-white/80 flex flex-wrap gap-4">
          <legend className="sr-only">Quotas</legend>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="general"
              checked={formData.quota === "general"}
              onChange={() => handleQuotaChange("general")}
              className="accent-[#3b63f7]"
            />
            <span>General</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="ladies"
              checked={formData.quota === "ladies"}
              onChange={() => handleQuotaChange("ladies")}
              className="accent-[#3b63f7]"
            />
            <span>Ladies</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="senior"
              checked={formData.quota === "senior"}
              onChange={() => handleQuotaChange("senior")}
              className="accent-[#3b63f7]"
            />
            <span>Senior Citizen</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="tatkal"
              checked={formData.quota === "tatkal"}
              onChange={() => handleQuotaChange("tatkal")}
              className="accent-[#3b63f7]"
            />
            <span>Tatkal</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="quota"
              value="premium"
              checked={formData.quota === "premium"}
              onChange={() => handleQuotaChange("premium")}
              className="accent-[#3b63f7]"
            />
            <span>Premium Tatkal</span>
          </label>
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
          <h3 className="text-white text-xl font-semibold mb-4">Search Results</h3>
           <TrainList
             trains={searchResults}
             selectedClass={formData.classType || '3A'}
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

// Convert PNRStatus from HTML script
function PNRStatus() {
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        PNR Status
      </h3>
      <form className="p-4 space-y-3" onSubmit={e => e.preventDefault()}>
        <label htmlFor="pnr" className="block text-xs sm:text-sm text-white/80 mb-1">Enter PNR Number</label>
        <input
          id="pnr"
          type="text"
          placeholder="10-digit PNR number"
          className="w-full bg-[#2a3147] text-white text-xs sm:text-sm rounded px-3 py-2 placeholder:text-[#7a8bbf]"
        />
        <button
          type="submit"
          className="w-full bg-[#3b63f7] hover:bg-[#2f54e0] transition rounded py-2 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2"
        >
          <i className="fas fa-search"></i>
          <span>Check Status</span>
        </button>
      </form>
    </section>
  );
}

// Convert RecentSearches from HTML script
function RecentSearches() {
  const searches = [
    { from: "Delhi", to: "Jaipur", date: "17 Aug" },
    { from: "Mumbai", to: "Pune", date: "15 Aug" },
    { from: "Bangalore", to: "Mysore", date: "20 Aug" },
  ];
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        Recent Searches
      </h3>
      <ul className="p-4 space-y-4 text-xs sm:text-sm">
        {searches.map(({ from, to, date }, i) => (
          <li key={i} className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-white/80">
              <i className="far fa-clock text-xs"></i>
              <div>
                <span className="text-white font-semibold">{from}</span>
                <span> to </span>
                <span className="font-semibold">{to}</span>
                <div className="text-[10px] text-white/50">{date}</div>
              </div>
            </div>
            <a href="#" className="text-[#3b63f7] hover:underline text-xs sm:text-sm">Search Again</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Convert PopularRoutes from HTML script
function PopularRoutes() {
  const routes = [
    { from: "Delhi", to: "Mumbai", trains: 74 },
    { from: "Bangalore", to: "Chennai", trains: 18 },
    { from: "Kolkata", to: "Delhi", trains: 15 },
    { from: "Mumbai", to: "Ahmedabad", trains: 22 },
    { from: "Chennai", to: "Hyderabad", trains: 14 },
    { from: "Pune", to: "Mumbai", trains: 23 },
  ];
  return (
    <section className="bg-[#1e2535] rounded-md shadow-md">
      <h3 className="bg-[#3b63f7] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-t-md">
        Popular Routes
      </h3>
      <ul className="p-4 space-y-3 text-xs sm:text-sm">
        {routes.map(({ from, to, trains }, i) => (
          <li key={i} className="flex justify-between items-center text-white/80">
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marker-alt text-[10px]"></i>
              <div>
                <span className="text-white font-semibold">{from}</span>
                <span> to </span>
                <span className="font-semibold">{to}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-train text-[10px]"></i>
              <span className="text-white/70">{trains} Trains</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Main component rendering the layout
function R() {
  return (
    <div className="bg-[#161f2e] text-white">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches />
          <PopularRoutes />
          {/* Assuming DownloadTickets and other components exist elsewhere or need to be created */}
        </div>
        {/* Assuming TrendingOffers exists elsewhere or needs to be created */}
      </main>
      {/* Assuming FloatingChatButton exists elsewhere or needs to be created */}
      {/* Assuming Footer exists elsewhere or needs to be created */}
    </div>
  );
}

export default R; 