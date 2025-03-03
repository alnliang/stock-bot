import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import FinancialNews from "@/components/FinancialNews";
import StockChart from "@/components/StockChart";
//import { useGetProductsQuery } from "@/state/api";
import React from "react";

type Props = {};

const Row2 = (props: Props) => {
  // const { data } = useGetProductsQuery();
  // console.log("data:", data);
  return (
    <>
      <DashboardBox gridArea="e">
  <BoxHeader
    title="Stock Graph"
    subtitle="Visualizing Market Performance for Stocks"
    sideText="" // Optional: Add dynamic text like last updated time
  />
  <StockChart />
</DashboardBox>
      <DashboardBox gridArea="f">
        <FinancialNews/>
      </DashboardBox>
      <DashboardBox gridArea="g"></DashboardBox>
      {/* <DashboardBox gridArea="h"></DashboardBox> */}
    </>
  );
};

export default Row2;
