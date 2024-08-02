import React, { useState, useEffect, lazy, Suspense } from "react";
import "./CommonPage.css";
import Card from "@mui/material/Card";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const CohortCard = styled(Card)({
  marginTop: "20px",
  marginBottom: "20px",
  borderRadius: "8px",
  width: "calc(100% - 40px)",
  backgroundColor: "var(--sidebar-color)",
  color: "#fff",
  marginLeft: "auto",
  marginRight: "auto",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
});

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    padding: "10px",
    minWidth: "350px",
    boxSizing: "border-box",
    backgroundColor: "var(--sidebar-color)",
    overflowX: "hidden",
  },
});

const StyledListItem = styled(ListItem)({
  borderRadius: "10px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "auto",
  marginLeft: "20px",
});

const StyledListSubheader = styled(ListSubheader)({
  fontSize: "1.15rem",
  backgroundColor: "var(--sidebar-color)",
  color: "white",
  paddingLeft: "10px",
});

const StyledList = styled(List)({
  width: "auto",
});

const determineFeatureStyles = (
  isInUsedFeatures,
  isInMissingFeatures,
  percent
) => {
  console.log(percent);
  let backgroundColor, textColor, percentColor, border;
  if (isInMissingFeatures) {
    backgroundColor = "var(--sidebar-item-selected-color)";
    border = "1px solid #42a5f5";
    textColor = "white";
    if (percent <= 10) {
      percentColor = "#7ABD7E";
    } else {
      percentColor = "var(--sidebar-item-hover-color)";
    }
  } else if (isInUsedFeatures) {
    backgroundColor = "var(--sidebar-item-selected-color)";
    percentColor = "var(--sidebar-item-hover-color)";
    border = "none";
    textColor = "white";
  } else {
    backgroundColor = "var(--sidebar-color)";
    border = "none";
    textColor = "grey";
  }
  return { backgroundColor, textColor, percentColor, border };
};

const flattenFeatures = (obj, prefix = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenFeatures(obj[key], fullPath));
    } else {
      acc[fullPath] = obj[key];
    }
    return acc;
  }, {});
};

const generateMissingFeatures = (usedFeatures, releaseConfig, omitList) => {
  const missingFeatures = {};

  const checkFeatures = (used, config, omit, path = "") => {
    Object.keys(config).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;

      if (
        typeof config[key] === "object" &&
        !Array.isArray(config[key]) &&
        config[key] !== null
      ) {
        if (used && used.hasOwnProperty(key)) {
          checkFeatures(
            used[key],
            config[key],
            omit ? omit[key] : undefined,
            fullPath
          );
        }
      } else {
        if (
          config[key] === false &&
          used &&
          used.hasOwnProperty(key) &&
          !(omit && omit[key] === true)
        ) {
          missingFeatures[fullPath] = used[key];
        }
      }
    });
  };

  checkFeatures(usedFeatures, releaseConfig, omitList);
  return missingFeatures;
};

const determineCohorts = (
  companies,
  releases,
  optionalFeatures,
  omitFeatures
) => {
  const data = releases.reduce((acc, _, index) => {
    acc[index + 1] = [];
    return acc;
  }, {});

  Object.entries(companies).forEach(([companyName, companyDetails]) => {
    const { used_features } = companyDetails;

    for (let i = 0; i < releases.length; i++) {
      if (
        canMigrate(
          used_features,
          releases[i].config,
          optionalFeatures,
          omitFeatures
        )
      ) {
        data[i + 1].push({
          name: companyName,
          details: companyDetails,
        });
        break;
      }
    }
  });

  return data;
};

const canMigrate = (
  usedFeatures,
  releaseConfig,
  optionalFeatures = {},
  omitFeatures = {}
) => {
  return Object.entries(usedFeatures).every(([key, value]) => {
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      releaseConfig[key]
    ) {
      return canMigrate(
        value,
        releaseConfig[key],
        optionalFeatures[key] || {},
        omitFeatures[key] || {}
      );
    }
    return releaseConfig[key] || optionalFeatures[key] || omitFeatures[key];
  });
};

function ReleasePage() {
  const [cohorts, setCohorts] = useState({});
  const [niceToHavesEnabled, setNiceToHavesEnabled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [releasesData, setReleasesData] = useState(null);
  const [niceToHaveData, setNiceToHaveData] = useState(null);
  const [omitData, setOmitData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const customerData = await import("../data/enhanced-customer-mappings.json");
      const release1 = await import("../data/releases/release1.json");
      const release2 = await import("../data/releases/release2.json");
      const release3 = await import("../data/releases/release3.json");
      const release4 = await import("../data/releases/release4.json");
      const release5 = await import("../data/releases/release5.json");
      const releaseGA = await import("../data/releases/releaseGA.json");
      const niceToHave = await import("../data/releases/nice-to-have.json");
      const omit = await import("../data/releases/omit.json");

      setCustomerData(customerData.default);
      setReleasesData([release1.default, release2.default, release3.default, release4.default, release5.default, releaseGA.default]);
      setNiceToHaveData(niceToHave.default);
      setOmitData(omit.default);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (customerData && releasesData && omitData) {
      updateCohorts();
    }
  }, [niceToHavesEnabled, customerData, releasesData, omitData]);

  const updateCohorts = () => {
    const data = determineCohorts(
      customerData,
      releasesData,
      niceToHavesEnabled ? niceToHaveData.config : {},
      omitData.config
    );
    setCohorts(groupCompaniesByCohort(data));
  };

  const toggleNiceToHaves = () => {
    setNiceToHavesEnabled(!niceToHavesEnabled);
  };

  const groupCompaniesByCohort = (cohortData) => {
    const grouped = {};

    Object.entries(cohortData).forEach(([cohort, companies]) => {
      grouped[cohort] = companies.map((company) => company.name);
    });

    Object.keys(customerData).forEach((companyName) => {
      const isInAnyCohort = Object.values(cohortData).some((companies) =>
        companies.some((company) => company.name === companyName)
      );

      if (!isInAnyCohort) {
        if (!grouped.GA) {
          grouped.GA = [];
        }
        grouped.GA.push(companyName);
      }
    });

    return grouped;
  };

  const toggleDrawer =
    (open, companyDetails = null) =>
    () => {
      setDrawerOpen(open);
      setSelectedCompany(companyDetails);
    };

  const groupConfigByParent = (listItems) => {
    const grouped = listItems.reduce((acc, item) => {
      const parts = item.name.split(".");
      const parent = parts.length > 1 ? parts[0] : "Other";

      if (!acc[parent]) {
        acc[parent] = [];
      }
      acc[parent].push(item);
      return acc;
    }, {});

    return grouped;
  };

  const renderFeatureList = () => {
    if (!selectedCompany) return null;

    const releaseConfig = releasesData[selectedCompany.cohort - 1];
    const flatUsedFeatures = flattenFeatures(
      selectedCompany.used_features || {}
    );
    const flatMissingFeatures = generateMissingFeatures(
      selectedCompany.used_features,
      releaseConfig.config,
      omitData.config
    );

    const listItems = [];
    const traverseConfig = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === "boolean") {
          const isInUsedFeatures = fullPath in flatUsedFeatures;
          const isMissingInRelease = fullPath in flatMissingFeatures;
          const percent = isInUsedFeatures
            ? (flatUsedFeatures[fullPath] / selectedCompany.volume) * 100
            : 0;
          const { backgroundColor, textColor, percentColor, border } =
            determineFeatureStyles(
              isInUsedFeatures,
              isMissingInRelease,
              percent.toFixed(2)
            );

          listItems.push({
            name: fullPath,
            isInUsedFeatures,
            isMissingInRelease,
            backgroundColor,
            textColor,
            percentColor,
            border,
            itemName: key,
            percent,
          });
        } else if (typeof value === "object" && !Array.isArray(value)) {
          traverseConfig(value, fullPath);
        }
      });
    };

    traverseConfig(releaseConfig.config);

    const groupedItems = groupConfigByParent(listItems);

    return Object.entries(groupedItems).map(
      ([section, items], sectionIndex) => (
        <li key={sectionIndex}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <StyledListSubheader>
              {section !== "Other" ? section : "Other"}
            </StyledListSubheader>
            {items.map((item, index) => (
              <StyledListItem
                key={index}
                style={{
                  backgroundColor: item.backgroundColor,
                  border: item.border,
                }}
              >
                <ListItemText
                  primary={item.itemName}
                  primaryTypographyProps={{
                    style: { color: item.textColor, fontSize: "0.875rem" },
                  }}
                />
                {item.isInUsedFeatures && (
                  <div style={{ marginLeft: "10px" }}>
                    <span
                      style={{
                        color: item.textColor,
                        backgroundColor: item.percentColor,
                        borderRadius: "15px",
                        padding: "5px 10px 5px 10px",
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.percent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </StyledListItem>
            ))}
          </ul>
        </li>
      )
    );
  };

  const downloadCSV = (cohort) => {
    const companies = cohorts[cohort];
    const csvRows = [
      [
        "Company Name",
        ...Array.from(
          new Set(
            companies.flatMap((company) =>
              Object.keys(
                generateMissingFeatures(
                  customerData[company].used_features,
                  releasesData[cohort - 1].config,
                  omitData.config
                )
              )
            )
          )
        ),
      ],
    ];

    companies.forEach((companyName) => {
      const companyDetails = customerData[companyName];
      const missingFeatures = generateMissingFeatures(
        companyDetails.used_features,
        releasesData[cohort - 1].config,
        omitData.config
      );
      const row = [companyName, ...Object.values(missingFeatures)];
      csvRows.push(row);
    });

    const csvString = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cohort-${cohort}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="commonPage">
      <h2>Customer Cohorts</h2>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch checked={niceToHavesEnabled} onChange={toggleNiceToHaves} />
          }
          label="Nice-to-Have Feature Omission"
        />
      </FormGroup>
      {Object.entries(cohorts).map(([cohort, companies], index) => (
        <CohortCard key={index}>
          <Typography
            variant="h5"
            component="h3"
            style={{
              padding: "10px 15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Release: {cohort === "1" ? "beta" : cohort === "6" ? "GA" : cohort}
            <IconButton
              onClick={() => downloadCSV(cohort)}
              color="primary"
              aria-label="download csv"
            >
              <DownloadIcon />
            </IconButton>
          </Typography>
          <List>
            {companies.length > 0 ? (
              companies.map((companyName) => {
                const companyDetails = customerData[companyName];
                return (
                  <ListItem
                    button
                    key={companyName}
                    onClick={() => {
                      console.log("List item clicked", companyName);
                      toggleDrawer(true, {
                        ...companyDetails,
                        cohort,
                      })();
                    }}
                  >
                    <ListItemText primary={companyName} />
                  </ListItem>
                );
              })
            ) : (
              <ListItem>
                <ListItemText
                  primary="No companies in this cohort"
                  style={{ color: "grey" }}
                />
              </ListItem>
            )}
          </List>
        </CohortCard>
      ))}
      <StyledDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <IconButton
          onClick={toggleDrawer(false)}
          style={{ marginLeft: "auto" }}
        >
          <CloseIcon />
        </IconButton>
        <List>{selectedCompany && renderFeatureList()}</List>
      </StyledDrawer>
    </div>
  );
}

export default ReleasePage;
