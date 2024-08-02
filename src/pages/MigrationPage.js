import React, { useState, useEffect, lazy, Suspense } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Chip from "@mui/joy/Chip";

const CohortsList = lazy(() => import("../components/CohortsList"));

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
  fontSize: "1.15rem",
  backgroundColor: "var(--sidebar-color)",
  color: "white",
  paddingLeft: "10px",
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

function MigrationPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    // Defer loading the customer data
    const loadData = async () => {
      const data = await import("../data/enhanced-customer-mappings.json");
      setCustomerData(data.default);
    };
    loadData();
  }, []);

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

  const generateConfigListItems = (config = {}) => {
    const listItems = [];
    const traverseConfig = (obj, path = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === "number") {
          listItems.push({ name: fullPath });
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
              const itemName = item.name.split(".").pop();
              return (
                <StyledListItem
                  key={index}
                  style={{
                    backgroundColor: "var(--sidebar-item-selected-color)",
                    color: "white",
                  }}
                >
                  <ListItemText
                    primary={itemName}
                    primaryTypographyProps={{
                      style: { color: "white", fontSize: "0.875rem" },
                    }}
                  />
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
      <h2>Migration Cohorts</h2>
      {customerData ? (
        <Suspense fallback={<div>Loading CohortsList...</div>}>
          <CohortsList
            onItemClick={(details, name) => {
              setDrawerContent(details);
              setCompanyName(name);
              setDrawerOpen(true);
            }}
          />
        </Suspense>
      ) : (
        <div>Loading customer data...</div>
      )}
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
        <h3 style={{ color: "grey", paddingLeft: "10px" }}>
          Blocking Features
        </h3>
        <StyledList>
          {generateConfigListItems(drawerContent?.missing_features)}
        </StyledList>
      </StyledDrawer>
    </div>
  );
}

export default MigrationPage;
