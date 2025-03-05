import React, { useState } from "react";

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
    <div>
      <input
        type="text"
        placeholder="Enter stock ticker"
        value={ticker}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTicker(e.target.value.toUpperCase())
        }
      />
      <button onClick={handleClick}>Calculate Metric</button>
      {output && output.result !== undefined && (
        <div>
          <p>Calculated Result: {output.result}</p>
        </div>
      )}
      {output && output.error && <p>Error: {output.error}</p>}
    </div>
  );
};

export default CalculateMetricButton;
