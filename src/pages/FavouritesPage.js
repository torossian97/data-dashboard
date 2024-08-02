import React from "react";
import "./CommonPage.css";
import DataProcessor from "../components/DataProcessor";
import MissingFeaturesProcessor from "../components/MissingFeaturesProcessor";
import CompleteFeatureProcessor from "../components/CompleteFeatureProcessor";
import CustomerDataSync from "../components/CustomerDataSync";

function FavouritesPage() {
  return (
    <div className="commonPage">
      <h2>Migration Board</h2>
      <DataProcessor /> {/* 1 - (use python instead now) parse Scheduler db txt file */}
      <MissingFeaturesProcessor /> {/* 2 - map missing features: */}
      <CompleteFeatureProcessor /> {/* 3 - map complete features: */}
      <CustomerDataSync /> {/* 4 - generates enhanced-customer-mappings.json*/}
    </div>
  );
}

export default FavouritesPage;
