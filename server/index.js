import express from "express";
import bodyParser from "body-parser";
//import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import stockRoutes from "./routes/trending.js";
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ROUTES */

const PORT = process.env.PORT || 9000;

app.use("/trending", stockRoutes);

app.get('/api/news', async (req, res) => {
  try {
      const apiKey = "v63Jt7pHuDB9vTsuRYrk8rHFsbhaBhF9vTtmNhwU";
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

/* MONGOOSE SETUP */
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

app.use(cors()); // Allow frontend requests

// List of top 10 most traded stocks
const TOP_10_STOCKS = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "NFLX", "AMD"];

// Function to fetch stock information
const getStockInfo = async (ticker) => {
    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
        const response = await axios.get(url);
        
        const data = response.data.chart.result[0];
        if (!data || !data.meta) {
            return { Stock: ticker, Error: "No data available" };
        }

        const prices = data.indicators.quote[0].close;
        if (!prices || prices.length < 2) {
            return { Stock: ticker, Error: "Insufficient data" };
        }

        const latestPrice = prices[prices.length - 1];
        const previousPrice = prices[prices.length - 2];

        // Calculate percentage change
        const changePercent = ((latestPrice - previousPrice) / previousPrice) * 100;

        return {
            Stock: ticker,
            "Latest Price": `$${latestPrice.toFixed(2)}`,
            Change: `${changePercent.toFixed(2)}%`,
            "Previous Close": `$${previousPrice.toFixed(2)}`
        };

    } catch (error) {
        console.error(`Error fetching stock data for ${ticker}:`, error.message);
        return { Stock: ticker, Error: "Failed to retrieve data" };
    }
};

// Route to get stock data for top 10 traded stocks
app.get("/stocks/top10", async (req, res) => {
    const stockData = await Promise.all(TOP_10_STOCKS.map(getStockInfo));
    res.json(stockData);
});

// Route to get stock data for a single ticker
app.get("/stock/:ticker", async (req, res) => {
    const stockInfo = await getStockInfo(req.params.ticker.toUpperCase());
    res.json(stockInfo);
});

// Route to get stock chart data for the past month
app.get("/stock/:ticker/chart", async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`;
        const response = await axios.get(url);
        const data = response.data.chart.result[0];

        if (!data || !data.timestamp || !data.indicators.quote[0].close) {
            return res.status(404).json({ error: "No chart data available" });
        }

        // Ensure timestamps and closing prices are aligned
        const chartData = data.timestamp
            .map((time, index) => {
                const price = data.indicators.quote[0].close[index];
                if (price === null || price === undefined) return null; // Filter out invalid data points
                return {
                    time: new Date(time * 1000).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
                    price: parseFloat(price.toFixed(2)), // Ensure correct float conversion
                };
            })
            .filter((point) => point !== null) // Remove any null entries
            .sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time to ensure proper order

        res.json({ chart: chartData });
    } catch (error) {
        console.error(`Error fetching chart data for ${ticker}:`, error.message);
        res.status(500).json({ error: "Failed to fetch chart data" });
    }
});

app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
