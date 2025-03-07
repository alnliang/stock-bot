import BoxHeader from '@/components/BoxHeader';
import DashboardBox from '@/components/DashboardBox'
import RunModelButton from "@/components/TickerPrediction";
import StockTable from "@/components/StockTable";
import { Box, Typography, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { useGetStockGainersQuery, useGetStockSearchQuery } from "@/state/api";
import { ApiResponse, TimeSeriesData } from "@/state/types";
//import { MOCK_DATA, MOCK_SEARCH_DATA } from "@/data/mockData";

interface Props {
  stockData?: ApiResponse;
  searchResults?: TimeSeriesData[] | null;
  handleSearch: (query: string) => void;
  handleBack: () => void;
}

const Row1 = (props: Props) => {
  const [localSearching, setLocalSearching] = useState(false);
  const [favorites, setFavorites] = useState<StockData[]>(() => {
    const saved = localStorage.getItem("favoriteStocks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favoriteStocks", JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = (query: string) => {
    props.handleSearch(query);
    setLocalSearching(true);
  };

  const handleBack = () => {
    props.handleBack();
    setLocalSearching(false);
  };

  const handleToggleFavorite = (stock: StockData) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.ticker === stock.ticker);
      if (exists) {
        return prev.filter((f) => f.ticker !== stock.ticker);
      } else {
        return [...prev, { ...stock, isFavorite: true }];
      }
    });
  };

  const isSearching = localSearching || Boolean(props.searchResults);

  return (
    <>
      <DashboardBox gridArea="a">
        <BoxHeader
          title="Stock Market Dashboard"
          subtitle="Top gainers and most active stocks"
          sideText={props.stockData?.last_updated || "Loading..."}
        />
        <Box
          width="100%"
          height="100%"
          padding="1rem"
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <StockTable
            title="Stock Market Dashboard"
            data={
              props.stockData?.top_gainers?.map((stock) => ({
                ...stock,
                isFavorite: favorites.some((f) => f.ticker === stock.ticker),
              })) || []
            }
            onSearch={props.handleSearch}
            searchResults={props.searchResults}
            isSearching={isSearching}
            onBack={handleBack}
            onToggleFavorite={handleToggleFavorite}
          />
        </Box>
      </DashboardBox>
      <DashboardBox gridArea="b">
        <BoxHeader
          title="Favorite Stocks"
          subtitle="Your selected stocks"
          sideText={`${favorites.length} stocks`}
        />
        <Box
          width="100%"
          height="100%"
          padding="1rem"
          sx={{
            overflow: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((stock) => (
                <tr key={stock.ticker}>
                  <td>{stock.ticker}</td>
                  <td>{stock.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </DashboardBox>
      <DashboardBox gridArea="c">
        <RunModelButton/>
      </DashboardBox>
    </>
  );
};

export default Row1;
