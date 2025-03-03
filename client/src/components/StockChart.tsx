import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TopStocks = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStock, setSearchedStock] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:9000/stocks/top10");
        const data = await response.json();
        setStocks(data);

        if (initialLoad) {
          const appleStock = data.find(
            (stock: { Stock: string }) => stock.Stock === "AAPL"
          );
          if (appleStock) {
            setSearchedStock(appleStock);
            fetchChartData("AAPL");
          }
          setInitialLoad(false);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [initialLoad]);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:9000/stock/${searchQuery}`
      );
      const data = await response.json();
      setSearchedStock(data);
      setShowChart(false);
    } catch (error) {
      console.error("Error searching for stock:", error);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchedStock(null);
    setShowChart(false);
  };

  const fetchChartData = async (ticker: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:9000/stock/${ticker}/chart`
      );
      const data = await response.json();
      if (data.chart) {
        setChartData(data.chart);
        setShowChart(true);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const closeChart = () => {
    setShowChart(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "480px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#2d2d34",
        border: "1px solid #404040",
        borderRadius: "8px",
        padding: "10px",
        overflow: "hidden",
      }}
    >

      {/* Search Input */}
      <Box sx={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a stock (e.g., AAPL, TSLA)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          sx={{
            backgroundColor: "#2d2d34",
            border: "1px solid #404040",
            borderRadius: "8px",
            color: "#ffffff",
            input: { color: "white" },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            backgroundColor: "#2d2d34",
            color: "#8884d8",
            border: "1px solid #404040",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#48494e" },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Main Content - Fixed Size Container */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Chart Area - Now Expands Fully */}
{showChart && (
  <Box
    sx={{
      flex: 1, // Fills available space
      backgroundColor: "#1e1e1e",
      borderRadius: "10px",
      padding: "15px",
      textAlign: "center",
      color: "#fff",
      boxShadow: "0px 4px 6px rgba(255, 255, 255, 0.1)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Chart Title */}
    <Typography
      variant="h5" // Increased size for better visibility
      sx={{
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "8px",
      }}
    >
      {searchedStock?.Stock} (NASDAQ) - 1 Month Data
    </Typography>

    {/* Determine Line Color Based on Price Trend */}
    <Box sx={{ flex: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="time" hide={false} interval={5} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip 
            formatter={(value, name, props) => [`Price: $${value}`, `Date: ${props.payload.time}`]} 
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={
              chartData.length > 1 && chartData[chartData.length - 1].price >= chartData[0].price
                ? "#00ff00" // Green for upward trend
                : "#ff0000" // Red for downward trend
            } 
            dot={{ r: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>

    {/* Close Chart Button */}
    <Button
      variant="contained"
      color="secondary"
      sx={{ marginTop: "10px" }}
      onClick={closeChart}
    >
      Close Chart
    </Button>
  </Box>
)}


        {/* Stock List - Hide when Chart is Visible */}
        {!showChart && (
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #404040",
              borderRadius: "8px",
              padding: "10px",
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            {searchedStock ? (
              <Box
                sx={{
                  backgroundColor: "#1e1e1e",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                  color: "#fff",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(136, 132, 216, 0.1)" },
                }}
                onClick={() => fetchChartData(searchedStock.Stock)}
              >
                <Typography variant="h6">{searchedStock.Stock} (NASDAQ)</Typography>
                <Typography variant="h4">{searchedStock["Latest Price"]}</Typography>
              </Box>
            ) : (
              stocks.map((stock, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "#1e1e1e",
                    borderRadius: "8px",
                    padding: "12px",
                    textAlign: "center",
                    color: "#fff",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(136, 132, 216, 0.1)" },
                  }}
                  onClick={() => {
                    setSearchedStock(stock);
                    fetchChartData(stock.Stock);
                  }}
                >
                  <Typography variant="h6">{stock.Stock} (NASDAQ)</Typography>
                  <Typography variant="h4">{stock["Latest Price"]}</Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopStocks;

