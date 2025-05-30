import express from 'express';
import axios from 'axios';

const router = express.Router();
<<<<<<< HEAD

// Mock PNR status data for when API is unavailable
const mockPnrStatus = {
  data: {
    pnrNumber: "4531340326",
    trainNumber: "12951",
    trainName: "MUMBAI RAJDHANI",
    dateOfJourney: "2024-03-25T00:00:00.000Z",
    sourceStation: "MUMBAI CENTRAL",
    destinationStation: "NEW DELHI",
    journeyClass: "3A",
    chartStatus: "CHART PREPARED",
    passengerList: [
      {
        bookingStatus: "CNF/B3/23",
        currentStatus: "CNF/B3/23"
      }
    ],
    generatedTimeStamp: new Date().toISOString()
  }
};
=======
const API_KEY = '9a43e9d002mshed90898683d9dd3p143a5fjsn7e1d2c2f1ab7';
>>>>>>> parent of 1f18db2 (🚀 Major Booking System Overhaul & Bug Fixes - Fixed auth token storage, updated API keys, implemented complete MongoDB booking system with payment integration, enhanced UI components, added statistics dashboard, and improved error handling for production-ready booking flow)

router.get('/', async (req, res) => {
  const { pnr } = req.query;
  console.log('Received PNR status request for:', pnr);

  // Validate PNR
  if (!pnr) {
    return res.status(400).json({ 
      error: 'Missing PNR number. Please provide a valid PNR number.' 
    });
  }

  if (!/^\d{10}$/.test(pnr)) {
    return res.status(400).json({
      error: 'Invalid PNR format. Please provide a 10-digit PNR number.'
    });
  }

  try {
    const options = {
      method: 'GET',
      url: `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`,
      headers: {
        'X-RapidAPI-Key': process.env.PNR_API_KEY,
        'X-RapidAPI-Host': 'irctc-indian-railway-pnr-status.p.rapidapi.com'
      }
    };

    console.log('Making API request to:', options.url);
    
    const response = await axios.request(options);
    console.log('API Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('PNR status API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || 'Failed to fetch PNR status',
      details: error.message
    });
  }
});

export default router; 