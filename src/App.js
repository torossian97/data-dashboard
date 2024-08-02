import React, { useState, lazy, Suspense, useTransition } from "react";
import Sidebar from "./components/Sidebar";
import "./App.css";

// Icons
import {
  DataObject,
  Insights,
  Layers,
  DirectionsBoat,
} from "@mui/icons-material";

// Pages
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const MigrationPage = lazy(() => import("./pages/MigrationPage"));
const ReleasePage = lazy(() => import("./pages/ReleasePage"));
//const FavouritesPage = lazy(() => import("./pages/FavouritesPage"));

const sections = [
  { label: "Customers", Icon: Insights, Page: <InsightsPage /> },
  { label: "Global Cohorts", Icon: Layers, Page: <MigrationPage /> },
  { label: "Release Cohorts", Icon: DirectionsBoat, Page: <ReleasePage /> },
  //{ label: "Data Pipeline", Icon: DataObject, Page: <FavouritesPage /> },
];

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Function to toggle sidebar state
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleSectionChange = (index) => {
    startTransition(() => {
      setActiveSection(index);
    });
  };

  return (
    <div className="App">
      <header className="App-header">{/* Header content */}</header>
      <div style={{ display: "flex", width: "100%" }}>
        <Sidebar
          sections={sections}
          setActiveSection={handleSectionChange}
          activeSection={activeSection}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          className="Sidebar"
        />
        <div
          style={{
            marginLeft: isSidebarCollapsed
              ? "var(--sidebar-collapsed-width)"
              : "var(--sidebar-width)",
          }}
          className="PageContent"
        >
          <Suspense fallback={<div>Loading...</div>}>
            {sections[activeSection].Page}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
