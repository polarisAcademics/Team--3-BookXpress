import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/trainstatus', async (req, res) => {
  const { trainNumber } = req.query;
  if (!trainNumber) {
    return res.status(400).json({ error: 'Missing train number' });
  }

  const url = `https://indian-railway-irctc.p.rapidapi.com/api/trains-search/v1/train/${trainNumber}?isH5=true&client=web`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'f4237fdb24msh9d229765a1e7f50p11beedjsn48c4fef03257',
      'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
      'x-rapid-api': 'rapid-api-database'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch train status' });
  }
});

export default router;