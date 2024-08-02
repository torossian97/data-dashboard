import React, { useState } from "react";
import { saveAs } from "file-saver";
import aggregatedData from "../data/aggregatedData.json";
import config from "../data/completedV3.json";

function CompleteFeatureProcessor() {
  const [filteredData, setFilteredData] = useState([]);

  const filterData = () => {
    const result = Object.entries(aggregatedData).map(
      ([clientId, clientData]) => {
        const filteredClientData = {
          total_tally: clientData.total_tally,
          ...filterObjectByConfig(clientData, config.config),
        };

        // Handle "reminders.delivery_method" if present
        if (clientData["reminders.delivery_method"]) {
          const reminders = processRemindersDeliveryMethod(
            clientData["reminders.delivery_method"]
          );
          if (Object.keys(reminders).length > 0) {
            filteredClientData["reminders"] = reminders;
          }
        }

        return { [clientId]: filteredClientData };
      }
    );

    setFilteredData(result);
  };

  const filterObjectByConfig = (data, conf, path = "") => {
    return Object.keys(data).reduce((acc, key) => {
      if (key === "reminders.delivery_method") return acc; // Skip "reminders.delivery_method"

      const fullPath = path ? `${path}.${key}` : key;
      const configValue = getValueByPath(conf, fullPath.split("."));

      // Adjust to include fields if configValue is explicitly true or false
      if (
        (configValue === true || configValue === false) &&
        key !== "total_tally"
      ) {
        if (isValidValue(data[key])) {
          acc[key] = processValue(data[key], fullPath);
        }
      } else if (typeof configValue === "object" && configValue !== null) {
        const filteredSubObject = filterObjectByConfig(
          data[key],
          conf,
          fullPath
        );
        if (Object.keys(filteredSubObject).length > 0) {
          acc[key] = filteredSubObject;
        }
      }
      return acc;
    }, {});
  };

  const processRemindersDeliveryMethod = (deliveryMethod) => {
    const processed = {};
    Object.keys(deliveryMethod).forEach((method) => {
      if (
        config.config.reminders &&
        config.config.reminders[method] === false
      ) {
        processed[method] = deliveryMethod[method];
      }
    });
    return processed;
  };

  const processValue = (value, path = "") => {
    // Special handling for booking.additional_fields
    if (path.endsWith("booking.additional_fields")) {
      // Find the maximum tally among additional_fields
      const maxTally = Object.values(value).reduce((max, currentTally) => {
        // Ensure currentTally is a number and compare it to the current max
        return Math.max(
          max,
          typeof currentTally === "number" ? currentTally : 0
        );
      }, 0);
      // Use the maximum tally found among additional_fields
      return maxTally;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const keys = Object.keys(value);
      if (
        keys.length === 2 &&
        keys.includes("true") &&
        keys.includes("false")
      ) {
        // Only count the value for the key "true" if both boolean keys are present
        return value["true"];
      }
      // Sum tallies for other objects
      return Object.values(value).reduce((sum, num) => sum + num, 0);
    }
    return value;
  };

  const getValueByPath = (object, pathArray) => {
    return pathArray.reduce((acc, key) => acc && acc[key], object);
  };

  const isValidValue = (value) => {
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 1 &&
      Object.keys(value)[0] === "false"
    ) {
      return false;
    }
    return !(
      value === null ||
      value === undefined ||
      value === "" ||
      value === 0 ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  };

  const downloadFilteredData = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "used-features.json");
  };

  return (
    <div>
      <button onClick={filterData}>Filter & Prepare Complete Data</button>
      <button
        onClick={downloadFilteredData}
        disabled={filteredData.length === 0}
      >
        Download Filtered Data
      </button>
    </div>
  );
}

export default CompleteFeatureProcessor;
