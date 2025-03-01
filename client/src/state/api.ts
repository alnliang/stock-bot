import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, TimeSeriesResponse } from "./types";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:9000",
    credentials: "include",
  }),
  reducerPath: "main",
  tagTypes: ["Stocks"],
  endpoints: (build) => ({
    getStockGainers: build.query<ApiResponse, void>({
      query: () => "trending/gainers",
    }),
    getStockSearch: build.query<TimeSeriesResponse, string>({
      query: (symbol) => `trending/search/${symbol}`,
    }),
  }),
});

export const { useGetStockGainersQuery, useGetStockSearchQuery } = api;
