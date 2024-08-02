import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const DataCard = styled(Card)({
  backgroundColor: "#262626",
  maxWidth: 300,
  boxShadow: "none",
  padding: "0px",
  marginRight: "20px",
  marginLeft: "20px",
});

const CustomCardContent = styled(CardContent)({
  padding: "10px", // Adjust padding as needed
  "&:last-child": {
    paddingBottom: "0px",
  },
});

const formatARR = (arr) => {
  const thousands = arr / 1000;
  return `$${thousands.toFixed(1)}k`;
};

const getIntensityColor = (arr) => {
  const percentage = arr / (3000000 / 16);
  return `hsl(120, ${Math.min(100, percentage * 100)}%, 50%)`;
};

const ARRCard = ({ arr }) => {
  return (
    <DataCard>
      <CustomCardContent>
        <Typography variant="subtitle2" color="grey">
          TOTAL ARR
        </Typography>
        <Typography variant="h5" color="white">
          {formatARR(arr)}
        </Typography>
        <FiberManualRecordIcon
          sx={{ color: getIntensityColor(arr), fontSize: 20 }} // Adjust fontSize to match subtitle2 size
          style={{ verticalAlign: "middle", marginRight: "4px" }}
        />
      </CustomCardContent>
    </DataCard>
  );
};

export default ARRCard;
