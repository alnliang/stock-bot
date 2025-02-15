export interface StockData {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export interface TimeSeriesData {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. volume": string;
  time: string;
}

export interface ApiResponse {
  metadata: string;
  last_updated: string;
  top_gainers: StockData[];
}

export interface TimeSeriesResponse {
  "Time Series (5min)": {
    [key: string]: TimeSeriesData;
  };
} 