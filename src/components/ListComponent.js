import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import "./ListComponent.css"; // Ensure this file exists and is correctly imported

// Icons
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

const ListComponent = ({ data, onItemClick }) => {
  const [sortState, setSortState] = useState({
    field: null,
    direction: "none", // 'none', 'ascending', 'descending'
  });

  const onSortChange = (key) => {
    if (sortState.field === key) {
      // Cycle through the sorting states: none -> ascending -> descending -> none
      const nextDirection =
        sortState.direction === "none"
          ? "ascending"
          : sortState.direction === "ascending"
          ? "descending"
          : "none";
      setSortState({ field: key, direction: nextDirection });
    } else {
      // If a new field is selected, start with ascending
      setSortState({ field: key, direction: "ascending" });
    }
  };

  // Sorting data based on the current sort state
  const sortedData =
    sortState.direction !== "none"
      ? Object.entries(data).sort(([aKey, aValue], [bKey, bValue]) => {
          if (aValue[sortState.field] < bValue[sortState.field]) {
            return sortState.direction === "ascending" ? -1 : 1;
          }
          if (aValue[sortState.field] > bValue[sortState.field]) {
            return sortState.direction === "ascending" ? 1 : -1;
          }
          return 0;
        })
      : Object.entries(data);

  // Determines the variant of the chip based on the current sorting state
  const getChipVariant = (key) => {
    if (sortState.field === key) {
      return sortState.direction === "ascending"
        ? "soft"
        : sortState.direction === "descending"
        ? "solid"
        : "outlined";
    }
    return "outlined";
  };

  const getChipStyle = (key) => {
    if (sortState.field === key) {
      switch (sortState.direction) {
        case "ascending":
          return {
            backgroundColor: "var(--sidebar-item-hover-color)", // Or any specific color for ascending
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "var(--sidebar-item-hover-color)", // Keep the same color on hover
            },
          };
        case "descending":
          return {
            backgroundColor: "var(--sidebar-item-selected-color)", // Or any specific color for descending
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "var(--sidebar-item-selected-color)", // Keep the same color on hover
            },
          };
        default:
          return {
            backgroundColor: "var(--sidebar-color)", // Default background color
            color: "var(--sidebar-text-color)",
            "&:hover": {
              backgroundColor: "var(--sidebar-color)", // Keep the default color on hover
            },
          };
      }
    } else {
      return {
        backgroundColor: "var(--sidebar-color)", // Default background color for not selected chips
        color: "var(--sidebar-text-color)",
        "&:hover": {
          backgroundColor: "var(--sidebar-color)", // Remove hover effect
        },
      };
    }
  };

  const getStartIcon = (key) => {
    let iconColor = "default"; // Default color
    if (sortState.field === key) {
      switch (sortState.direction) {
        case "ascending":
          iconColor = "white"; // Example color for ascending
          break;
        case "descending":
          iconColor = "white"; // Example color for descending
          break;
        default:
          iconColor = "var(--sidebar-text-color)"; // Default color
          break;
      }
    } else {
      iconColor = "var(--sidebar-text-color)";
    }

    switch (key) {
      case "ARR":
        return <AttachMoneyIcon color={iconColor} />;
      case "volume":
        return <DescriptionIcon color={iconColor} />;
      case "priority":
        return <PriorityHighIcon color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Stack
        direction="row"
        spacing={2}
        style={{ marginBottom: "10px", marginTop: "40px" }}
      >
        <Chip
          label="ARR"
          variant={getChipVariant("ARR")}
          onClick={() => onSortChange("ARR")}
          icon={getStartIcon("ARR")}
          sx={{
            ...getChipStyle("ARR"),
            height: "32px", // Reduce chip height
            ".MuiChip-icon": { fontSize: "18px" }, // Adjust icon size
          }}
        />
        <Chip
          label="Volume"
          variant={getChipVariant("volume")}
          onClick={() => onSortChange("volume")}
          icon={getStartIcon("volume")}
          sx={{
            ...getChipStyle("volume"),
            height: "32px", // Reduce chip height
            ".MuiChip-icon": { fontSize: "18px" }, // Adjust icon size
          }}
        />
        <Chip
          label="Priority"
          variant={getChipVariant("priority")}
          onClick={() => onSortChange("priority")}
          icon={getStartIcon("priority")}
          sx={{
            ...getChipStyle("priority"),
            height: "32px", // Reduce chip height
            ".MuiChip-icon": { fontSize: "18px" }, // Adjust icon size
          }}
        />
      </Stack>
      <div className="list-container">
        <div className="list-header">
          <span className="header-company-name">Company Name</span>
          <div className="header-data">
            <span>ARR</span>
            <span>Volume</span>
            <span>Missing Feature #</span>
            <span>Priority</span>
            <span>Outlook</span>
          </div>
        </div>
        {sortedData.map(([company, details]) => (
          <div
            key={details.public_id}
            className="list-item"
            onClick={() => onItemClick(details, company)}
          >
            <span className="item-company-name">{company}</span>
            <div className="item-data">
              <span>{details.ARR}</span>
              <span>{details.volume}</span>
              <span>{details.total_missing_features}</span>
              <span>{details.priority}</span>
              <span>{details.outlook}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListComponent;
