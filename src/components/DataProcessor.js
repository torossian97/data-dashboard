import React, { useState } from "react";

// this is to sync the initial Scheduler DB dump - the heaviest and hardest file to process

function DataProcessor() {
  const [processingResult, setProcessingResult] = useState("");

  const isValueValid = (value) => {
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "Submit"
    );
  };

  const aggregateData = (lines, ignoreList = []) => {
    const aggregatedData = {};

    const dynamicAggregate = (
      object,
      clientId,
      path = [],
      reverseTallyFields = ["additional_guests_hidden"]
    ) => {
      if (!aggregatedData[clientId]) {
        aggregatedData[clientId] = { total_tally: 0, reminders: {} };
      }

      Object.entries(object).forEach(([key, value]) => {
        const fullPath = [...path, key].join(".");
        if (
          ignoreList.includes(key) ||
          ignoreList.includes(fullPath) ||
          !isValueValid(value) // Check if value is valid before proceeding
        ) {
          return;
        }

        if (key === "reminders" && Array.isArray(value)) {
          value.forEach((reminder) => {
            Object.entries(reminder).forEach(([reminderKey, reminderValue]) => {
              if (!isValueValid(reminderValue)) return; // Check if reminderValue is valid

              const reminderPath = `${key}.${reminderKey}`;
              if (!aggregatedData[clientId][reminderPath]) {
                aggregatedData[clientId][reminderPath] = {};
              }
              aggregatedData[clientId][reminderPath][reminderValue] =
                (aggregatedData[clientId][reminderPath][reminderValue] || 0) +
                1;
            });
          });
        } else if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          dynamicAggregate(value, clientId, [...path, key], reverseTallyFields);
        } else {
          let ref = aggregatedData[clientId];
          for (let i = 0; i < path.length - 1; i++) {
            const segment = path[i];
            if (!ref[segment]) ref[segment] = {};
            ref = ref[segment];
          }

          const finalKey = path[path.length - 1];
          if (!ref[finalKey]) ref[finalKey] = {};

          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (!isValueValid(item)) return; // Check if item is valid

              const itemKey =
                typeof item === "object" && item !== null
                  ? JSON.stringify(item)
                  : item;
              ref[finalKey][itemKey] = (ref[finalKey][itemKey] || 0) + 1;
            });
          } else {
            if (reverseTallyFields.includes(fullPath)) {
              // Reverse tally logic
              const tallyValue = value === true ? 0 : 1;
              ref[finalKey][tallyValue] = (ref[finalKey][tallyValue] || 0) + 1;
            } else {
              ref[finalKey][value] = (ref[finalKey][value] || 0) + 1;
            }
          }
        }
      });
    };

    lines.forEach((line) => {
      if (!line) return;
      try {
        const jsonObject = JSON.parse(line);
        const clientId = jsonObject.app_client_id;
        if (!aggregatedData[clientId]) {
          aggregatedData[clientId] = { total_tally: 1, reminders: {} }; // Initialize here
        } else {
          aggregatedData[clientId].total_tally += 1; // Increment here for each page
        }
        dynamicAggregate(jsonObject.config, clientId);
      } catch (error) {
        console.error("Error parsing JSON line:", error);
      }
    });

    return aggregatedData;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const lines = e.target.result.split("\n").filter((line) => line.trim());
      const ignoreList = ["booking.opening_hours", "calendar_ids"];
      const aggregatedData = aggregateData(lines, ignoreList);

      setProcessingResult(JSON.stringify(aggregatedData, null, 2));
    };

    reader.readAsText(file);
  };

  const downloadResult = () => {
    const element = document.createElement("a");
    const file = new Blob([processingResult], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "aggregatedData.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {processingResult && (
        <>
          <button onClick={downloadResult}>Download Result</button>
          <pre>{processingResult}</pre>
        </>
      )}
    </div>
  );
}

export default DataProcessor;
