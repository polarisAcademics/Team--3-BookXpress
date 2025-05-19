import React, { useState } from 'react'; // Import useState
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

function MainContent() {
  const [appliedDiscount, setAppliedDiscount] = useState(null); // State for applied discount

  const handleApplyOffer = (offer) => {
    console.log('Offer applied:', offer);
    setAppliedDiscount(offer.discount.value); // Store just the discount value
  };

  return (
    <>
      <Hero appliedDiscount={appliedDiscount} /> {/* Pass appliedDiscount to Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches />
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