import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';


// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());

app.get('/api/news', async (req, res) => {
    try {
        const apiKey = process.env.MARKETAUX_API_KEY;
        const page = req.query.page || 1;
        
        const response = await axios.get('https://api.marketaux.com/v1/news/all', {
            params: {
                api_token: apiKey,
                countries: 'us',
                filter_entities: 'true',
                limit: 10,
                page: page
            }
        });

        const articles = response.data.data;
        res.json(articles);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});