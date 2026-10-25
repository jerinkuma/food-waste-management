
import React, { useEffect, useState } from "react";
import { UserRound, Mail, ShieldCheck, MapPin, Phone, Leaf } from "lucide-react";
import "./Settings.css";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "Fharia Elias",
    email: "admin@feedlink.com",
    role: "Administrator",
    region: "Chittagong, Bangladesh",
    phone: "Not provided",
  });

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      setProfile((previous) => ({
        ...previous,
        name: user.name || user.fullName || previous.name,
        email: user.email || previous.email,
        role: user.role || previous.role,
        region: user.address || user.location || previous.region,
        phone: user.phone || user.phoneNumber || previous.phone,
      }));
    } catch (error) {
      console.error("Failed to load admin profile:", error);
    }
  }, []);

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="settings-page">


      <section className="settings-card">
        <div className="settings-cover">
          <div className="settings-cover-circle settings-cover-circle-one" />
          <div className="settings-cover-circle settings-cover-circle-two" />

          <div className="settings-cover-label">
            <span className="settings-status-dot" />
            Account Overview
          </div>
        </div>

        <div className="settings-profile-content">
          <div className="settings-profile-header">
            <div className="settings-avatar">{initials || "A"}</div>

            <div className="settings-profile-identity">
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <span className="settings-role-badge">
                <ShieldCheck size={15} />
                {profile.role}
              </span>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <div className="settings-section-heading">
              <div className="settings-section-icon">
                <UserRound size={20} />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Your account information at a glance</p>
              </div>
            </div>

            <div className="settings-info-grid">
              <div className="settings-info-item">
                <div className="settings-info-icon">
                  <UserRound size={19} />
                </div>
                <div className="settings-info-text">
                  <span>Full Name</span>
                  <p>{profile.name}</p>
                </div>
              </div>

              <div className="settings-info-item">
                <div className="settings-info-icon">
                  <Mail size={19} />
                </div>
                <div className="settings-info-text">
                  <span>Email Address</span>
                  <p>{profile.email}</p>
                </div>
              </div>

              <div className="settings-info-item">
                <div className="settings-info-icon">
                  <Phone size={19} />
                </div>
                <div className="settings-info-text">
                  <span>Phone Number</span>
                  <p>{profile.phone}</p>
                </div>
              </div>

              <div className="settings-info-item">
                <div className="settings-info-icon">
                  <MapPin size={19} />
                </div>
                <div className="settings-info-text">
                  <span>Region / Address</span>
                  <p>{profile.region}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-account-footer">
            <div className="settings-footer-icon">
              <Leaf size={20} />
            </div>

            <div>
              <h4>FeedLink Administrator</h4>
              <p>Helping communities reduce food waste and share food.</p>
            </div>

            <span className="settings-account-active">
              <span />
              Active
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Settings;
