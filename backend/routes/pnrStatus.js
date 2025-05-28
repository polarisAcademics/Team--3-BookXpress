import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const API_KEY = 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196';

router.get('/', async (req, res) => {
  const { pnr } = req.query;
  
  console.log('Received PNR status request for:', pnr);
  
  if (!pnr) {
    console.log('Error: Missing PNR number');
    return res.status(400).json({ 
      error: 'Missing PNR number. Please provide a valid PNR number.' 
    });
  }

  if (!/^\d{10}$/.test(pnr)) {
    console.log('Error: Invalid PNR format');
    return res.status(400).json({
      error: 'Invalid PNR format. Please provide a 10-digit PNR number.'
    });
  }

  try {
    const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`;
    console.log('Making API request to:', url);
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'irctc-indian-railway-pnr-status.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.message || 'Failed to fetch PNR status');
    }

    res.json(data);
  } catch (err) {
    console.error('PNR status API error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch PNR status. Please try again later.',
      details: err.message
    });
  }
});

export default router; 