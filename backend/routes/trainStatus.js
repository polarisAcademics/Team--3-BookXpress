import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/trainstatus', async (req, res) => {
  // Assuming the frontend might send trainNumber, fromStation, or toStation as query params.
  // The getLiveStation API might expect a stationCode.
  // For now, let's see what the frontend sends or if a generic query works.
  // You might need to adjust parameters based on the exact API requirements for getLiveStation.
  const { trainNumber, fromStation, toStation, hours = '1' } = req.query;

  // A more specific parameter like stationCode might be needed by the actual API.
  // This is a placeholder; the frontend might need to send a more specific station identifier.
  const queryIdentifier = fromStation || toStation || trainNumber;

  if (!queryIdentifier) {
    return res.status(400).json({ error: 'Missing required query parameter (e.g., fromStation, toStation, or trainNumber)' });
  }

  // Construct the URL. Note: The API might expect a specific station code.
  // The example you gave is: https://irctc1.p.rapidapi.com/api/v3/getLiveStation?hours=1
  // It seems to imply it might fetch for a default or pre-configured station if no station is specified.
  // Or it might require a stationCode in the path or query. This needs clarification from API docs.
  // For now, I am using it as is, with hours as a parameter.
  // If a station code is needed, the URL should be like: `https://irctc1.p.rapidapi.com/api/v3/getLiveStation/${stationCode}?hours=${hours}`
  // Or `https://irctc1.p.rapidapi.com/api/v3/getLiveStation?stationCode=${stationCode}&hours=${hours}`
  const url = `https://irctc1.p.rapidapi.com/api/v3/getLiveStation?hours=${hours}`;
  // If you intended to use queryIdentifier for a station code, it would be:
  // const url = `https://irctc1.p.rapidapi.com/api/v3/getLiveStation/${queryIdentifier}?hours=${hours}`;
  // OR
  // const url = `https://irctc1.p.rapidapi.com/api/v3/getLiveStation?stationCode=${queryIdentifier}&hours=${hours}`;


  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196',
      'x-rapidapi-host': 'irctc1.p.rapidapi.com'
      // Removed 'x-rapid-api': 'rapid-api-database' as it might not be needed for this host
    }
  };

  try {
    console.log(`Fetching live station data from: ${url}`);
    const response = await fetch(url, options);
    const resultText = await response.text(); // Get raw text
    console.log("API Raw Response:", resultText);

    if (!response.ok) {
        // Try to parse as JSON if it's an error, otherwise use raw text
        let errorData = resultText;
        try {
            errorData = JSON.parse(resultText);
        } catch (e) {
            // ignore, use raw text
        }
        console.error("API Error Response:", errorData);
        return res.status(response.status).json({ 
            message: 'Failed to fetch live station data from RapidAPI', 
            details: errorData 
        });
    }

    // Attempt to parse as JSON assuming successful response is JSON
    let data;
    try {
        data = JSON.parse(resultText);
    } catch (e) {
        console.error("Failed to parse API response as JSON:", e);
        return res.status(500).json({ message: 'Failed to parse train status data from API.', details: resultText });
    }

    res.json(data);
  } catch (error) {
    console.error("Network or other error fetching train status:", error);
    res.status(500).json({ error: 'Failed to fetch train status due to a network or server error.', details: error.message });
  }
});

export default router;