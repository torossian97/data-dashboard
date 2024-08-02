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
  marginRight: "20px",
  marginLeft: "20px",
});

const CustomCardContent = styled(CardContent)({
  padding: "10px", // Adjust padding as needed
  "&:last-child": {
    paddingBottom: "0px",
  },
});

const ARRCard = ({ label, value, sublabel }) => {
  return (
    <DataCard>
      <CustomCardContent>
        <Typography variant="subtitle2" color="grey">
          {label}
        </Typography>
        <Typography variant="h5" color="white">
          {value}
        </Typography>
        <Typography variant="subtitle2" color="grey">
          {sublabel}
        </Typography>
      </CustomCardContent>
    </DataCard>
  );
};

export default ARRCard;
