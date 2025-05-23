import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // TODO: Implement API call to fetch bookings
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // TODO: Implement API call to cancel booking
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Refresh bookings list
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4a6cf7]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-theme-secondary rounded-lg shadow-xl p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-theme-primary mb-2">My Bookings</h2>
          <p className="text-theme-secondary">View and manage your train bookings</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            <p className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-ticket-alt text-theme-secondary text-4xl mb-4"></i>
            <p className="text-theme-secondary">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-theme-primary rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-theme-primary font-medium text-lg mb-1">{booking.trainName}</h3>
                    <p className="text-theme-secondary text-sm">PNR: {booking.pnr}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' :
                      booking.status === 'Waiting' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-theme-secondary text-sm mb-1">From</p>
                    <p className="text-theme-primary">{booking.from}</p>
                  </div>
                  <div>
                    <p className="text-theme-secondary text-sm mb-1">To</p>
                    <p className="text-theme-primary">{booking.to}</p>
                  </div>
                  <div>
                    <p className="text-theme-secondary text-sm mb-1">Travel Date</p>
                    <p className="text-theme-primary">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-theme-secondary text-sm mb-1">Class</p>
                    <p className="text-theme-primary">{booking.class}</p>
                  </div>
                </div>

                <div className="border-t border-theme-secondary pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-theme-secondary text-sm mb-1">Passengers</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.passengers.map((passenger, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-theme-secondary text-theme-primary text-sm"
                          >
                            {passenger.name}
                            {passenger.seatNumber && ` • ${passenger.seatNumber}`}
                          </span>
                        ))}
                      </div>
                    </div>
                    {booking.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings; 