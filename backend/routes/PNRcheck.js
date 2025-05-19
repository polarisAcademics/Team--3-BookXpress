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
    const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnrNumber}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '9a43e9d002mshed90898683d9dd3p143a5fjsn7e1d2c2f1ab7',
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
    }
})

export default router;