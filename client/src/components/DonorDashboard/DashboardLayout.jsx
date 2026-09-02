import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("donor-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "donor-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  return (
    <div
      className={`donor-dashboard-layout ${
        isDark ? "dark" : ""
      }`}
    >
      <Sidebar />

      <main className="donor-dashboard-main">
        <Topbar
          isDark={isDark}
          setIsDark={setIsDark}
        />

        <div className="donor-dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;