import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  reducerPath: "main",
  tagTypes: ["Kpis", "Pairs", "NewApi"],
  endpoints: (build) => ({
    getKpis: build.query<void, void>({
      query: () => "kpi/kpis/",
      providesTags: ["Kpis"],
    }),
    getPairs: build.query<void, void>({
      query: () => "pairs/pairs/",
      providesTags: ["Pairs"],
    }),
    getNewApiData: build.query<void, void>({
      query: () => "newapi/newapi/",
      providesTags: ["NewApi"],
      pollingInterval: 15000,
    }),
  }),
});

export const { useGetKpisQuery, useGetPairsQuery, useGetNewApiDataQuery } = api;
