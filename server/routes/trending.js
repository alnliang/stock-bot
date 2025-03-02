import express from "express";
import axios from "axios"; // Import axios

const router = express.Router();
const API_KEY = "V9QUVNOXRTJ0K5EM";

router.get("/gainers", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
    );
    console.log("Alpha Vantage Response:", response.data); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching gainers:", error.message); // Debug log
    res.status(500).json({ error: "Failed to fetch top gainers" });
  }
});

router.get("/search/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
    );
    console.log("Search Response:", response.data); // Debug log
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data:", error.message); // Debug log
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

export default router;
