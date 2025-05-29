import React, { useState, useCallback, useEffect } from 'react'; // Import useState, useCallback, useEffect
import { useLocation } from 'react-router-dom';
import axios from 'axios';
// Import components used in MainContent
import Hero from './Hero';
import PNRStatus from './PNRStatus';
import RecentSearches from './RecentSearches';
import PopularRoutes from './PopularRoutes';
import FloatingChatButton from './FloatingChatButton';
import Footer from './Footer'; // Footer is likely in App.jsx, but keeping import if used here
import DownloadTickets from './DownloadTickets';
import { trains, additionalTrains } from '../data/trains'; // Import hardcoded train data

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function MainContent() {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [lastSearchFormData, setLastSearchFormData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/recent-searches`);
        setRecentSearches(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch recent searches');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  const handleSearch = (formData) => {
    console.log('MainContent performing search with form data:', formData);
    console.log('Value of handleSearch function in MainContent:', handleSearch);
    setLastSearchFormData(formData);
    const allTrains = [...trains, ...additionalTrains];
    const results = allTrains.filter(train => 
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
    );

    setSearchResults(results);
    setShowResults(true);
    console.log('MainContent search results:', results);
    
    // Fetch recent searches after a new search
    fetchRecentSearches();
  };

  return (
    <>
      <Hero 
        onSearch={handleSearch} 
        searchResults={searchResults} 
        showResults={showResults} 
      /> 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches searches={recentSearches} />
          <PopularRoutes />
          <DownloadTickets />
        </div>
      </main>
      <FloatingChatButton />
    </>
  );
}

// Footer is likely rendered in App.jsx, but keeping if it was here
// function Footer() {
//   return (
//     <footer>
//       {/* Footer content */}
//     </footer>
//   );
// }

export default MainContent; 