// import { useState, useEffect } from 'react';
// import StockTable from './components/StockTable';
// import { ApiResponse, TimeSeriesData } from './state/StockTypes';
// import './App.css';

// const USE_MOCK_DATA = true;

// function App2() {
//   const [stockData, setStockData] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchResults, setSearchResults] = useState<TimeSeriesData[] | null>(null);
//   const [isSearching, setIsSearching] = useState(false);

//   useEffect(() => {
//     const fetchStockData = async () => {
//       try {
//         console.log("Starting API call...");
        
//         if (USE_MOCK_DATA) {
//           console.log("Using mock data");
//           setStockData(MOCK_DATA);
//           setLoading(false);
//           return;
//         }

//         const response = await fetch(
//           'https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=V9QUVNOXRTJ0K5EM'
//         );
//         const data = await response.json();
//         console.log("Raw API Response:", JSON.stringify(data, null, 2));
//         console.log("Top Gainers:", data.top_gainers);

//         if (!data.top_gainers || !Array.isArray(data.top_gainers)) {
//           throw new Error("Invalid API response structure");
//         }

//         setStockData(data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error details:", err);
//         setError('Failed to fetch stock data');
//         setLoading(false);
//       }
//     };

//     fetchStockData();
//   }, []);

//   const handleSearch = async (query: string) => {
//     try {
//       console.log("Starting search API call for symbol:", query);

//       if (USE_MOCK_DATA) {
//         console.log("Using mock search data");
//         const timeSeriesEntries = Object.entries(MOCK_SEARCH_DATA["Time Series (5min)"]);
//         const latestDataPoints = timeSeriesEntries.slice(0, 6).map(([time, data]) => ({
//           ...data,
//           time: time // Add time to each data point
//         }));
//         setSearchResults(latestDataPoints);
//         setIsSearching(true);
//         return;
//       }

//       const response = await fetch(
//         `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${query}&interval=5min&apikey=V9QUVNOXRTJ0K5EM`
//       );
//       const data = await response.json();
//       console.log("Raw Search Response:", JSON.stringify(data, null, 2));

//       if (data["Time Series (5min)"]) {
//         const timeSeriesEntries = Object.entries(data["Time Series (5min)"]);
//         const latestDataPoints = timeSeriesEntries.slice(0, 6).map(([time, data]) => {
//           console.log(`Processing data for time: ${time}`, data);
//           return data as TimeSeriesData;
//         });
//         console.log("Formatted Data Points:", latestDataPoints);
//         setSearchResults(latestDataPoints);
//         setIsSearching(true);
//       } else {
//         console.log("No time series data found in response");
//         setError('No data found for this symbol');
//       }
//     } catch (err) {
//       console.error("Search Error details:", err);
//       setError('Failed to fetch search results');
//     }
//   };

//   const handleBack = () => {
//     setIsSearching(false);
//     setSearchResults(null);
//     setError(null);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!stockData) return <div>No data available</div>;

//   return (
//     <div className="container">
//       <h1>Stock Market Dashboard</h1>
//       <p className="last-updated">Last Updated: {stockData.last_updated}</p>

//       <StockTable
//         title="Top Gainers"
//         data={stockData.top_gainers}
//         onSearch={handleSearch}
//         searchResults={searchResults}
//         isSearching={isSearching}
//         onBack={handleBack}
//       />
//     </div>
//   );
// }

// export default App2;
