import React, { useState, useCallback, useEffect } from 'react';
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
import Footer from './components/Footer';
import TrainStatus from './components/TrainStatus';
import BookTickets from './components/BookTickets';
import MyBookings from './components/MyBookings';

// Main content component with search history and offers functionality
function MainContent() {
  const [recentSearches, setRecentSearches] = useState([]);

  const fetchRecentSearches = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRecentSearches([]);
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/recent-searches', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecentSearches(data);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    fetchRecentSearches();
  }, [fetchRecentSearches]);
  
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const handleApplyOffer = (offer) => {
    console.log('Offer applied:', offer);
    setAppliedDiscount(offer.discount);
  };

  return (
    <>
      <Hero onSearch={fetchRecentSearches} appliedDiscount={appliedDiscount} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches searches={recentSearches} />
          <PopularRoutes />
        </div>
        <TrendingOffers onApplyOffer={handleApplyOffer} />
      </main>
    </>
  );
}

// Main application component with routing setup
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