import React from 'react';
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

function MainContent() {
  return (
    <>
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
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#161f2e]">
          <Navbar />
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
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;