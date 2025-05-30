import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Temporary storage for bookings (in a real app, use a database)
let confirmedBookings = [];

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'n3kpcHbWeiCBhZX9Wy4Rl1B5',
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
});

// Verify payment and create booking
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Payment verified successfully, create the booking
    const booking = {
      id: Date.now().toString(),
      pnr: generatePNR(),
      train: bookingData.train,
      selectedClass: bookingData.selectedClass,
      passengers: bookingData.passengers,
      contact: bookingData.contact,
      totalAmount: bookingData.totalAmount,
      appliedDiscount: bookingData.appliedDiscount,
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
      },
      status: 'Confirmed',
      createdAt: new Date(),
      travelDate: bookingData.travelDate,
    };

    // Store the booking in our temporary array
    // In a real app, you would save this to your database
    confirmedBookings.push(booking);
    
    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
});

// Get payment status
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
});

// Refund payment (for cancellations)
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason = 'requested_by_customer' } = req.body;
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paisa
      speed: 'normal',
      notes: {
        reason,
      },
    });

    res.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
});

// Get all confirmed bookings
router.get('/bookings', async (req, res) => {
  try {
    res.json({
      success: true,
      bookings: confirmedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
});

// Helper function to generate PNR
function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default router; 