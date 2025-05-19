import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PNRStatus from './components/PNRStatus';
import RecentSearches from './components/RecentSearches';
import PopularRoutes from './components/PopularRoutes';
import TrendingOffers from './components/TrendingOffers';
import FloatingChatButton from './components/FloatingChatButton';
import Footer from './components/Footer';
import TrainStatus from './components/TrainStatus';
import BookTickets from './components/BookTickets';
import MyBookings from './components/MyBookings';

function MainContent() {
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const handleApplyOffer = (offer) => {
    console.log('Offer applied:', offer);
    setAppliedDiscount(offer.discount.value);
  };

  return (
    <>
      <Hero appliedDiscount={appliedDiscount} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches />
          <PopularRoutes />
        </div>
        <TrendingOffers onApplyOffer={handleApplyOffer} />
      </main>
      <FloatingChatButton />
    </>
  );
}

async function random(){
  const url = 'https://indian-railway-irctc.p.rapidapi.com/api/trains-search/v1/train/12051?isH5=true&client=web';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '9a43e9d002mshed90898683d9dd3p143a5fjsn7e1d2c2f1ab7',
		'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
		'x-rapid-api': 'rapid-api-database'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#161f2e]">
          <Navbar />
          <div className="pt-16 pb-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainContent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-status"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <TrainStatus />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-tickets"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <BookTickets />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <div className="container mx-auto px-4 py-8">
                      <MyBookings />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;