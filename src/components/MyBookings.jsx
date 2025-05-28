import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/booking.service';

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'bookingDate',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchStatistics();
    }
  }, [user, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings(filters);
      setBookings(data.bookings.map(booking => bookingService.formatBookingForDisplay(booking)));
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await bookingService.getBookingStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingBooking(bookingId);
      await bookingService.cancelBooking(bookingId, cancelReason);
      
      // Refresh bookings and statistics
      await fetchBookings();
      await fetchStatistics();
      
      setCancellingBooking(null);
      setCancelReason('');
      
      // Show success message
      alert('Booking cancelled successfully');
    } catch (err) {
      setError(err.message);
      setCancellingBooking(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'CONFIRMED': 'bg-green-500/10 text-green-500 border-green-500/20',
      'PENDING_PAYMENT': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'CANCELLED': 'bg-red-500/10 text-red-500 border-red-500/20',
      'COMPLETED': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
        {bookingService.getStatusIcon(status)} {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4a6cf7]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Statistics */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h2>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.totalBookings || 0}</p>
              </div>
              <i className="fas fa-ticket-alt text-blue-500 text-2xl"></i>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.confirmedBookings || 0}</p>
              </div>
              <i className="fas fa-check-circle text-green-500 text-2xl"></i>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.cancelledBookings || 0}</p>
              </div>
              <i className="fas fa-times-circle text-red-500 text-2xl"></i>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">₹{(statistics.totalAmount || 0).toLocaleString()}</p>
              </div>
              <i className="fas fa-rupee-sign text-purple-500 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bookingDate">Booking Date</option>
              <option value="totalFare">Amount</option>
              <option value="trainDetails.journeyDate">Journey Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
          
          <div className="ml-auto">
            <button
              onClick={() => {
                fetchBookings();
                fetchStatistics();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6">
          <p className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </p>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fas fa-ticket-alt text-gray-400 text-5xl mb-4"></i>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {filters.status ? `No ${filters.status.toLowerCase().replace('_', ' ')} bookings found.` : 'You haven\'t made any bookings yet.'}
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {booking.trainDetails.name} ({booking.trainDetails.number})
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {booking.pnrNumber && (
                        <span><i className="fas fa-barcode mr-1"></i>PNR: {booking.pnrNumber}</span>
                      )}
                      <span><i className="fas fa-calendar mr-1"></i>Booked: {booking.formattedDate}</span>
                      <span><i className="fas fa-credit-card mr-1"></i>{booking.paymentDetails.transactionId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-lg font-bold text-gray-800 mt-2">{booking.formattedAmount}</p>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-semibold text-gray-800">{booking.trainDetails.fromStation}</p>
                      <p className="text-sm text-blue-600">{booking.trainDetails.departureTime}</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-px bg-gray-300 w-full"></div>
                      <i className="fas fa-train absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-blue-500 px-2"></i>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-semibold text-gray-800">{booking.trainDetails.toStation}</p>
                      <p className="text-sm text-blue-600">{booking.trainDetails.arrivalTime}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Journey Date</p>
                    <p className="font-semibold text-gray-800">{booking.formattedJourneyDate}</p>
                    <p className="text-sm text-blue-600">{booking.trainDetails.selectedClass}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-semibold text-gray-800">{booking.paymentDetails.paymentGateway}</p>
                    <span className={`text-sm px-2 py-1 rounded ${booking.paymentDetails.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {booking.paymentDetails.status}
                    </span>
                  </div>
                </div>

                {/* Passengers */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Passengers ({booking.passengers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.passengers.map((passenger, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-sm"
                      >
                        <i className="fas fa-user mr-2"></i>
                        {passenger.name}, {passenger.age}
                        {passenger.seatNumber && ` • Seat: ${passenger.seatNumber}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/booking/${booking._id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => window.print()}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 ml-4"
                      >
                        <i className="fas fa-download"></i>
                        Download Ticket
                      </button>
                    )}
                  </div>
                  
                  {booking.canCancel && (
                    <div className="flex gap-2">
                      {cancellingBooking === booking._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Cancellation reason (optional)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            onClick={() => {
                              setCancellingBooking(null);
                              setCancelReason('');
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCancellingBooking(booking._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                          <i className="fas fa-times"></i>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Cancellation Info */}
                {booking.status === 'CANCELLED' && booking.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                    </p>
                    {booking.cancellationDate && (
                      <p className="text-sm text-red-600 mt-1">
                        Cancelled on: {new Date(booking.cancellationDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasMore}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {loading && bookings.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

export default MyBookings; 