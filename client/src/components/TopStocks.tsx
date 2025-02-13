import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const TopStocks = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Stores user input
  const [searchedStock, setSearchedStock] = useState<any | null>(null); // Stores search result
  const [chartData, setChartData] = useState<any[]>([]); // Stores chart data
  const [showChart, setShowChart] = useState(false); // Track whether the chart is visible

  useEffect(() => {
    if (searchedStock) return; // Don't fetch top 10 if searching

    const fetchStockData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/stocks/top10");
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, [searchedStock]);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/stock/${searchQuery}`);
      const data = await response.json();
      setSearchedStock(data);
      setShowChart(false); // Reset chart view when new search is made
    } catch (error) {
      console.error("Error searching for stock:", error);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");  // Reset input field
    setSearchedStock(null);  // Show top 10 stocks again
    setShowChart(false);  // Hide chart if it's open
  };

  const fetchChartData = async (ticker: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/stock/${ticker}/chart`);
      const data = await response.json();
      if (data.chart) {
        setChartData(data.chart);
        setShowChart(true); // Show the chart
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const closeChart = () => {
    setShowChart(false); // Hide the chart and show stock info
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "400px",
        overflowY: "auto",
        backgroundColor: "#111",
        borderRadius: "12px",
        padding: "10px",
      }}
    >
      <Typography variant="h5" sx={{ color: "white", textAlign: "center", marginBottom: "10px" }}>
        Stocks
      </Typography>

      {/* Search Input */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a stock (e.g., AAPL, TSLA)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          sx={{ backgroundColor: "white", borderRadius: "5px" }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        {searchedStock && (
          <Button variant="outlined" onClick={clearSearch} color="secondary">
            Clear
          </Button>
        )}
      </Box>

      {/* Show Chart */}
      {showChart && (
        <Box
          sx={{
            backgroundColor: "#1e1e1e",
            borderRadius: "10px",
            padding: "15px",
            textAlign: "center",
            color: "#fff",
            boxShadow: "0px 4px 6px rgba(255, 255, 255, 0.1)",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h6">{searchedStock?.Stock} (NASDAQ) - 1 Month Data</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide={false} interval={5} />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip formatter={(value, name, props) => [`Price: $${value}`, `Date: ${props.payload.time}`]} />
              <Line type="monotone" dataKey="price" stroke="#00d8ff" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
          <Button variant="contained" color="secondary" sx={{ marginTop: "10px" }} onClick={closeChart}>
            Close Chart
          </Button>
        </Box>
      )}

      {/* Display Stock Info */}
      {!showChart &&
        (searchedStock ? (
          <Box
            sx={{
              backgroundColor: "#1e1e1e",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
              color: "#fff",
              boxShadow: "0px 4px 6px rgba(255, 255, 255, 0.1)",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={() => fetchChartData(searchedStock.Stock)}
          >
            <Typography variant="h6">{searchedStock.Stock} (NASDAQ)</Typography>
            <Typography variant="h4">{searchedStock["Latest Price"]}</Typography>
            <Typography variant="body1" sx={{ color: searchedStock.Change.includes("-") ? "red" : "green" }}>
              {searchedStock.Change}
            </Typography>
            <Typography variant="body2" sx={{ color: "#ddd" }}>
              Prev Close: {searchedStock["Previous Close"]}
            </Typography>
          </Box>
        ) : (
          stocks.map((stock, index) => (
            <Box
              key={index}
              sx={{
                backgroundColor: "#1e1e1e",
                borderRadius: "10px",
                padding: "15px",
                textAlign: "center",
                color: "#fff",
                boxShadow: "0px 4px 6px rgba(255, 255, 255, 0.1)",
                marginBottom: "10px",
                cursor: "pointer",
              }}
              onClick={() => fetchChartData(stock.Stock)}
            >
              <Typography variant="h6">{stock.Stock} (NASDAQ)</Typography>
              <Typography variant="h4">{stock["Latest Price"]}</Typography>
              <Typography variant="body1" sx={{ color: stock.Change.includes("-") ? "red" : "green" }}>
                {stock.Change}
              </Typography>
              <Typography variant="body2" sx={{ color: "#ddd" }}>Prev Close: {stock["Previous Close"]}</Typography>
            </Box>
          ))
        ))}
    </Box>
  );
};

export default TopStocks;
