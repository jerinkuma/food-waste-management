import React from 'react';
import './Reports.css';

const Reports = () => {
  return (
    <div className="page">
      <h1><span className="page-icon">📈</span> Reports</h1>
      <div className="stats-grid">
        <div className="stat-card"><div className="label">Total Donations</div><div className="value">2,150</div><div className="sub">+65 this month</div></div>
        <div className="stat-card"><div className="label">Active Users</div><div className="value">280</div><div className="sub">+22 this week</div></div>
        <div className="stat-card"><div className="label">Food Distributed</div><div className="value">1,850 kg</div><div className="sub">across 52 NGOs</div></div>
        <div className="stat-card"><div className="label">Monthly Summary</div><div className="value">Aug 2026</div><div className="sub">450 donations</div></div>
      </div>
      <div className="report-placeholder">
        <p><i className="fas fa-chart-bar" style={{marginRight:'8px', color:'#1B5E20'}}></i> Charts will be integrated later.</p>
      </div>
    </div>
  );
};

export default Reports;