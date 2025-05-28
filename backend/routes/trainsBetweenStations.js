import express from 'express';
import fetch from 'node-fetch';
import { findStationCode } from './stations.js';

const router = express.Router();

// RapidAPI configuration
const RAPIDAPI_KEY = 'ec516f3c6emsh37495040e73e766p1f6312jsna2f2fc4641b2';
const RAPIDAPI_HOST = 'irctc1.p.rapidapi.com';

// Rate limiting configuration
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return next();
  }
  
  const userLimit = rateLimit.get(ip);
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (userLimit.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again after a minute',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }
  
  userLimit.count++;
  next();
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

    // Format date to YYYY-MM-DD if not already in that format
    const formattedDate = date.includes('-') ? date : new Date(date).toISOString().split('T')[0];

    // Construct API URL for train between stations
    const url = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromCode}&toStationCode=${toCode}&dateOfJourney=${formattedDate}`;
    
    console.log('Making API request to:', url);
    
    // Make API request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Raw API Response:', JSON.stringify(responseData, null, 2));

    // Transform the response to match frontend expectations
    const transformedData = {
      status: true,
      fromCity: fromStation,
      toCity: toStation,
      fromCode,
      toCode,
      date: responseData.data?.[0]?.train_date || formattedDate,
      trains: Array.isArray(responseData.data) ? responseData.data.map(train => ({
        trainNumber: train.train_number,
        trainName: train.train_name,
        fromStation: {
          code: train.from,
          name: train.from_station_name,
          departure: train.from_std
        },
        toStation: {
          code: train.to,
          name: train.to_station_name,
          arrival: train.to_std
        },
        duration: train.duration,
        availableClasses: train.class_type || ['1A', '2A', '3A', 'SL'],
        runningDays: train.run_days || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        trainType: train.train_type,
        specialTrain: train.special_train,
        journeyDate: train.train_date
      })) : []
    };

    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

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