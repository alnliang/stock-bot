import BoxHeader from '@/components/BoxHeader';
import DashboardBox from '@/components/DashboardBox'
import TopStocks from "@/components/TopStocks";
import { useGetKpisQuery, useGetPairsQuery } from '@/state/api'
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

type Props = {};

const Row1 = (props: Props) => {
    const { data: pairsData } = useGetPairsQuery();
    console.log(pairsData);
    const { palette } = useTheme();

    const columns = [
      { field: 'symbol', headerName: 'Token', flex: 0.6 },
      {
        field: 'marketCap',
        headerName: 'MC',
        flex: 0.6,
        //valueFormatter: (params: any) => formatValue(params.value),
      },
      {
        field: 'liquidity',
        headerName: 'Liq',
        flex: 0.6,
        //valueFormatter: (params: any) => formatValue(params.value),
      },
      { field: 'created_at', headerName: 'Age', flex: 0.4 },
      { field: 'is_boosted', headerName: 'Boosted', flex: 0.4 },
    ];

    // const formatValue = (value: number | undefined | null): string => {
    //   if (value == null) return '$0.00';
    //   if (value >= 1e6) {
    //     return `${(value / 1e6).toFixed(1)}M`; // Convert to millions with one decimal place
    //   } else if (value >= 1e3) {
    //     return `${(value / 1e3).toFixed(1)}K`; // Convert to thousands with one decimal place
    //   } else {
    //     return value.toFixed(2); // For values below 1000, show two decimal places
    //   }
    // };


    const rows = (pairsData || []).map((pair: any, index: number) => ({
      id: index, // Unique ID for each row
      symbol: pair.details.symbol || 'N/A',
      marketCap: pair.details.marketCap || 0, // Use raw numeric value
      liquidity: pair.details.liquidity || 0, // Use raw numeric value
      created_at: pair.details.created_at || 'N/A',
      is_boosted: pair.details.is_boosted || 'No',
    }));

    return (
      <>
      <DashboardBox gridArea="a">
        {/* <BoxHeader title="Live Token Feed" sideText={`${rows.length} pairs`} />
        <Box
          mt="0.5rem"
          p="0 0.5rem"
          height="400px"
          sx={{
            "& .MuiDataGrid-root": {
              color: '#0f0',
              border: "1px solid #0f0",
              fontSize: "0.85rem",
              backgroundColor: '#000',
              textAlign: "center", // Align text to center
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              whiteSpace: "nowrap",
              textAlign: "center", // Center cell text
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: `1px solid #0f0`,
              backgroundColor: '#111',
              padding: "0.2rem 0.5rem",
              fontSize: "0.85rem",
              textAlign: "center", // Center header text
            },
            "& .MuiDataGrid-footerContainer": {
              display: "none",
            },
            "& .MuiDataGrid-row": {
              minHeight: "25px !important",
              maxHeight: "25px !important",
              "&:hover": {
                backgroundColor: '#006400',
              },
            },
            "& .MuiDataGrid-virtualScroller": {
              overflow: "hidden",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              "msOverflowStyle": "none",
              "scrollbarWidth": "none",
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            hideFooter={true}
            rowHeight={25}
            headerHeight={30}
            disableColumnMenu={true}
            disableRowSelectionOnClick={true}
            autoHeight={false}
            style={{ height: '100%' }}
            showCellVerticalBorder={false}
            showColumnVerticalBorder={false}
          />
        </Box> */}
        </DashboardBox>
        <DashboardBox gridArea="b">
          <TopStocks />
        </DashboardBox>
        <DashboardBox gridArea="c"></DashboardBox>
        {/* <DashboardBox gridArea="d"></DashboardBox> */}
        </>
    );
};

export default Row1;