import React, { useState } from "react";
import { saveAs } from "file-saver";
import customerMappings from "../data/customer-mappings.json"; // Adjust the import path as needed
import usedFeaturesData from "../data/used-features.json";
import missingFeaturesData from "../data/missing-features.json";

function CustomerDataSync() {
  const [filteredData, setFilteredData] = useState({});

  // Helper function to deeply merge features, aggregating numeric values
  function aggregateFeatures(features, featureDetails) {
    Object.keys(featureDetails).forEach((key) => {
      if (key !== "total_tally") {
        if (
          typeof featureDetails[key] === "object" &&
          featureDetails[key] !== null
        ) {
          if (!features[key]) features[key] = {};
          aggregateFeatures(features[key], featureDetails[key]); // Recursive aggregation for nested objects
        } else if (typeof featureDetails[key] === "number") {
          if (!features[key]) features[key] = 0;
          features[key] += featureDetails[key]; // Aggregate numeric values
        } else {
          features[key] = featureDetails[key]; // Copy non-numeric, non-object values directly
        }
      }
    });
  }

  // Counts all fields with tallies in the aggregated features
  function countFeatureTallies(features) {
    return Object.keys(features).reduce((count, key) => {
      if (typeof features[key] === "object" && features[key] !== null) {
        return count + countFeatureTallies(features[key]); // Recursive count for nested objects
      }
      return count + 1; // Count each field with a tally
    }, 0);
  }

  const createFeatureMap = (featuresArray) => {
    return featuresArray.reduce((acc, featureObj) => {
      const [clientId, details] = Object.entries(featureObj)[0];
      acc[clientId] = details; // Direct assignment to avoid unnecessary deep copy here
      return acc;
    }, {});
  };

  const filterData = () => {
    const usedFeaturesMap = createFeatureMap(usedFeaturesData);
    const missingFeaturesMap = createFeatureMap(missingFeaturesData);

    let newData = Object.entries(customerMappings).reduce(
      (acc, [company, data]) => {
        let usedFeaturesAggregated = {};
        let missingFeaturesAggregated = {};
        let volume = 0; // Initialize volume as 0

        data.app_client_ids.forEach((clientId) => {
          if (usedFeaturesMap[clientId]) {
            volume += usedFeaturesMap[clientId].total_tally; // Sum up total_tally for volume
            aggregateFeatures(
              usedFeaturesAggregated,
              usedFeaturesMap[clientId]
            );
          }
          if (missingFeaturesMap[clientId]) {
            aggregateFeatures(
              missingFeaturesAggregated,
              missingFeaturesMap[clientId]
            );
          }
        });

        acc[company] = {
          ...data,
          volume, // Assign the summed volume
          total_used_features: countFeatureTallies(usedFeaturesAggregated),
          used_features: usedFeaturesAggregated,
          total_missing_features: countFeatureTallies(
            missingFeaturesAggregated
          ),
          missing_features: missingFeaturesAggregated,
          outlook:
            Object.keys(missingFeaturesAggregated).length === 0
              ? 0
              : Object.keys(missingFeaturesAggregated).length <= 3
              ? 1
              : 2,
        };
        return acc;
      },
      {}
    );

    setFilteredData(newData);
  };

  const downloadFilteredData = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "enhanced-customer-mappings.json");
  };

  return (
    <div>
      <button onClick={filterData}>Filter & Prepare Complete Data</button>
      <button
        onClick={downloadFilteredData}
        disabled={Object.keys(filteredData).length === 0}
      >
        Download Enhanced Customer Mappings
      </button>
    </div>
  );
}

export default CustomerDataSync;
