const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BookingService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Initiate a booking (before payment)
  async initiateBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/initiate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate booking');
      }

      return data;
    } catch (error) {
      console.error('Error initiating booking:', error);
      throw error;
    }
  }

  // Confirm payment and finalize booking
  async confirmPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/confirm-payment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment');
      }

      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Create a direct booking (legacy method)
  async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get user's bookings with filters and pagination
  async getMyBookings(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  // Get a specific booking by ID
  async getBookingById(bookingId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }

      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Get booking statistics
  async getBookingStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/statistics/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch statistics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  // Process payment (integrate with your payment gateway)
  async processPayment(paymentData) {
    try {
      // This is where you'd integrate with your payment gateway
      // For demo purposes, simulating payment processing
      console.log('Processing payment:', paymentData);
      
      // Simulate payment gateway response
      const simulatedResponse = {
        success: Math.random() > 0.2, // 80% success rate for demo
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: paymentData.amount,
        gateway: 'Razorpay' // or your chosen gateway
      };

      // In real implementation, you'd call your payment gateway API here
      // const response = await fetch('https://api.razorpay.com/v1/payments', {...});
      
      return simulatedResponse;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Complete booking flow (initiate -> payment -> confirm)
  async completeBooking(bookingData) {
    try {
      // Step 1: Initiate booking
      const initiatedBooking = await this.initiateBooking(bookingData);
      
      // Step 2: Process payment
      const paymentResult = await this.processPayment({
        amount: bookingData.totalFare,
        bookingId: initiatedBooking.bookingId,
        currency: 'INR'
      });

      // Step 3: Confirm payment
      const confirmationResult = await this.confirmPayment({
        bookingId: initiatedBooking.bookingId,
        transactionId: paymentResult.transactionId,
        paymentStatus: paymentResult.success ? 'success' : 'failed',
        paymentGateway: paymentResult.gateway
      });

      return {
        success: paymentResult.success,
        booking: confirmationResult.booking,
        transactionId: paymentResult.transactionId,
        message: confirmationResult.message
      };
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  // Format booking data for display
  formatBookingForDisplay(booking) {
    return {
      ...booking,
      formattedAmount: `₹${booking.totalFare.toLocaleString()}`,
      formattedDate: new Date(booking.bookingDate).toLocaleDateString('en-IN'),
      formattedJourneyDate: new Date(booking.trainDetails.journeyDate).toLocaleDateString('en-IN'),
      statusColor: this.getStatusColor(booking.status),
      canCancel: booking.status === 'CONFIRMED' && new Date(booking.trainDetails.journeyDate) > new Date()
    };
  }

  // Get status color for UI
  getStatusColor(status) {
    const colors = {
      'CONFIRMED': 'green',
      'PENDING_PAYMENT': 'orange',
      'CANCELLED': 'red',
      'COMPLETED': 'blue'
    };
    return colors[status] || 'gray';
  }

  // Get status icon
  getStatusIcon(status) {
    const icons = {
      'CONFIRMED': '✅',
      'PENDING_PAYMENT': '⏳',
      'CANCELLED': '❌',
      'COMPLETED': '🎯'
    };
    return icons[status] || '❓';
  }
}

export default new BookingService(); 