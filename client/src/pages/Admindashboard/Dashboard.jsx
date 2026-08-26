import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const data = fetchDashboardStats();
    setStats(data);
    setActivities(data.recentActivities || []);
  }, []);

  return (
    <div className="page">
      <h1><span className="page-icon">📊</span> Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><div className="label">Total Users</div><div className="value">{stats.totalUsers}</div><div className="sub">+25 this week</div></div>
        <div className="stat-card"><div className="label">Donations</div><div className="value">{stats.totalDonations}</div><div className="sub">{stats.availableFood} available</div></div>
        <div className="stat-card"><div className="label">Pending</div><div className="value">{stats.pendingDonations}</div><div className="sub">need approval</div></div>
        <div className="stat-card"><div className="label">Feedback</div><div className="value">{stats.feedbackCount}</div><div className="sub">{stats.reportsCount} reports</div></div>
      </div>
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {activities.map(act => (
            <li key={act.id}><span>{act.text}</span> <small>{act.time}</small></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;