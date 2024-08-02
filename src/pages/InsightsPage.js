import React, { useState, useEffect } from "react";
import "./CommonPage.css";
import ListComponent from "../components/ListComponent";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/joy/Chip";
import { styled } from "@mui/system";
import completedV3Config from "../data/completedV3.json"; // Make sure this path is correct

// Data processing
import CustomerData from "../data/enhanced-customer-mappings.json";

const getBackgroundAndTextColor = (
  isInUsedFeatures,
  isInMissingFeatures,
  percent
) => {
  let backgroundColor, textColor, percentColor, border;
  if (isInMissingFeatures) {
    backgroundColor = "var(--sidebar-item-selected-color)";
    border = "1px solid #FF6961";
    textColor = "white";
    if (percent <= 1) {
      percentColor = "#7ABD7E";
      // } else if (percent > 1) {
      //   percentColor = "#FFB54C";
    } else {
      percentColor = "var(--sidebar-item-hover-color)";
    }
  } else if (isInUsedFeatures) {
    // Original style for items in used_features
    backgroundColor = "var(--sidebar-item-selected-color)";
    percentColor = "var(--sidebar-item-hover-color)";
    border = "none";
    textColor = "white";
  } else {
    // Grey out for items not in used_features
    backgroundColor = "var(--sidebar-color)"; // Grey
    border = "none";
    textColor = "grey";
  }
  return { backgroundColor, textColor, percentColor, border };
};

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    padding: "10px",
    minWidth: "350px",
    boxSizing: "border-box",
    backgroundColor: "var(--sidebar-color)",
    overflowX: "hidden",
  },
});

const StyledList = styled(List)({
  width: "auto",
});

const StyledListSubheader = styled(ListSubheader)({
  fontSize: "1.15rem", // Adjust the font size as needed
  backgroundColor: "var(--sidebar-color)", // Change the background color as desired
  color: "white", // Optional: change the text color if needed
  paddingLeft: "10px", // Optional: adjust padding for better spacing
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

function InsightsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState({});
  const [companyName, setCompanyName] = useState("");

  const toggleDrawer =
    (open, details, name = "") =>
    () => {
      setDrawerContent(details);
      setCompanyName(name);
      setDrawerOpen(open);
    };

  const groupConfigByParent = (listItems) => {
    const grouped = listItems.reduce((acc, item) => {
      const parts = item.name.split(".");
      const parent = parts.length > 1 ? parts[0] : "Other";
      if (!acc[parent]) acc[parent] = [];
      acc[parent].push(item);
      return acc;
    }, {});
    return grouped;
  };

  const flattenUsedFeatures = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(acc, flattenUsedFeatures(obj[key], fullPath));
      } else {
        acc[fullPath] = obj[key];
      }
      return acc;
    }, {});
  };

  const flattenMissingFeatures = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(acc, flattenMissingFeatures(obj[key], fullPath));
      } else {
        acc[fullPath] = obj[key];
      }
      return acc;
    }, {});
  };

  const generateConfigListItems = (
    config,
    usedFeatures = {},
    missingFeatures = {},
    totalTally
  ) => {
    // Flatten usedFeatures for easier comparison
    const flatUsedFeatures = flattenUsedFeatures(usedFeatures);
    const flatMissingFeatures = flattenMissingFeatures(missingFeatures);
    const listItems = [];
    const traverseConfig = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === "boolean") {
          const isInUsedFeatures = fullPath in flatUsedFeatures;
          const isInMissingFeatures = fullPath in flatMissingFeatures;
          listItems.push({
            name: fullPath,
            isInUsedFeatures,
            isInMissingFeatures,
          });
        } else if (typeof value === "object" && !Array.isArray(value)) {
          traverseConfig(value, fullPath);
        }
      });
    };
    traverseConfig(config);

    const groupedItems = groupConfigByParent(listItems);

    return Object.entries(groupedItems).map(
      ([section, items], sectionIndex) => (
        <li key={sectionIndex}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <StyledListSubheader>
              {section !== "Other" ? section : "Other"}
            </StyledListSubheader>
            {items.map((item, index) => {
              const percentage = item.isInUsedFeatures
                ? (flatUsedFeatures[item.name] / totalTally) * 100
                : 0;
              const { backgroundColor, textColor, percentColor, border } =
                getBackgroundAndTextColor(
                  item.isInUsedFeatures,
                  item.isInMissingFeatures,
                  percentage.toFixed(2)
                );
              // Extracting the last segment of the item's name for display
              const itemName = item.name.split(".").pop();
              return (
                <StyledListItem
                  key={index}
                  style={{
                    backgroundColor,
                    border: border,
                  }}
                >
                  <ListItemText
                    primary={itemName} // Displaying the last segment only
                    primaryTypographyProps={{
                      style: { color: textColor, fontSize: "0.875rem" },
                    }}
                  />
                  {item.isInUsedFeatures && (
                    <div style={{ marginLeft: "10px" }}>
                      <span
                        style={{
                          color: textColor,
                          backgroundColor: percentColor,
                          borderRadius: "15px",
                          padding: "5px 10px 5px 10px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {percentage.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </StyledListItem>
              );
            })}
          </ul>
        </li>
      )
    );
  };

  return (
    <div className="commonPage">
      <h2>Scheduler Customers</h2>
      <ListComponent
        data={CustomerData}
        onItemClick={(details, name) => toggleDrawer(true, details, name)()}
      />
      <StyledDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <IconButton
          onClick={toggleDrawer(false)}
          style={{ color: "var(--sidebar-text-color)", marginLeft: "auto" }}
        >
          <CloseIcon />
        </IconButton>
        <h2 style={{ color: "var(--sidebar-text-color)", paddingLeft: "10px" }}>
          {companyName}
        </h2>
        <Chip color="neutral" size="md" variant="solid" sx={{ margin: "5px" }}>
          app client IDs: {drawerContent?.app_client_ids?.length ?? 0}
        </Chip>
        <Chip
          color="neutral"
          size="md"
          variant="solid"
          sx={{
            margin: "5px",
            backgroundColor: drawerContent?.hosted ? "#FF6961" : "#7ABD7E",
          }}
        >
          hosted: {drawerContent?.hosted ? "Yes" : "No"}
        </Chip>
        <Chip
          color="neutral"
          size="md"
          variant="solid"
          sx={{
            margin: "5px",
            backgroundColor: drawerContent?.editor ? "#FF6961" : "#7ABD7E",
          }}
        >
          using editor: {drawerContent?.editor ? "Yes" : "No"}
        </Chip>
        <StyledList>
          {generateConfigListItems(
            completedV3Config.config,
            drawerContent?.used_features,
            drawerContent?.missing_features,
            drawerContent?.volume
          )}
        </StyledList>
      </StyledDrawer>
    </div>
  );
}

export default InsightsPage;
