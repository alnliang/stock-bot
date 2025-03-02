import DashboardBox from "@/components/DashboardBox";
import FinancialNews from "@/components/FinancialNews";
//import { useGetProductsQuery } from "@/state/api";
import React from "react";

type Props = {};

const Row2 = (props: Props) => {
  // const { data } = useGetProductsQuery();
  // console.log("data:", data);
  return (
    <>
      <DashboardBox gridArea="e"></DashboardBox>
      <DashboardBox gridArea="f">
        <FinancialNews/>
      </DashboardBox>
      <DashboardBox gridArea="g"></DashboardBox>
      {/* <DashboardBox gridArea="h"></DashboardBox> */}
    </>
  );
};

export default Row2;
