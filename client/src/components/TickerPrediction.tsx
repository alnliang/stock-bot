import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface CalculationOutput {
  result?: number;
  error?: string;
}

const CalculateMetricButton: React.FC = () => {
  const [ticker, setTicker] = useState<string>("");
  const [output, setOutput] = useState<CalculationOutput | null>(null);

  const handleClick = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/calculate?ticker=${ticker}`);
      const data: CalculationOutput = await response.json();
      setOutput(data);
    } catch (error) {
      console.error("Error calculating metric:", error);
      setOutput({ error: "Failed to calculate metric." });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#2d2d34",
        border: "1px solid #404040",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
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
        <Box sx={{ mt: 1 }}>
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
              Calculated Result: ${output.result.toFixed(2)}
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
        </Box>
      )}
    </Box>
  );
};

export default CalculateMetricButton;