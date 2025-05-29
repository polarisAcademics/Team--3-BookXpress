import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/booking.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_hwRfIuKJQudGqL',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'n3kpcHbWeiCBhZX9Wy4Rl1B5',
});

// Middleware to authenticate and get user ID (optional for some routes)
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGFyc2hpdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODMyOTQxNn0.YP1jIFH38LEkEdXailiPB_EZzKpcixQcLqxODG0Bb7c');
      req.userId = decoded.userId;
    } catch (err) {
      console.log('Auth failed, continuing without user ID');
    }
  }
  next();
};

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
router.post('/verify-payment', authenticate, async (req, res) => {
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

    // Payment verified successfully, create the booking in MongoDB
    const newBooking = new Booking({
      userId: req.userId, // From auth middleware
      trainDetails: {
        trainId: bookingData.train.id,
        name: bookingData.train.name,
        number: bookingData.train.id,
        fromStation: bookingData.train.from,
        toStation: bookingData.train.to,
        journeyDate: new Date(bookingData.travelDate),
        departureTime: bookingData.train.departure || '00:00',
        arrivalTime: bookingData.train.arrival || '00:00',
        selectedClass: bookingData.selectedClass,
      },
      passengers: bookingData.passengers.map(p => ({
        name: p.name,
        age: parseInt(p.age),
        gender: p.gender,
      })),
      totalFare: bookingData.totalAmount,
      paymentDetails: {
        transactionId: razorpay_payment_id,
        paymentGateway: 'Razorpay',
        amount: bookingData.totalAmount,
        status: 'SUCCESSFUL',
        paymentDate: new Date(),
      },
      status: 'CONFIRMED',
    });

    await newBooking.save();
    
    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      booking: newBooking,
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
router.get('/bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      bookings,
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