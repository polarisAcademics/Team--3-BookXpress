import express from 'express';
import fetch from 'node-fetch';

const API_KEY = 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196';
const router = express.Router();

// Temporary train data (replace with actual database later)
// const trains = [
//   {
//     number: "12951",
//     name: "Mumbai Rajdhani",
//     departure: "16:25",
//     arrival: "08:15",
//     duration: "15h 50m",
//     fare: 1245,
//     availability: 42
//   },
//   {
//     number: "12952",
//     name: "Delhi Rajdhani",
//     departure: "17:00",
//     arrival: "10:05",
//     duration: "17h 05m",
//     fare: 1550,
//     availability: 12
//   }
// ];

// Search trains - REMOVED as search is handled by trainSearch.js
// router.post('/api/search-trains', async (req, res) => {
//   try {
//     // In a real application, you would search the database based on the criteria
//     // For now, just return the sample data
//     res.json({ trains });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to search trains' });
//   }
// });

// Function to format date to ddmmyyyy
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// Get station suggestions
router.get('/station-suggestions', async (req, res) => {
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

    // Assuming the external API returns an array of suggestions, adjust if needed
    res.json(data.Suggestions || []); 

  } catch (err) {
    console.error('Station suggestions API error:', err);
    res.status(500).json({ error: 'Failed to fetch station suggestions' });
  }
});


export default router;