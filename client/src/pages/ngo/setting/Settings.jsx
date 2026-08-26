import React, { useState } from 'react';
import './Settings.css';
export default function Settings({ 
  userProfile = {}, 
  setUserProfile = () => {}, 
  themeMode: externalThemeMode, 
   setThemeMode: externalSetThemeMode
}) {
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80";

  // Form State
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || 'NGO Representative 1',
    ngoName: userProfile?.ngoName || 'FeedLink Partner NGO',
    email: userProfile?.email || 'ngo1@feedlink.org',
    phone: userProfile?.phone || '+880 1812-345678',
    licenseNo: userProfile?.licenseNo || 'LIC-2026-9901',
    address: userProfile?.address || 'Chittagong, Bangladesh',
    avatar: userProfile?.avatar || DEFAULT_AVATAR
  });

  const [passwordData, setPasswordData] = useState({ 
    current: '', 
    newPass: '', 
    confirm: '' 
  });

  // Direct Theme State
  const [localTheme, setLocalTheme] = useState('dark');
  const isDark = (externalThemeMode || localTheme) === 'dark';

  const handleThemeToggle = (mode) => {
    if (typeof externalSetThemeMode === 'function') {
      externalSetThemeMode(mode);
    }
    setLocalTheme(mode);
  };

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG).');
        return;
      }
      const imagePreviewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: imagePreviewUrl }));
    }
  };

  // Remove Image
  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setUserProfile(formData);
    alert('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwordData.current) {
      alert('Please enter your current password.');
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated securely!');
    setPasswordData({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className={`settings-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
      
      {/* HEADER BANNER */}
      <div className="settings-card header-banner">
        <h2>System Settings & Configuration</h2>
      </div>

      {/* MAIN GRID */}
      <div className="settings-grid">
        
        {/* LEFT COLUMN: PROFILE & ORGANIZATION DETAILS */}
        <div className="settings-col-left">
          <div className="settings-card space-y">
            <div className="card-header">
              <h3>Organization & Profile Details</h3>
              <p className="sub-text">Update official identity and contact details</p>
            </div>

            {/* AVATAR UPLOAD & DELETE AREA */}
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="avatar-img" />
                ) : (
                  <span className="avatar-placeholder">
                    {formData.fullName?.charAt(0) || 'U'}
                  </span>
                )}
                
                <label className="avatar-overlay">
                  <span>Change</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="avatar-actions">
                <h4 className="section-title">Profile Image</h4>
                <div className="button-group">
                  <label className="btn-primary upload-btn">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="btn-danger"
                    >
                      Delete Photo
                    </button>
                  )}
                </div>
                <p className="hint-text">Supports JPG, PNG or WEBP</p>
              </div>
            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Representative Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>NGO / Organization</label>
                  <input 
                    type="text" 
                    value={formData.ngoName} 
                    onChange={(e) => setFormData({...formData, ngoName: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Registration / License ID</label>
                <input 
                  type="text" 
                  value={formData.licenseNo} 
                  onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary">
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: THEME SWITCHER & SECURITY */}
        <div className="settings-col-right">
          
          {/* THEME SWITCHER */}
          <div className="settings-card">
            <div className="card-header">
              <h3>Theme & Interface Appearance</h3>
              <p className="sub-text">Select application visual display mode</p>
            </div>
            
            <div className="theme-buttons">
              <button
                type="button"
                onClick={() => handleThemeToggle('light')}
                className={`theme-btn ${!isDark ? 'active' : ''}`}
              >
                ☀️ Light Theme
              </button>

              <button
                type="button"
                onClick={() => handleThemeToggle('dark')}
                className={`theme-btn ${isDark ? 'active' : ''}`}
              >
                🌙 Dark Theme
              </button>
            </div>
          </div>

          {/* SECURITY & PASSWORD */}
          <div className="settings-card">
            <div className="card-header">
              <h3>Security & Authentication</h3>
              <p className="sub-text">Manage account password and security credentials</p>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.newPass}
                  onChange={(e) => setPasswordData({...passwordData, newPass: e.target.value})}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-secondary">
                Update Password
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}