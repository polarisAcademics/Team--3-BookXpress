import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking.model.js';
import User from '../models/user.model.js'; // Assuming you might need User model for some checks
import jwt from 'jsonwebtoken'; // For authentication

const router = express.Router();

// Temporary in-memory storage for bookings (replace with MongoDB model later)
let bookings = [];

// Middleware to authenticate and get user ID
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }
  const token = authHeader.split(' ')[1];
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Store a booking from payment verification
router.post('/store', async (req, res) => {
  try {
    const booking = {
      ...req.body,
      createdAt: new Date()
    };
    bookings.push(booking);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store booking' });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const userBookings = bookings.filter(booking => booking.userId === req.user.userId);
    res.json({ bookings: userBookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create a new booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { trainDetails, passengers, totalFare, paymentDetails } = req.body;

    // Basic validation
    if (!trainDetails || !passengers || !totalFare || !paymentDetails || !paymentDetails.transactionId) {
      return res.status(400).json({ message: 'Missing required booking information.' });
    }

    // Ensure payment was successful before confirming booking
    // You might have more robust checks or webhooks from payment gateway for this
    if (paymentDetails.status !== 'SUCCESSFUL') {
        return res.status(400).json({ message: 'Payment was not successful. Booking cannot be confirmed.' });
    }

    const newBooking = new Booking({
      userId: req.userId,
      trainDetails,
      passengers,
      totalFare,
      paymentDetails,
      status: 'CONFIRMED', // Mark as confirmed since payment is successful
    });

    await newBooking.save();
    
    // Populate user details if needed, though userId is stored
    // await newBooking.populate('userId', 'name email'); // Example if you need to return user info

    res.status(201).json({ 
        message: 'Booking created successfully!',
        booking: newBooking 
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.code === 11000) { // Duplicate key error (e.g., transactionId)
        return res.status(409).json({ message: 'Duplicate transaction ID. This booking might already exist.' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ message: 'Failed to create booking. Please try again later.' });
  }
});

// GET /api/bookings/my-bookings - Get bookings for the logged-in user
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
                                  .sort({ bookingDate: -1 })
                                  .populate('userId', 'name email'); // Optional: populate user details

    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]); // Return empty array if no bookings, not 404
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to retrieve your bookings. Please try again later.' });
  }
});

// GET /api/bookings/:bookingId - Get a specific booking by its ID
router.get('/:bookingId', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }

        const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or you do not have permission to view it.' });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        res.status(500).json({ message: 'Failed to retrieve the booking. Please try again later.' });
    }
});

// Cancel a booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if the booking belongs to the authenticated user
    if (booking.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }
    
    booking.status = 'Cancelled';
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router; 