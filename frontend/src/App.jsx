import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PNRStatus from './components/PNRStatus';
import RecentSearches from './components/RecentSearches';
import PopularRoutes from './components/PopularRoutes';
import FloatingChatButton from './components/FloatingChatButton';
import Footer from './components/Footer';
import TrainStatus from './components/TrainStatus';
import BookTickets from './components/BookTickets';
import MyBookings from './components/MyBookings';
import Settings from './components/Settings';
import BookingSuccess from './components/BookingSuccess';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function MainContent() {
  const [recentSearches, setRecentSearches] = useState([]);

  // Function to fetch recent searches from backend
  const fetchRecentSearches = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRecentSearches([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/recent-searches`, {
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

  return (
    <>
      <Hero onSearch={fetchRecentSearches} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PNRStatus />
          <RecentSearches searches={recentSearches} />
          <PopularRoutes />
        </div>
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
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/recent-searches`);
        setRecentSearches(response.data);
      } catch (err) {
        console.warn('Failed to fetch recent searches:', err);
        setRecentSearches([]);
      }
    };

    fetchRecentSearches();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-theme-primary">
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
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <Settings />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking-success"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto px-4 py-8">
                        <BookingSuccess />
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;