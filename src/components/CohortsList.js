import React, { useEffect, useState } from "react";
import {
  Checkbox,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import companyData from "../data/enhanced-customer-mappings.json"; // Adjust the import path as necessary
import ARRCard from "./cards/ARRCard";
import StandardCard from "./cards/StandardCard";

const CohortCard = styled(Card)({
  marginTop: "50px",
  marginBottom: "16px",
  borderRadius: "10px",
  width: "80%",
  backgroundColor: "var(--sidebar-color)",
  color: "rgb(205, 205, 205)",
  marginLeft: "auto",
  marginRight: "auto",
});

const serializeMissingFeatures = (missingFeatures) => {
  // Sort keys to ensure consistent ordering
  const sortedKeys = Object.keys(missingFeatures).sort();
  return sortedKeys
    .map((key) => {
      if (typeof missingFeatures[key] === "object") {
        // Recursively serialize nested objects
        return `${key}:{${serializeMissingFeatures(missingFeatures[key])}}`;
      } else {
        // For simplicity, ignore the tally numbers by not including them in the key
        return key;
      }
    })
    .join(",");
};

const groupCompaniesIntoCohorts = (data) => {
  const cohorts = Object.entries(data).reduce((acc, [companyName, company]) => {
    const { missing_features, total_missing_features, ARR, priority } = company;
    // Serialize the structure of missing features to create a unique key for grouping
    const featuresKey = serializeMissingFeatures(missing_features);
    const key = `${total_missing_features}:${featuresKey}`;

    if (!acc[key]) {
      acc[key] = {
        companies: [],
        totalARR: 0,
        totalMissingFeatures: total_missing_features,
        priorityTwoOrLessCount: 0,
        missing_features,
      };
    }

    acc[key].companies.push({ name: companyName, ARR, priority });
    acc[key].totalARR += ARR;
    if (priority <= 2) acc[key].priorityTwoOrLessCount += 1;

    return acc;
  }, {});

  // Sort cohorts by the number of missing features, then alphabetically by the serialized missing features key
  return Object.values(cohorts).sort((a, b) => {
    return (
      a.totalMissingFeatures - b.totalMissingFeatures // ||
      //a.key.localeCompare(b.key)
    );
  });
};

const CohortsList = ({ onItemClick }) => {
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => {
    setCohorts(groupCompaniesIntoCohorts(companyData));
  }, [companyData]);

  return (
    <>
      {cohorts.map((cohort, index) => (
        <CohortCard
          key={index}
          onClick={() => onItemClick(cohort, "Cohort " + (index + 1))}
        >
          <CardContent>
            <div
              style={{
                display: "flex",
                marginBottom: "20px",
                width: "100%",
                alignItems: "center",
              }}
            >
              {/*<Checkbox style={{ color: "#b45bfe", flex: "1 1 auto" }} />*/}
              <Typography variant="h5" color="white">
                Cohort {index + 1}
              </Typography>
              <div
                style={{
                  display: "flex",
                  flex: "2 1 auto",
                  justifyContent: "flex-end",
                }}
                flex={2}
              >
                <StandardCard
                  label="CUSTOMERS"
                  value={cohort.companies.length + " / " + cohorts.length}
                  sublabel={
                    ((cohort.companies.length / cohorts.length) * 100).toFixed(
                      0
                    ) + "%"
                  }
                />
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ margin: 0, height: "auto", borderColor: "grey" }}
                />
                <StandardCard
                  label="BLOCKED FEATURES"
                  value={cohort.totalMissingFeatures}
                />
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ margin: 0, height: "auto", borderColor: "grey" }}
                />
                <ARRCard arr={cohort.totalARR} />
                <Divider
                  orientation="vertical"
                  flexItem
                  style={{ margin: 0, height: "auto", borderColor: "grey" }}
                />
                <StandardCard
                  label="HIGH PRIORITY"
                  value={cohort.priorityTwoOrLessCount}
                  sublabel={"priority <= 2"}
                />
              </div>
            </div>
            <TableContainer
              component={styled("div")({ backgroundColor: "#262626" })}
            >
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Company Name
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="right"
                    >
                      ARR
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="right"
                    >
                      Priority
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cohort.companies.map((company, idx) => (
                    <TableRow
                      key={idx}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ color: "white" }}
                      >
                        {company.name}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "white" }}>
                        {company.ARR.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        {company.priority}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </CohortCard>
      ))}
    </>
  );
};

export default CohortsList;
