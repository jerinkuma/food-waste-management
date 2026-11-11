import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Building, Mail, Phone, FileText, Lock, Camera, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import "./Settings.css";

import { API_URL, API_BASE_URL } from "../../../config";

const API_BASE = `${API_URL}/ngo`;

export default function Settings() {
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("blob:")) {
      return image;
    }
    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // States
  const [formData, setFormData] = useState({
    fullName: "",
    ngoName: "",
    email: "",
    phone: "",
    licenseNo: "",
    address: "",
    avatar: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser) {
          setFormData({
            fullName: storedUser.fullName || storedUser.name || "",
            ngoName: storedUser.ngoName || storedUser.name || "",
            email: storedUser.email || "",
            phone: storedUser.phone || "",
            licenseNo: storedUser.licenseNo || storedUser.organizationId || "",
            address: storedUser.address || "",
            avatar: getImageUrl(storedUser.avatar || storedUser.image),
          });
        }
      } catch (e) {
        console.error("Error reading stored user:", e);
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          const fetched = res.data.data || res.data;
          const activeAvatar = getImageUrl(fetched.avatar || fetched.image);

          setFormData({
            fullName: fetched.fullName || fetched.name || "",
            ngoName: fetched.ngoName || fetched.name || "",
            email: fetched.email || "",
            phone: fetched.phone || "",
            licenseNo: fetched.licenseNo || fetched.organizationId || "",
            address: fetched.address || "",
            avatar: activeAvatar,
          });
        }
      } catch (err) {
        console.warn("Backend settings fetch error:", err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Image selection handler
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG).");
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    }
  };

  // Remove Avatar handler
  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  // Profile Update Handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login session expired, please log in again.");
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("ngoName", formData.ngoName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("licenseNo", formData.licenseNo);
      data.append("address", formData.address);

      if (selectedFile) {
        data.append("avatar", selectedFile);
      } else if (formData.avatar === "") {
        data.append("avatar", "");
      }

      const res = await axios.put(`${API_BASE}/settings/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedData = res.data?.data || res.data || {};
      const finalAvatar = getImageUrl(updatedData.avatar || updatedData.image || formData.avatar);

      const newProfileState = {
        ...formData,
        ...updatedData,
        avatar: finalAvatar,
      };

      setFormData(newProfileState);
      setSelectedFile(null);

      // Update LocalStorage and trigger events for instant header & sidebar sync
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const newStoredUser = {
        ...storedUser,
        ...updatedData,
        name: updatedData.ngoName || updatedData.fullName || storedUser.name,
        ngoName: updatedData.ngoName || storedUser.ngoName,
        fullName: updatedData.fullName || storedUser.fullName,
        image: finalAvatar,
        avatar: finalAvatar,
      };
      localStorage.setItem("user", JSON.stringify(newStoredUser));

      window.dispatchEvent(new Event("ngo_profile_updated"));
      window.dispatchEvent(new Event("storage"));

      setSuccessMsg("Profile successfully updated and saved permanently!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Password Update Handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPassMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMsg({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPassMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setPassLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPassMsg({ type: "error", text: "Login session not found." });
        setPassLoading(false);
        return;
      }

      await axios.put(
        `${API_BASE}/settings/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPassMsg({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPassMsg({ type: "", text: "" }), 4000);
    } catch (err) {
      setPassMsg({
        type: "error",
        text: err.response?.data?.message || "Password update failed. Please check your current password.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  const initialChar = formData.ngoName?.charAt(0) || formData.fullName?.charAt(0) || "N";

  return (
    <div className="settings-page-wrapper">
      <div className="settings-hero-header">
        <h2>Account & Organization Settings</h2>
        <p>Manage your profile information, avatar, and security credentials from here.</p>
      </div>

      {successMsg && (
        <div className="alert-toast success">
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert-toast error">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {profileLoading ? (
        <div className="settings-loader">
          <Loader2 className="animate-spin" size={32} /> Loading...
        </div>
      ) : (
        <div className="settings-main-grid">
          {/* Left Box: Profile Info & Avatar Card */}
          <div className="settings-card gorgeous-card">
            <div className="card-top-title">
              <h3>Profile & Organization Details</h3>
              <span>Official Details</span>
            </div>

            {/* Avatar Section */}
            <div className="profile-avatar-banner">
              <div className="avatar-preview-container">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="actual-avatar-img" />
                ) : (
                  <div className="initial-letter-circle">
                    {initialChar.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="avatar-action-controls">
                <label className="btn-upload-file">
                  <Camera size={16} /> Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {formData.avatar && (
                  <button type="button" onClick={handleRemoveAvatar} className="btn-remove-file">
                    <Trash2 size={16} /> Delete Photo
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="modern-form-grid">
              <div className="input-group">
                <label><User size={15} /> Representative Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="input-group">
                <label><Building size={15} /> NGO / Organization Name</label>
                <input
                  type="text"
                  value={formData.ngoName}
                  onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="input-group">
                <label><Mail size={15} /> Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="input-group">
                <label><Phone size={15} /> Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="input-group full-span">
                <label><FileText size={15} /> License / Registration ID</label>
                <input
                  type="text"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                  placeholder="Enter official license number"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-save-changes">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Right Box: Password Security Card */}
          <div className="settings-card gorgeous-card">
            <div className="card-top-title">
              <h3>Security & Password</h3>
              <span>Change Password</span>
            </div>

            {passMsg.text && (
              <div className={`alert-toast ${passMsg.type}`}>
                {passMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="modern-form-grid">
              <div className="input-group full-span">
                <label><Lock size={15} /> Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="input-group full-span">
                <label><Lock size={15} /> New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="input-group full-span">
                <label><Lock size={15} /> Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" disabled={passLoading} className="btn-password-update">
                {passLoading ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}