import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Temporary in-memory storage for bookings (replace with MongoDB model later)
let bookings = [];

// Get all bookings
router.get('/api/bookings', async (req, res) => {
  try {
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a booking
router.post('/api/bookings', async (req, res) => {
  try {
    const booking = {
      id: Date.now().toString(),
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
router.post('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    booking.status = 'Cancelled';
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router; 