import DashboardBox from "@/components/DashboardBox";
import BoxHeader from "@/components/BoxHeader";
import { Box, Typography } from "@mui/material";
import FinancialNews from "@/components/FinancialNews";
import React from "react";

type Props = {};

const BoxWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      backgroundColor: (theme) => theme.palette.background.light,
      borderRadius: 2,
      p: 0.5,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      transition: "transform 0.3s ease-in-out",
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "scale(1.02)",
      },
    }}
  >
    {children}
  </Box>
);
const PortfolioSection = () => (
  <BoxWrapper>
    <BoxHeader
      title="Portfolio Overview"
      subtitle="Your investment summary"
      sideText="+67%"
      sx={{ textAlign: "left", p: 0 }}
    />
    <Box p={1}>
      <Typography sx={{ textAlign: "left" }}>
        <span style={{ color: "#ffac41" }}>Initial Investment:</span> $10,000
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Current Balance:</span> $16,721
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Current PnL:</span> 67%
      </Typography>
    </Box>
  </BoxWrapper>
);

const RecentTradesSection = () => (
  <BoxWrapper>
    <BoxHeader
      title="Recent Trades"
      subtitle="Latest transactions"
      sideText="Last 24h"
    />
    <Box p={1}>
      <Typography>
        <span style={{ color: "#ffac41" }}>$AAPL</span> - 3 Shares @ 241.32{" "}
        <span style={{ color: "#32cd32" }}>+37%</span>
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>$AMZN</span> - 5 Shares @ 207.53{" "}
        <span style={{ color: "#32cd32" }}>+26%</span>
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>$RDDT</span> - 6 Shares @ 168.34{" "}
        <span style={{ color: "#32cd32" }}>+45%</span>
      </Typography>
    </Box>
  </BoxWrapper>
);

const RiskSection = () => (
  <BoxWrapper>
    <BoxHeader title="Risk & Allocation" subtitle="Portfolio risk metrics" />
    <Box p={1}>
      <Typography>
        <span style={{ color: "#ffac41" }}>Risk Ratio:</span> 2.5 : 1
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Long-term Investments:</span> 36%
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Liquidity:</span> $15,000
      </Typography>
    </Box>
  </BoxWrapper>
);

const UserInfoSection = () => (
  <BoxWrapper>
    <BoxHeader title="User Information" subtitle="Account details" />
    <Box p={1}>
      <Typography>
        <span style={{ color: "#ffac41" }}>Account Number:</span> **** **** ****
        3792
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Current Strategy:</span> Breakout FVG
        exits
      </Typography>
      <Typography>
        <span style={{ color: "#ffac41" }}>Portfolio Risk:</span> 40%
      </Typography>
    </Box>
  </BoxWrapper>
);

const Row2 = (props: Props) => {
  return (
    <>
      <DashboardBox gridArea="e"></DashboardBox>
      <DashboardBox gridArea="f">
        <FinancialNews />
      </DashboardBox>
      <DashboardBox gridArea="g">
        <Box sx={{ p: "0.5rem" }}>
          {" "}
          <BoxHeader
            title="Welcome, Max"
            subtitle="Your trading dashboard"
            sideText={new Date().toLocaleDateString()}
            sx={{ textAlign: "left" }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2, // Reduced gap
              width: "100%",
              height: "calc(100% - 10px)", // Reduced height
              mt: 3, // Reduced margin top
            }}
          >
            <PortfolioSection />
            <RecentTradesSection />
            <RiskSection />
            <UserInfoSection />
          </Box>
        </Box>
      </DashboardBox>
    </>
  );
};

export default Row2;
