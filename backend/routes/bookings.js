import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Temporary in-memory storage for bookings (replace with MongoDB model later)
let bookings = [];

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

// Create a booking
router.post('/', async (req, res) => {
  try {
    const booking = {
      id: Date.now().toString(),
      userId: req.user.userId, // Add the authenticated user's ID
      ...req.body,
      status: 'Confirmed',
      createdAt: new Date()
    };
    bookings.push(booking);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
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