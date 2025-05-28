import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/api/PNRstatus',async(req,res)=>{
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
        error: 'Missing search query'
        });
    }
    const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${query}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'd15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196',
            'x-rapidapi-host': 'irctc-indian-railway-pnr-status.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch PNR status' });
    }
})

export default router;