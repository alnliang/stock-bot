import { useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { themeSettings } from "./theme";
import Navbar from "@/scenes/navbar";
import Dashboard from "@/scenes/dashboard";
import Account from "@/scenes/accountinfo";
import StockTable from "@/components/StockTable";
import { useGetStockGainersQuery, useGetStockSearchQuery } from "@/state/api";

function App() {
  const theme = createTheme(themeSettings);

  const { data: stockData, isLoading, error } = useGetStockGainersQuery();
  console.log('Gainers API:', { isLoading, error, data: stockData });

  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useGetStockSearchQuery(searchQuery, {
    skip: !searchQuery,
  });
  console.log('Search API:', { searchQuery, results: searchResults });
  const [showSearchResults, setShowSearchResults] = useState(false);

  const transformedResults = showSearchResults && searchResults?.["Time Series (5min)"] 
    ? Object.entries(searchResults["Time Series (5min)"]).map(([time, values]) => ({
        time,
        ...values
      }))
    : null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(true);
  };

  const handleBack = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box width="100%" height="100%" padding="1rem 2rem 4rem 2rem">
            <Navbar />
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    stockData={stockData} 
                    searchResults={transformedResults} 
                    handleSearch={handleSearch} 
                    handleBack={handleBack}
                  />
                } 
              />
              <Route path="/predictions" element={<Account />} />
            </Routes>
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
