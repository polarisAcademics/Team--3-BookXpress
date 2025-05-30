import express from 'express';
import axios from 'axios';

const router = express.Router();

// Updated API key for PNR status checking
const API_KEY = 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196';

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
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'irctc-indian-railway-pnr-status.p.rapidapi.com'
      }
    };

    console.log('Making API request to:', options.url);
    
    const response = await axios.request(options);
    console.log('API Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('PNR status API error:', error.response?.data || error.message);
    
    // Return mock data if API fails
    console.log('Returning mock PNR status data');
    res.json(mockPnrStatus);
  }
});

export default router; 