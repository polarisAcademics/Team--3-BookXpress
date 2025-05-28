import axios from 'axios';

const API_URL = 'http://localhost:3000/api/payment';

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Create Razorpay order
export const createPaymentOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/create-order`, orderData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_URL}/verify-payment`, paymentData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Process payment using Razorpay
export const processPayment = async (bookingData) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Create order
    const orderData = {
      amount: bookingData.totalAmount,
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        trainId: bookingData.train.id,
        trainName: bookingData.train.name,
        passengers: bookingData.passengers.length,
      },
    };

    const orderResponse = await createPaymentOrder(orderData);
    
    if (!orderResponse.success) {
      throw new Error('Failed to create payment order');
    }

    // Configure Razorpay options
    const options = {
      key: orderResponse.key_id,
      amount: orderResponse.order.amount,
      currency: orderResponse.order.currency,
      name: 'BookXpress',
      description: `Train Booking - ${bookingData.train.name}`,
      image: '/logo.png', // Add your logo here
      order_id: orderResponse.order.id,
      handler: async function (response) {
        try {
          // Verify payment on server
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingData,
          };

          const verificationResponse = await verifyPayment(verificationData);
          
          if (verificationResponse.success) {
            return verificationResponse.booking;
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          throw error;
        }
      },
      prefill: {
        name: bookingData.contact.name,
        email: bookingData.contact.email,
        contact: bookingData.contact.phone,
      },
      notes: {
        address: bookingData.contact.address,
      },
      theme: {
        color: '#3b63f7',
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal dismissed');
        },
      },
    };

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        ...options,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData,
            };

            const verificationResponse = await verifyPayment(verificationData);
            
            if (verificationResponse.success) {
              resolve(verificationResponse.booking);
            } else {
              reject(new Error('Payment verification failed'));
            }
          } catch (error) {
            reject(error);
          }
        },
      });

      razorpay.on('payment.failed', function (response) {
        reject(new Error(`Payment failed: ${response.error.description}`));
      });

      razorpay.open();
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/payment/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
};

// Request refund
export const requestRefund = async (refundData) => {
  try {
    const response = await axios.post(`${API_URL}/refund`, refundData);
    return response.data;
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
}; 