import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_KEY = 'V9QUVNOXRTJ0K5EM'; // Use environment variables

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  reducerPath: "main",
  tagTypes: ["Kpis", "Pairs", "NewApi", "Stocks"],
  endpoints: (build) => ({
    // Existing API Calls
    getKpis: build.query<void, void>({
      query: () => "kpi/kpis/",
      providesTags: ["Kpis"],
    }),
    getPairs: build.query<void, void>({
      query: () => "pairs/pairs/",
      providesTags: ["Pairs"],
    }),
    // New: Fetch Stock Gainers (Top Movers)
    getStockGainers: build.query<ApiResponse, void>({
      query: () =>
        `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`,
      providesTags: ["Stocks"],
    }),

    // New: Fetch Stock Data for a Specific Symbol
    getStockSearch: build.query<TimeSeriesResponse, string>({
      query: (symbol) =>
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`,
      providesTags: ["Stocks"],
    }),
  }),
});

export const {
  useGetKpisQuery,
  useGetPairsQuery,
  useGetStockGainersQuery,
  useGetStockSearchQuery,
} = api;
