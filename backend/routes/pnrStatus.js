import express from 'express';
import config from '../config.js';

const router = express.Router();

// RapidAPI configuration from config
const { apiKey: PNR_API_KEY, host: RAPIDAPI_HOST } = config.pnr;

// Debug: Log configuration on route initialization
console.log('PNR Route Configuration:');
console.log('PNR_API_KEY exists:', !!PNR_API_KEY);
console.log('PNR_API_KEY length:', PNR_API_KEY?.length);
console.log('RAPIDAPI_HOST:', RAPIDAPI_HOST);

// Middleware to check API key
const checkApiKey = (req, res, next) => {
  if (!PNR_API_KEY) {
    console.error('PNR_API_KEY is not set in environment variables');
    return res.status(500).json({
      success: false,
      error: 'API key is not configured'
    });
  }
  next();
};

router.get('/', checkApiKey, async (req, res) => {
  const { pnr } = req.query;

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid 10-digit PNR number.'
    });
  }

  try {
    const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': PNR_API_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    };
    
    const response = await fetch(url, options);
    const result = await response.text();
    
    let data = JSON.parse(result);
    
    if (data.message === 'You are not subscribed to this API.') {
      console.error('RapidAPI subscription error:', data);
      return res.status(403).json({
        success: false,
        error: 'API subscription error. Please check your RapidAPI subscription.',
        details: data
      });
    }
    
    return res.json(data);
  } catch (error) {
    console.error('PNR status API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch PNR status'
    });
  }
});

export default router; 