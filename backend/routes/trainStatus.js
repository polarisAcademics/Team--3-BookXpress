import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const API_KEY = 'f95fae240691afb840ca591e8677e099';

// Function to format date to ddmmyyyy
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

router.get('/trainstatus', async (req, res) => {
  const { trainNumber, date } = req.query;
  
  if (!trainNumber || !date) {
    return res.status(400).json({ 
      error: 'Missing required parameters. Please provide trainNumber and date.' 
    });
  }

  try {
    const formattedDate = formatDate(date);
    const url = `http://indianrailapi.com/api/v2/livetrainstatus/apikey/${API_KEY}/trainnumber/${trainNumber}/date/${formattedDate}/`;
    
    console.log('Requesting train status from:', url);
    
    const response = await fetch(url);
    
    // Check if response is OK and is JSON
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Handle different response codes
    switch (data.ResponseCode) {
      case "200":
        return res.json(data);
      case "202":
        // Server busy - send as 503 Service Unavailable
        return res.status(503).json({
          error: 'Server is busy. Please try again in a few moments.',
          retryAfter: 5, // Suggest retry after 5 seconds
          code: 'SERVER_BUSY'
        });
      case "204":
        // No data found
        return res.status(404).json({
          error: 'No train data found for the given parameters.',
          code: 'NO_DATA'
        });
      default:
        // Any other response code
        return res.status(400).json({
          error: data.Message || 'Failed to fetch train status',
          code: data.ResponseCode
        });
    }
  } catch (err) {
    console.error('Train status API error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch train status. Please try again later.',
      details: err.message
    });
  }
});

export default router;