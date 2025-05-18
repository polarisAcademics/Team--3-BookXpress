import express from 'express';

const router = express.Router();

// Temporary train data (replace with actual database later)
const trains = [
  {
    number: "12951",
    name: "Mumbai Rajdhani",
    departure: "16:25",
    arrival: "08:15",
    duration: "15h 50m",
    fare: 1245,
    availability: 42
  },
  {
    number: "12952",
    name: "Delhi Rajdhani",
    departure: "17:00",
    arrival: "10:05",
    duration: "17h 05m",
    fare: 1550,
    availability: 12
  }
];

// Search trains
router.post('/api/search-trains', async (req, res) => {
  try {
    // In a real application, you would search the database based on the criteria
    // For now, just return the sample data
    res.json({ trains });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search trains' });
  }
});

export default router; 