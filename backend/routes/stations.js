import express from 'express';
import { auth } from './auth.routes.js';

const router = express.Router();

// Station data
const stationsData = {
  "stations_by_city": [
    {
      "Mumbai": {
        "station": "CHHATRAPATI Shivaji Terminus",
        "code": "CSTM"
      }
    },
    {
      "Kalyan": {
        "station": "Kalyan",
        "code": "KYN"
      }
    },
    {
      "Panvel": {
        "station": "Panvel",
        "code": "FNVL"
      }
    },
    {
      "Nashik": {
        "station": "Nasik Road",
        "code": "NK"
      }
    },
    {
      "Solapur": {
        "station": "Solapur",
        "code": "SUR"
      }
    },
    {
      "Manmad": {
        "station": "Manmad",
        "code": "MMR"
      }
    },
    {
      "Gulbarga": {
        "station": "Gulbarga",
        "code": "GR"
      }
    },
    {
      "Akola": {
        "station": "Akola",
        "code": "AK"
      }
    },
    {
      "Jalgaon": {
        "station": "Jalgaon",
        "code": "JL"
      }
    },
    {
      "Miraj": {
        "station": "Miraj",
        "code": "MRJ"
      }
    },
    {
      "Sainagar Siridi": {
        "station": "Sainagar sirdih",
        "code": "SNSI"
      }
    },
    {
      "Kolhapur": {
        "station": "Kolhapur",
        "code": "KOP"
      }
    },
    {
      "Badnera": {
        "station": "Badnera",
        "code": "BD"
      }
    },
    {
      "Khandawa": {
        "station": "Khandawa",
        "code": "KNW"
      }
    },
    {
      "Kopargaon": {
        "station": "Kopargaon",
        "code": "KPG"
      }
    },
    {
      "Daud": {
        "station": "Daud",
        "code": "DD"
      }
    },
    {
      "Ahmadnagar": {
        "station": "Ahmad nagar",
        "code": "ANG"
      }
    },
    {
      "Wardha": {
        "station": "Wardna",
        "code": "WR"
      }
    },
    {
      "Shegaon": {
        "station": "Shegaon",
        "code": "SEG"
      }
    },
    {
      "Amravati": {
        "station": "Amrawati",
        "code": "AMI"
      }
    },
    {
      "Balharshah": {
        "station": "BALHARSHAH",
        "code": "BPQ"
      }
    },
    {
      "Lonavala": {
        "station": "Lonavala",
        "code": "LNL"
      }
    },
    {
      "Chandrapur": {
        "station": "Chandrapur",
        "code": "CD"
      }
    },
    {
      "Latur": {
        "station": "Latur",
        "code": "LUR"
      }
    },
    {
      "Betul": {
        "station": "Betul",
        "code": "BZU"
      }
    },
    {
      "Burhanpur": {
        "station": "Burhanpur",
        "code": "BAU"
      }
    },
    {
      "Kurduwadi": {
        "station": "Kurduwadi",
        "code": "KWV"
      }
    },
    {
      "Chalisgaon": {
        "station": "Chalisgaon",
        "code": "CSN"
      }
    },
    {
      "Malkapur": {
        "station": "Malkapur",
        "code": "MKU"
      }
    },
    {
      "Sewagram": {
        "station": "Sewagram",
        "code": "SEGM"
      }
    },
    {
      "Bhiwandi": {
        "station": "Bhiwandi Road",
        "code": "BIRD"
      }
    },
    {
      "Wadi": {
        "station": "wadi",
        "code": "WADI"
      }
    },
    {
      "Dombivali": {
        "station": "Dombivali",
        "code": "DI"
      }
    },
    {
      "Badalapur": {
        "station": "Badalapur",
        "code": "BUD"
      }
    },
    {
      "Ghatkopar": {
        "station": "Ghatkopar",
        "code": "GC"
      }
    },
    {
      "Kurla": {
        "station": "Kurla",
        "code": "CLA"
      }
    },
    {
      "Ambarnath": {
        "station": "Ambarnath",
        "code": "ABH"
      }
    },
    {
      "Mankhurd": {
        "station": "Mankhurd",
        "code": "MNKD"
      }
    },
    {
      "Mulund": {
        "station": "Mulund",
        "code": "MLND"
      }
    },
    {
      "Mumbra": {
        "station": "Mumbra",
        "code": "MBQ"
      }
    },
    {
      "Belapur": {
        "station": "Belapur",
        "code": "BEPR"
      }
    },
    {
      "Borivali": {
        "station": "Borivali Railway Station",
        "code": "BVI"
      }
    },
    {
      "New Delhi": {
        "station": "New Delhi Railway Station",
        "code": "NDLS"
      }
    }
  ]
};

// Helper function to find station code by city name
export const findStationCode = (cityName) => {
  if (!cityName) return null;
  
  const normalizedCityName = cityName.toLowerCase().trim();
  
  // First try exact match
  for (const cityData of stationsData.stations_by_city) {
    const cityKey = Object.keys(cityData)[0];
    if (cityKey.toLowerCase() === normalizedCityName) {
      return cityData[cityKey].code;
    }
  }
  
  // If no exact match, try partial match
  for (const cityData of stationsData.stations_by_city) {
    const cityKey = Object.keys(cityData)[0];
    if (cityKey.toLowerCase().includes(normalizedCityName) || 
        cityData[cityKey].station.toLowerCase().includes(normalizedCityName) ||
        cityData[cityKey].code.toLowerCase().includes(normalizedCityName)) {
      return cityData[cityKey].code;
    }
  }
  
  return null;
};

// Get station code by city name
router.get('/code/:city', (req, res) => {
  const { city } = req.params;
  const stationCode = findStationCode(city);
  
  if (!stationCode) {
    return res.status(404).json({ 
      message: 'City not found',
      city: city
    });
  }
  
  res.json({ 
    city: city,
    stationCode: stationCode
  });
});

// Search trains between two cities
router.get('/search', auth, async (req, res) => {
  try {
    const { fromCity, toCity, date } = req.query;
    
    if (!fromCity || !toCity || !date) {
      return res.status(400).json({
        message: 'Missing required parameters',
        required: ['fromCity', 'toCity', 'date']
      });
    }

    const fromCode = findStationCode(fromCity);
    const toCode = findStationCode(toCity);

    if (!fromCode) {
      return res.status(404).json({
        message: 'Source city not found',
        city: fromCity
      });
    }

    if (!toCode) {
      return res.status(404).json({
        message: 'Destination city not found',
        city: toCity
      });
    }

    // Here you would typically make an API call to IRCTC or your train database
    // For now, we'll return a mock response
    res.json({
      fromCity,
      toCity,
      fromCode,
      toCode,
      date,
      trains: [
        {
          trainNumber: "12345",
          trainName: "Sample Express",
          departure: "08:00",
          arrival: "12:00",
          duration: "4h 0m",
          classes: ["1A", "2A", "3A", "SL"],
          fare: {
            "1A": 1500,
            "2A": 800,
            "3A": 500,
            "SL": 250
          }
        }
      ]
    });
  } catch (error) {
    console.error('Train search error:', error);
    res.status(500).json({
      message: 'Error searching for trains',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all available cities
router.get('/cities', (req, res) => {
  const cities = stationsData.stations_by_city.map(cityData => {
    const cityName = Object.keys(cityData)[0];
    return {
      name: cityName,
      station: cityData[cityName].station,
      code: cityData[cityName].code
    };
  });
  
  res.json({ cities });
});

// Add a new endpoint for station search/autocomplete
router.get('/autocomplete', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      message: 'Search query is required'
    });
  }
  
  const searchTerm = query.toLowerCase().trim();
  const results = stationsData.stations_by_city
    .filter(cityData => {
      const cityKey = Object.keys(cityData)[0];
      const stationData = cityData[cityKey];
      return cityKey.toLowerCase().includes(searchTerm) ||
             stationData.station.toLowerCase().includes(searchTerm) ||
             stationData.code.toLowerCase().includes(searchTerm);
    })
    .map(cityData => {
      const cityKey = Object.keys(cityData)[0];
      const stationData = cityData[cityKey];
      return {
        city: cityKey,
        station: stationData.station,
        code: stationData.code
      };
    });
  
  res.json(results);
});

export default router; 