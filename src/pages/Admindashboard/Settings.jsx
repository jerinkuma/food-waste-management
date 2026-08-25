import React from 'react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="page">
      <h1><span className="page-icon">⚙️</span> Settings</h1>
      <div className="settings-card">
        <div className="settings-section">
          <h3>Admin Profile</h3>
          <p><strong>Name:</strong> Fharia Elias</p>
          <p><strong>Email:</strong> admin@feedlink.com</p>
          <p><strong>Role:</strong> Administrator</p>
          <p><strong>Region:</strong> Chittagong, Bangladesh</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;