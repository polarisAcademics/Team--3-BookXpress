import express from 'express';
import { findStationCode } from './stations.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import fetch from 'node-fetch';

const router = express.Router();

// API Configuration - Updated API key
const RAPIDAPI_KEY = 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196';
const RAPIDAPI_HOST = 'irctc1.p.rapidapi.com';

// Mock train data for testing and fallback
const mockTrains = {
  // Mumbai CST to New Delhi route
  "CSTM-NDLS": [
    {
      train_number: "12951",
      train_name: "Mumbai Rajdhani",
      from: "CSTM",
      to: "NDLS",
      from_station_name: "Mumbai CST",
      to_station_name: "New Delhi",
      from_std: "16:35",
      to_std: "08:35",
      duration: "16h 00m",
      class_type: ["1A", "2A", "3A"],
      run_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      train_type: "Rajdhani",
      special_train: false,
      fare: {
        "1A": 4500,
        "2A": 2800,
        "3A": 1900
      }
    },
    {
      train_number: "12953",
      train_name: "August Kranti Rajdhani",
      from: "CSTM",
      to: "NDLS",
      from_station_name: "Mumbai CST",
      to_station_name: "New Delhi",
      from_std: "17:40",
      to_std: "10:30",
      duration: "16h 50m",
      class_type: ["1A", "2A", "3A"],
      run_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      train_type: "Rajdhani",
      special_train: false,
      fare: {
        "1A": 4300,
        "2A": 2600,
        "3A": 1800
      }
    },
    {
      train_number: "12909",
      train_name: "Mumbai-Delhi Duronto",
      from: "CSTM",
      to: "NDLS",
      from_station_name: "Mumbai CST",
      to_station_name: "New Delhi",
      from_std: "22:15",
      to_std: "16:30",
      duration: "18h 15m",
      class_type: ["1A", "2A", "3A", "SL"],
      run_days: ["MON", "WED", "FRI", "SUN"],
      train_type: "Duronto",
      special_train: false,
      fare: {
        "1A": 4200,
        "2A": 2500,
        "3A": 1700,
        "SL": 850
      }
    }
  ],
  // New Delhi to Mumbai CST route (reverse direction)
  "NDLS-CSTM": [
    {
      train_number: "12952",
      train_name: "Mumbai Rajdhani",
      from: "NDLS",
      to: "CSTM",
      from_station_name: "New Delhi",
      to_station_name: "Mumbai CST",
      from_std: "16:35",
      to_std: "08:35",
      duration: "16h 00m",
      class_type: ["1A", "2A", "3A"],
      run_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      train_type: "Rajdhani",
      special_train: false,
      fare: {
        "1A": 4500,
        "2A": 2800,
        "3A": 1900
      }
    },
    {
      train_number: "12954",
      train_name: "August Kranti Rajdhani",
      from: "NDLS",
      to: "CSTM",
      from_station_name: "New Delhi",
      to_station_name: "Mumbai CST",
      from_std: "17:40",
      to_std: "10:30",
      duration: "16h 50m",
      class_type: ["1A", "2A", "3A"],
      run_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      train_type: "Rajdhani",
      special_train: false,
      fare: {
        "1A": 4300,
        "2A": 2600,
        "3A": 1800
      }
    }
  ]
};

// Helper function to get mock data for any route
const getMockTrainsForRoute = (fromCode, toCode) => {
  // Try to find exact route match
  const exactMatch = mockTrains[`${fromCode}-${toCode}`];
  if (exactMatch) return exactMatch;

  // If no exact match, generate some dummy data
  return [
    {
      train_number: `${fromCode}${toCode}01`,
      train_name: `${fromCode}-${toCode} Express`,
      from: fromCode,
      to: toCode,
      from_station_name: fromCode,
      to_station_name: toCode,
      from_std: "06:00",
      to_std: "18:00",
      duration: "12h 00m",
      class_type: ["1A", "2A", "3A", "SL"],
      run_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
      train_type: "Express",
      special_train: false,
      fare: {
        "1A": 3000,
        "2A": 2000,
        "3A": 1500,
        "SL": 800
      }
    },
    {
      train_number: `${fromCode}${toCode}02`,
      train_name: `${fromCode}-${toCode} Superfast`,
      from: fromCode,
      to: toCode,
      from_station_name: fromCode,
      to_station_name: toCode,
      from_std: "15:00",
      to_std: "03:00",
      duration: "12h 00m",
      class_type: ["2A", "3A", "SL"],
      run_days: ["MON", "WED", "FRI", "SUN"],
      train_type: "Superfast",
      special_train: false,
      fare: {
        "2A": 1800,
        "3A": 1200,
        "SL": 600
      }
    }
  ];
};

router.get('/', rateLimiter, async (req, res) => {
  try {
    const { fromStation, toStation, date } = req.query;

    // Validate required parameters
    if (!fromStation || !toStation || !date) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'fromStation, toStation, and date are required'
      });
    }

    // Get station codes
    const fromCode = findStationCode(fromStation);
    const toCode = findStationCode(toStation);

    if (!fromCode) {
      return res.status(404).json({
        error: 'Source station not found',
        message: `Could not find station code for ${fromStation}`
      });
    }

    if (!toCode) {
      return res.status(404).json({
        error: 'Destination station not found',
        message: `Could not find station code for ${toStation}`
      });
    }

    let trainData;
    let usedMockData = false;

    try {
      // First try to get data from the API
      if (RAPIDAPI_KEY) {
        const formattedDate = date.includes('-') ? date : new Date(date).toISOString().split('T')[0];
        const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromCode}&toStationCode=${toCode}&dateOfJourney=${formattedDate}`;
        
        console.log('Attempting API request to:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const apiData = await response.json();
        if (apiData.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
          trainData = apiData.data;
        } else {
          throw new Error('No train data received from API');
        }
      } else {
        throw new Error('RAPIDAPI_KEY not configured');
      }
    } catch (apiError) {
      console.log('API request failed, falling back to mock data:', apiError.message);
      // If API call fails, use mock data
      trainData = getMockTrainsForRoute(fromCode, toCode);
      usedMockData = true;
    }

    // Transform the data to match frontend expectations
    const transformedData = {
      status: true,
      fromCity: fromStation,
      toCity: toStation,
      fromCode,
      toCode,
      date,
      usedMockData, // Flag to indicate if we used mock data
      trains: trainData.map(train => ({
        trainNumber: train.train_number || train.trainNumber,
        trainName: train.train_name || train.trainName,
        fromStation: {
          code: train.from,
          name: train.from_station_name || fromStation,
          departure: train.from_std || train.departure
        },
        toStation: {
          code: train.to,
          name: train.to_station_name || toStation,
          arrival: train.to_std || train.arrival
        },
        duration: train.duration,
        availableClasses: train.class_type || train.availableClasses || ["1A", "2A", "3A", "SL"],
        runningDays: train.run_days || train.runningDays || ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        trainType: train.train_type || train.trainType || "Express",
        specialTrain: train.special_train || false,
        fare: train.fare || {
          "1A": 3000,
          "2A": 2000,
          "3A": 1500,
          "SL": 800
        }
      }))
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Train search error:', error);
    res.status(500).json({
      status: false,
      error: 'Failed to fetch trains',
      message: error.message
    });
  }
});

export default router; 