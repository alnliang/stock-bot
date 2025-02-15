import { Box, useMediaQuery } from "@mui/material";
import Row1 from "./Row1";
import Row2 from "./Row2";

const gridTemplateLargeScreens = `
  "a b c"
  "a b c"
  "a b c"
  "a b c"
  "a b c"
  "e f g"
  "e f g"
  "e f g"
  "e f g"
  "e f g"
`;
const gridTemplateSmallScreens = `
  "a"
  "a"
  "a"
  "a"
  "b"
  "b"
  "b"
  "b"
  "c"
  "c"
  "c"
  "c"
  "d"
  "d"
  "d"
  "d"
  "e"
  "e"
  "e"
  "e"
  "f"
  "f"
  "f"
  "f"
  "g"
  "g"
  "g"
  "g"
  "h"
  "h"
  "h"
  "h"
`;

interface Props {
  stockData?: ApiResponse;
  searchResults?: TimeSeriesData[] | null;
  handleSearch: (query: string) => void;
  handleBack: () => void;
}

const Dashboard = ({ stockData, searchResults, handleSearch, handleBack }: Props) => {
  const isAboveMediumScreens = useMediaQuery("(min-width: 1200px)");
  return (
    <Box
      width="100%"
      height="100%"
      display="grid"
      gap="1.5rem"
      sx={
        isAboveMediumScreens
          ? {
              gridTemplateColumns: "repeat(3, minmax(370px, 1fr))",
              gridTemplateRows: "repeat(10, minmax(60px, 1fr))",
              gridTemplateAreas: gridTemplateLargeScreens,
            }
          : {
              gridAutoColumns: "1fr",
              gridAutoRows: "80px",
              gridTemplateAreas: gridTemplateSmallScreens,
            }
      }
    >
      <Row1 
        stockData={stockData} 
        searchResults={searchResults}
        handleSearch={handleSearch}
        handleBack={handleBack}
      />
      <Row2 />
    </Box>
  );
};

export default Dashboard;
