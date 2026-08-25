import React from "react";
import "./Footer.css";

export default function Footer({ themeMode }) {
  const isDark = themeMode === "dark";

  return (
    <footer className={`ngo-footer ${isDark ? "ngo-footer-dark" : "ngo-footer-light"}`}>
      <div className="ngo-footer-left">
        <span className="ngo-footer-ai-badge">AI POWERED</span>
        <span>FeedLink NGO Portal, Chattogram</span>
      </div>
      <div className="ngo-footer-right">
        FeedLink © 2026 • All Rights Reserved
      </div>
    </footer>
  );
}