import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import kpiRoutes from "./routes/kpi.js";
import pairRoutes from "./routes/pairs.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";
import newApiRoutes from "./routes/newApi.js";
import axios from 'axios';


// /* CONFIGURATIONS */
// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(morgan("common"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());

// /* ROUTES */
// app.use("/kpi", kpiRoutes);
// app.use("/pairs", pairRoutes);
// // app.use("/product", productRoutes);
// // app.use("/transaction", transactionRoutes);
// app.use("/newapi", newApiRoutes);

// app.get('/api/news', async (req, res) => {
  
// });

// /* MONGOOSE SETUP */
// const PORT = process.env.PORT || 9000;
// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(async () => {
//     app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

//     /*ADD DATA ONE TIME ONLY*/
//     // await mongoose.connection.db.dropDatabase();
//     // KPI.insertMany(kpis);
//     // Product.insertMany(products);
//   })
//   .catch((error) => console.log(`${error} did not connect`));




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