import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const API_KEY = 'f95fae240691afb840ca591e8677e099';

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

// Function to format date to ddmmyyyy
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// Get seat availability
router.get('/api/seat-availability', async (req, res) => {
  const { trainNumber, source, destination, date, quota, classCode } = req.query;

  if (!trainNumber || !source || !destination || !date || !quota || !classCode) {
    return res.status(400).json({
      error: 'Missing required parameters. Please provide trainNumber, source, destination, date, quota, and classCode.'
    });
  }

  try {
    const formattedDate = formatDate(date);
    const url = `http://indianrailapi.com/api/v2/SeatAvailability/apikey/${API_KEY}/TrainNumber/${trainNumber}/From/${source}/To/${destination}/Date/${formattedDate}/Quota/${quota}/Class/${classCode}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.ResponseCode !== "200") {
      return res.status(data.ResponseCode === "202" ? 503 : 400).json({
        error: data.Message || 'Failed to fetch seat availability'
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Seat availability API error:', err);
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
});

// Get station suggestions
router.get('/api/station-suggestions', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: 'Missing search query'
    });
  }

  try {
    const url = `http://indianrailapi.com/api/v2/AutoComplete/apikey/${API_KEY}/term/${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ResponseCode !== "200") {
      return res.status(data.ResponseCode === "202" ? 503 : 400).json({
        error: data.Message || 'Failed to fetch station suggestions'
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Station suggestions API error:', err);
    res.status(500).json({ error: 'Failed to fetch station suggestions' });
  }
});

// Get train schedule
router.get('/api/train-schedule', async (req, res) => {
  const { trainNumber } = req.query;

  if (!trainNumber) {
    return res.status(400).json({
      error: 'Missing train number'
    });
  }

  try {
    const url = `http://indianrailapi.com/api/v2/TrainSchedule/apikey/${API_KEY}/TrainNumber/${trainNumber}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ResponseCode !== "200") {
      return res.status(data.ResponseCode === "202" ? 503 : 400).json({
        error: data.Message || 'Failed to fetch train schedule'
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Train schedule API error:', err);
    res.status(500).json({ error: 'Failed to fetch train schedule' });
  }
});

export default router;