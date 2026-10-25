import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

const API_BASE = 'http://localhost:5000/api/ngo';

export default function Settings({
  userProfile = {},
  setUserProfile = () => {},
  themeMode: externalThemeMode,
  themeModeSetter: externalSetThemeMode
}) {
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80";

  // Form State
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || 'Asha Foundation',
    ngoName: userProfile?.ngoName || 'Asha Foundation',
    email: userProfile?.email || 'asha@gmail.com',
    phone: userProfile?.phone || '0192367890',
    licenseNo: userProfile?.licenseNo || userProfile?.organizationId || '2223445',
    address: userProfile?.address || 'Chittagong, Bangladesh',
    avatar: userProfile?.avatar || DEFAULT_AVATAR
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  // Fetch real user settings from backend with correct per-user avatar & data
  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_BASE}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data) {
        const fetched = res.data;

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const activeAvatar = fetched.avatar || storedUser.image || storedUser.avatar || DEFAULT_AVATAR;

        setFormData(prev => ({
          ...prev,
          fullName: fetched.fullName || prev.fullName,
          ngoName: fetched.ngoName || prev.ngoName,
          email: fetched.email || prev.email,
          phone: fetched.phone || prev.phone,
          licenseNo: fetched.licenseNo || prev.licenseNo,
          address: fetched.address || prev.address,
          avatar: activeAvatar
        }));

        setUserProfile(prev => ({
          ...prev,
          fullName: fetched.fullName || prev?.fullName,
          ngoName: fetched.ngoName || prev?.ngoName,
          avatar: activeAvatar
        }));
      }
    } catch (err) {
      console.warn("Using current profile state.");
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  useEffect(() => {
    if (userProfile && Object.keys(userProfile).length > 0) {
      setFormData(prev => ({
        ...prev,
        fullName: userProfile.fullName || prev.fullName,
        ngoName: userProfile.ngoName || prev.ngoName,
        email: userProfile.email || prev.email,
        phone: userProfile.phone || prev.phone,
        licenseNo: userProfile.licenseNo || userProfile.organizationId || prev.licenseNo,
        address: userProfile.address || prev.address,
        avatar: userProfile.avatar || prev.avatar
      }));
    }
  }, [userProfile]);

  const [localTheme, setLocalTheme] = useState('dark');
  const isDark = (externalThemeMode || localTheme) === 'dark';

  const handleThemeToggle = (mode) => {
    if (typeof externalSetThemeMode === 'function') {
      externalSetThemeMode(mode);
    }
    setLocalTheme(mode);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG).');
        return;
      }
      setSelectedFile(file);
      const imagePreviewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: imagePreviewUrl }));
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, avatar: DEFAULT_AVATAR }));
  };

  // Profile Update Handler
  const handleProfileUpdate = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('ngoName', formData.ngoName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('licenseNo', formData.licenseNo);
      data.append('address', formData.address);

      if (selectedFile) {
        data.append('avatar', selectedFile);
      }

      const res = await axios.put(`${API_BASE}/settings/profile`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedData = res.data?.data || formData;
      const finalAvatar = updatedData.avatar || formData.avatar;

      // 1. Form State update
      setFormData(prev => ({
        ...prev,
        ...updatedData,
        avatar: finalAvatar
      }));

      setSelectedFile(null);

      // 2. Parent / Header State update
      if (typeof setUserProfile === 'function') {
        setUserProfile(prev => ({ ...prev, ...updatedData, avatar: finalAvatar }));
      }

      // 3. LocalStorage update
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newStoredUser = {
        ...storedUser,
        ...updatedData,
        name: updatedData.ngoName || updatedData.fullName || storedUser.name,
        ngoName: updatedData.ngoName || storedUser.ngoName,
        fullName: updatedData.fullName || storedUser.fullName,
        image: finalAvatar,
        avatar: finalAvatar
      };
      localStorage.setItem('user', JSON.stringify(newStoredUser));

      // 4. Trigger custom window event for header sync
      window.dispatchEvent(new Event("ngo_profile_updated"));

      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!passwordData.current) {
      alert('Please enter your current password.');
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      alert('New passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/settings/password`, {
        currentPassword: passwordData.current,
        newPassword: passwordData.newPass
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Password updated securely!');
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className={`settings-container ${isDark ? 'dark-mode' : 'light-mode'}`}>

      <div className="settings-card header-banner">
        <h2>System Settings & Configuration</h2>
      </div>

      <div className="settings-grid">

        <div className="settings-col-left">
          <div className="settings-card space-y">
            <div className="card-header">
              <h3>Organization & Profile Details</h3>
              <p className="sub-text">Update official identity and contact details</p>
            </div>

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

              <button
                type="submit"
                className="btn-primary"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>

        <div className="settings-col-right">

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