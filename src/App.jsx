import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PNRStatus from './components/PNRStatus';
import RecentSearches from './components/RecentSearches';
import PopularRoutes from './components/PopularRoutes';
import TrendingOffers from './components/TrendingOffers';
import FloatingChatButton from './components/FloatingChatButton';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches />
          <PopularRoutes />
        </div>
        <TrendingOffers />
      </main>
      <FloatingChatButton />
      <Footer />
    </>
  );
}

export default App;