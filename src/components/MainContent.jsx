import React, { useState, useCallback, useEffect } from 'react'; // Import useState, useCallback, useEffect
import { useLocation } from 'react-router-dom';
// Import components used in MainContent
import Hero from './Hero';
import PNRStatus from './PNRStatus';
import RecentSearches from './RecentSearches';
import PopularRoutes from './PopularRoutes';
import TrendingOffers from './TrendingOffers';
import FloatingChatButton from './FloatingChatButton';
import Footer from './Footer'; // Footer is likely in App.jsx, but keeping import if used here
import DownloadTickets from './DownloadTickets';
import { trains, additionalTrains } from '../data/trains'; // Import hardcoded train data

function MainContent() {
  const [appliedDiscount, setAppliedDiscount] = useState(null); // State for applied discount
  const [searchResults, setSearchResults] = useState([]); // State to store filtered results
  const [showResults, setShowResults] = useState(false); // State to control results display
  const [lastSearchFormData, setLastSearchFormData] = useState(null); // State to store the last search form data
  const [recentSearches, setRecentSearches] = useState([]);

  // Function to fetch recent searches from backend
  const fetchRecentSearches = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://bookxpress.onrender.com/api/recent-searches', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecentSearches(data);
    } catch (err) {
      console.warn('Failed to fetch recent searches:', err);
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    fetchRecentSearches();
  }, [fetchRecentSearches]);

  const handleApplyOffer = (offer) => {
    console.log('Offer applied:', offer);
    setAppliedDiscount(offer.discount); // Store the full discount object
    console.log('MainContent appliedDiscount state after setting:', offer.discount);
    // Note: Re-filtering search results when discount is applied will need to be handled in Hero
  };

  const handleSearch = (formData) => {
    console.log('MainContent performing search with form data:', formData);
    console.log('Value of handleSearch function in MainContent:', handleSearch);
    setLastSearchFormData(formData); // Store the current search form data
    const allTrains = [...trains, ...additionalTrains]; // Combine both arrays
    const results = allTrains.filter(train => 
      train.from.toLowerCase() === formData.from.toLowerCase() &&
      train.to.toLowerCase() === formData.to.toLowerCase()
      // Note: Date filtering is NOT implemented here based on the hardcoded data structure
      // You would need to add date checking logic if your hardcoded data supported it.
    );

    // Apply current discount to initial search results
    const discountedResults = results.map(train => {
        let discountedFare = { ...train.fare };
        if (appliedDiscount) {
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
    console.log('MainContent search results:', discountedResults);
    
    // Fetch recent searches after a new search
    fetchRecentSearches();
  };

  console.log('MainContent rendering with appliedDiscount:', appliedDiscount);

  return (
    <>
      {
        console.log('MainContent passing props to Hero:', {
          appliedDiscount: appliedDiscount,
          onSearch: handleSearch,
          searchResults: searchResults,
          showResults: showResults,
        })
      }
      <Hero 
        appliedDiscount={appliedDiscount} 
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
        <TrendingOffers onApplyOffer={handleApplyOffer} /> {/* Pass handler to TrendingOffers */}
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