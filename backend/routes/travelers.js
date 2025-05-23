import express from 'express';
import Traveler from '../models/traveler.model.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all saved travelers for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('User from request:', req.user); // Debug log
    const travelers = await Traveler.find({ userId: req.user.userId });
    res.json(travelers);
  } catch (error) {
    console.error('Error fetching travelers:', error);
    res.status(500).json({ error: 'Failed to fetch travelers' });
  }
});

// Save a new traveler
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('User from request:', req.user); // Debug log
    const traveler = new Traveler({
      ...req.body,
      userId: req.user.userId
    });
    await traveler.save();
    res.status(201).json(traveler);
  } catch (error) {
    console.error('Error saving traveler:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'A traveler with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to save traveler' });
    }
  }
});

// Update a traveler
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const traveler = await Traveler.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!traveler) {
      return res.status(404).json({ error: 'Traveler not found' });
    }
    res.json(traveler);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update traveler' });
  }
});

// Delete a traveler
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const traveler = await Traveler.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!traveler) {
      return res.status(404).json({ error: 'Traveler not found' });
    }
    res.json({ message: 'Traveler deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete traveler' });
  }
});

// Set a traveler as default
router.patch('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    // First, unset all default travelers for this user
    await Traveler.updateMany(
      { userId: req.user._id },
      { $set: { isDefault: false } }
    );

    // Then set the selected traveler as default
    const traveler = await Traveler.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!traveler) {
      return res.status(404).json({ error: 'Traveler not found' });
    }

    res.json(traveler);
  } catch (error) {
    res.status(500).json({ error: 'Failed to set default traveler' });
  }
});

export default router; 