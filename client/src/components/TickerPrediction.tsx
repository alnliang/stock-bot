import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CalculationOutput {
  result?: number;
  error?: string;
}

interface StockChartData {
  time: string;
  price: number;
}

const CalculateMetricButton: React.FC = () => {
  const [ticker, setTicker] = useState<string>("");
  const [output, setOutput] = useState<CalculationOutput | null>(null);
  const [chartData, setChartData] = useState<StockChartData[]>([]); // State for storing stock chart data

  const handleClick = async () => {
    try {
      // Fetch predicted stock price
      const response = await fetch(`http://127.0.0.1:5000/calculate?ticker=${ticker}`);
      const data: CalculationOutput = await response.json();
      setOutput(data);

      // Fetch historical stock data (graph)
      const chartResponse = await fetch(`http://127.0.0.1:9000/stock/${ticker}/chart`);
      const chartJson = await chartResponse.json();
      setChartData(chartJson.chart || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setOutput({ error: "Failed to fetch data." });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%", // Ensure full height
        backgroundColor: "#2d2d34",
        border: "1px solid #404040",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        flexGrow: 1, // Allow it to expand fully
      }}
    >
      <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter stock ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          sx={{
            backgroundColor: "#2d2d34",
            border: "1px solid #404040",
            borderRadius: "8px",
            "& .MuiInputBase-input": {
              color: "#ffffff",
              fontSize: "14px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleClick}
          sx={{
            backgroundColor: "#2d2d34",
            color: "#8884d8",
            border: "1px solid #404040",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#48494e",
            },
            textTransform: "none",
            fontWeight: "normal",
          }}
        >
          Calculate Metric
        </Button>
      </Box>

      {output && (
        <Box sx={{ mt: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {output.result !== undefined && (
            <Typography
              sx={{
                color: "#00ff00",
                fontSize: "16px",
                backgroundColor: "rgba(0, 255, 0, 0.1)",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              Predicted Closing Price: ${output.result.toFixed(2)}
            </Typography>
          )}
          {output.error && (
            <Typography
              sx={{
                color: "#ff0000",
                fontSize: "16px",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              Error: {output.error}
            </Typography>
          )}

          {/* Full-Sized Line Chart for Stock History */}
          {chartData.length > 0 && (
            <Box sx={{ mt: 2, flexGrow: 1, height: "100%", display: "flex" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" tick={{ fill: "#ffffff", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CalculateMetricButton;
