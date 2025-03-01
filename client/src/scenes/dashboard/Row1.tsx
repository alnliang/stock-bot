import BoxHeader from "@/components/BoxHeader";
import DashboardBox from "@/components/DashboardBox";
import StockTable from "@/components/StockTable";
import { Box, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useGetStockGainersQuery, useGetStockSearchQuery} from "@/state/api";
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

  const handleSearch = (query: string) => {
    props.handleSearch(query);
    setLocalSearching(true);
  };

  const handleBack = () => {
    props.handleBack();
    setLocalSearching(false);
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
            data={props.stockData?.top_gainers || []}
            onSearch={props.handleSearch}
            searchResults={props.searchResults}
            isSearching={isSearching}
            onBack={handleBack}
          />
        </Box>
      </DashboardBox>
      <DashboardBox gridArea="b"></DashboardBox>
      <DashboardBox gridArea="c"></DashboardBox>
      {/* <DashboardBox gridArea="d"></DashboardBox> */}
    </>
  );
};

export default Row1;
