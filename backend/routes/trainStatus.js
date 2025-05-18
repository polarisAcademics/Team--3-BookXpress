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

    // Check if the API response indicates an error
    if (data.ResponseCode !== "200") {
      return res.status(400).json({
        error: data.Message || 'Failed to fetch train status'
      });
    }

    // Transform the response to match our frontend expectations
    const transformedData = {
      responseCode: data.ResponseCode,
      startDate: data.StartDate,
      trainNumber: data.TrainNumber,
      currentPosition: data.CurrentPosition,
      currentStation: data.CurrentStation,
      trainRoute: data.TrainRoute,
      message: data.Message
    };

    res.json(transformedData);
  } catch (err) {
    console.error('Train status API error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch train status. Please try again later.',
      details: err.message
    });
  }
});

export default router; 